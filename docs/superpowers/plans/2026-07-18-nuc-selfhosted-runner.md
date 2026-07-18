# NUC Self-Hosted Runner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Przenieść codzienny scrape monitora PSXPlace z runnerów GitHuba (datacenter IP → CF_BLOCKED) na self-hosted runner w kontenerze na NUC-u użytkownika (residential IP), w trybie wake-window.

**Architecture:** Jeden stack docker-compose w Portainerze: Ofelia (always-on, ~10 MB) budzi codziennie 05:55 UTC kontener runnera (obraz własny na bazie `myoung34/github-runner` z wypieczonym Node 22, Camoufoxem i Xvfb), runner z `EPHEMERAL=1` odbiera job crona GitHuba (06:00 UTC), wykonuje go i gaśnie. Workflow zmienia tylko `runs-on` + usuwa kroki pokryte obrazem.

**Tech Stack:** GitHub Actions (self-hosted), Docker/docker-compose, Portainer, `myoung34/github-runner:ubuntu-jammy`, `mcuadros/ofelia`, Node 22, Camoufox, Xvfb.

**Spec:** `docs/superpowers/specs/2026-07-18-nuc-selfhosted-runner-design.md`

## Global Constraints

- Repo: `https://github.com/DoSpamu/RPCS3toArtemisPatches` (PUBLICZNE — patrz sekcja Bezpieczeństwo speca).
- Etykieta runnera: dokładnie `psxplace`; nazwa runnera: dokładnie `psxplace-runner`.
- Harmonogram: cron GitHuba `0 6 * * *` (bez zmian); Ofelia budzi runner `05:55 UTC`.
- Runner: `EPHEMERAL=1`, `RUN_AS_ROOT=false`, `mem_limit: 2g`, `cpus: 1.5`, bez montowania `docker.sock` (docker.sock dostaje TYLKO Ofelia).
- Baza obrazu: `myoung34/github-runner:ubuntu-jammy` (klasyczne nazwy pakietów lib*, bez sufiksów t64 z noble).
- Logika scrapera (`scripts/check_psxplace.js`) NIE zmienia się w tym planie poza tym, co już jest na gałęzi `fix/turnstile-click`.
- Exit-kody scrapera (2 = CF_BLOCKED, 3 = SCRAPE_EMPTY, 1 = crash) i krok re-raise w workflow zostają bez zmian.
- Na maszynie deweloperskiej (Windows) NIE MA Dockera — build i testy obrazu wykonuje się na NUC-u (Task 6). Lokalnie walidujemy YAML przez `npx --yes js-yaml@4`.
- Na gałęzi `fix/turnstile-click` wiszą zastage'owane, NIEZACOMMITOWANE zmiany (revert) — Task 1 je odrzuca. Nie commitować ich.
- Commity zwykłe (bez `--amend`), wiadomości po angielsku w konwencji repo (`feat:`, `docs:`, `ci:`).

---

### Task 1: Odrzuć wiszący revert i zmerguj PR #7 do mastera

Kod kliku Turnstile z PR #7 staje się użyteczny z residential IP (checkbox się pojawia — z datacenter IP nie istniał). Zastage'owany revert na gałęzi to porzucona robota z wcześniejszej sesji — do wyrzucenia.

**Files:**
- Modify: brak edycji plików — operacje czysto gitowe.

**Interfaces:**
- Consumes: gałąź `fix/turnstile-click` (HEAD zawiera `solveTurnstile()`, `challengeCleared()`, spec + plan docs).
- Produces: master z kodem Turnstile — Task 2 edytuje `.github/workflows/check-psxplace.yml` w wersji z krokiem Xvfb; Taski 3–5 tworzą pliki na nowej gałęzi od tego mastera.

- [ ] **Step 1: Sprawdź stan wyjściowy**

Run: `git status --short`
Expected: dokładnie te trzy pliki jako staged (M):
```
M  .github/workflows/check-psxplace.yml
M  scripts/check_psxplace.js
M  scripts/check_psxplace.test.js
```
Jeśli widzisz coś innego — STOP, zapytaj użytkownika.

- [ ] **Step 2: Odrzuć zastage'owany revert**

```bash
git restore --staged .github/workflows/check-psxplace.yml scripts/check_psxplace.js scripts/check_psxplace.test.js
git checkout -- .github/workflows/check-psxplace.yml scripts/check_psxplace.js scripts/check_psxplace.test.js
```

Run: `git status --short`
Expected: pusto (czyste drzewo robocze).

- [ ] **Step 3: Testy na gałęzi przed merge'em**

Run: `npm test`
Expected: oba pakiety zielone (convert + monitor), exit 0.

- [ ] **Step 4: Wypchnij gałąź (commity speca/planu) i zmerguj PR #7**

```bash
git push origin fix/turnstile-click
gh pr merge 7 --merge
```

Expected: PR #7 zmergowany do mastera (merge commit, jak PR #6 w historii repo).

- [ ] **Step 5: Zaktualizuj lokalny master i zweryfikuj**

```bash
git checkout master
git pull origin master
npm test
```

Run: `git log --oneline -3`
Expected: merge commit PR #7 na szczycie; `npm test` zielone.
Run: `grep -c "solveTurnstile" scripts/check_psxplace.js`
Expected: liczba ≥ 1 (kod Turnstile jest na masterze).

---

### Task 2: Workflow na self-hosted runner

Workflow po merge'u PR #7 ma kroki `actions/setup-node` i `apt-get install xvfb` — oba pokrywa obraz z Taska 3. Zmiana `runs-on` kieruje job na NUC-a. Czerwone runy między wdrożeniem tej zmiany a uruchomieniem NUC-a (job w kolejce 24 h → fail) są akceptowalne — dziś i tak każdy run jest czerwony (CF_BLOCKED).

**Files:**
- Modify: `.github/workflows/check-psxplace.yml`

**Interfaces:**
- Consumes: master po Tasku 1 (workflow z krokiem Xvfb).
- Produces: workflow z `runs-on: [self-hosted, psxplace]` — etykieta musi być identyczna z `LABELS: psxplace` w compose (Task 4).

- [ ] **Step 1: Utwórz gałąź roboczą**

```bash
git checkout -b feat/nuc-runner master
```

- [ ] **Step 2: Edytuj workflow**

W `.github/workflows/check-psxplace.yml` wykonaj dokładnie trzy zmiany:

(a) Podmień linię `runs-on`:
```yaml
    runs-on: [self-hosted, psxplace]
```
(zamiast `runs-on: ubuntu-latest`)

(b) Usuń w całości krok setup-node:
```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
```

(c) Usuń w całości krok Xvfb:
```yaml
      - name: Install Xvfb (virtual display for headed Camoufox)
        run: sudo apt-get update && sudo apt-get install -y xvfb
```

(d) Zmień nazwę kroku Camoufox (dokumentuje mechanizm samonaprawy):
```yaml
      - name: Install Camoufox browser (no-op if baked version is current)
        run: npx camoufox fetch
```

Wszystkie pozostałe kroki (checkout, npm ci, npm test, scrape z `id: scrape` + `continue-on-error`, commit na master, krok re-raise) zostają BEZ ZMIAN.

- [ ] **Step 3: Walidacja składni YAML**

Run: `npx --yes js-yaml@4 .github/workflows/check-psxplace.yml > /dev/null; echo $?`
Expected: `0` (poprawny YAML, brak błędów parsowania).

- [ ] **Step 4: Weryfikacja treści**

Run: `grep -n "runs-on\|setup-node\|xvfb\|Xvfb" .github/workflows/check-psxplace.yml`
Expected: jedna linia `runs-on: [self-hosted, psxplace]`; ZERO trafień dla `setup-node` i `xvfb`/`Xvfb`.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/check-psxplace.yml
git commit -m "ci: run PSXPlace monitor on self-hosted NUC runner (label psxplace)"
```

---

### Task 3: Obraz runnera (Dockerfile)

Wypiekamy w obraz wszystko, co job dotąd instalował co run: Node 22 (NodeSource), biblioteki GTK Firefoksa, Xvfb (pod `headless:'virtual'` kliku Turnstile), binarkę Camoufoxa i rozgrzany cache npm. Cache'e Camoufoxa/npm muszą wylądować w `$HOME` użytkownika `runner` (uid 1000 w obrazie myoung34), bo z `RUN_AS_ROOT=false` job działa jako `runner` i tam ich szuka.

**Files:**
- Create: `deploy/nuc-runner/Dockerfile`

**Interfaces:**
- Consumes: `package.json` + `package-lock.json` z korzenia repo (build context = korzeń repo).
- Produces: obraz `psxplace-runner:latest` — Task 4 odwołuje się do niego w compose; Task 6 buduje go na NUC-u komendą `docker build -f deploy/nuc-runner/Dockerfile -t psxplace-runner:latest .`

- [ ] **Step 1: Utwórz Dockerfile**

Utwórz `deploy/nuc-runner/Dockerfile` o dokładnie tej treści:

```dockerfile
# Runner image for the PSXPlace monitor (wake-window self-hosted runner).
# Design: docs/superpowers/specs/2026-07-18-nuc-selfhosted-runner-design.md
#
# Build from the REPO ROOT (context must include package*.json):
#   docker build -f deploy/nuc-runner/Dockerfile -t psxplace-runner:latest .
FROM myoung34/github-runner:ubuntu-jammy

# Node 22 via NodeSource — the workflow uses this instead of actions/setup-node.
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/*

# Firefox (Camoufox) runtime libs + Xvfb for headless:'virtual' (Turnstile click).
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      xvfb libgtk-3-0 libdbus-glib-1-2 libasound2 libx11-xcb1 libxt6 libpci3 \
 && rm -rf /var/lib/apt/lists/*

# Bake the Camoufox browser and warm the npm cache for the "runner" user
# (with RUN_AS_ROOT=false the job runs as "runner"; caches are read from its HOME).
# "npx camoufox fetch" in the workflow is then a no-op until a newer Camoufox
# build is released — at which point the job downloads it (self-healing) and the
# ~200 MB download in the run log is the signal to rebuild this image.
COPY package.json package-lock.json /tmp/bake/
RUN chown -R runner:runner /tmp/bake
USER runner
RUN cd /tmp/bake \
 && HOME=/home/runner npm ci --no-audit --no-fund \
 && HOME=/home/runner npx camoufox fetch \
 && rm -rf /tmp/bake
USER root
```

- [ ] **Step 2: Walidacja lokalna (bez Dockera na tej maszynie)**

Run: `grep -c "ubuntu-jammy\|RUN_AS_ROOT\|camoufox fetch" deploy/nuc-runner/Dockerfile`
Expected: ≥ 3 trafienia (baza jammy, komentarz o RUN_AS_ROOT, krok fetch).
Pełny build i test obrazu odbywa się na NUC-u w Tasku 6 — tu tylko sanity treści.

- [ ] **Step 3: Commit**

```bash
git add deploy/nuc-runner/Dockerfile
git commit -m "feat(deploy): NUC runner image with baked Node 22, Camoufox and Xvfb"
```

---

### Task 4: Stack docker-compose (Ofelia + runner)

Ofelia to jedyny proces always-on; jej wpis `job-run` z parametrem `container` robi `docker start` na istniejącym, zatrzymanym kontenerze runnera — dzięki temu cała konfiguracja runnera (env, limity, sieć) żyje w definicji serwisu compose, a nie w labelkach Ofelii. Ofelia dostaje docker.sock (musi startować kontenery); runner NIE.

**Files:**
- Create: `deploy/nuc-runner/docker-compose.yml`

**Interfaces:**
- Consumes: obraz `psxplace-runner:latest` (Task 3); zmienna środowiskowa stacka `ACCESS_TOKEN` (fine-grained PAT — podawana w UI Portainera, Task 6).
- Produces: kontener o nazwie `psxplace-runner` (nazwa używana przez labelkę Ofelii i przez komendy weryfikacyjne Taska 6); runner z etykietą `psxplace` zgodną z `runs-on` z Taska 2.

- [ ] **Step 1: Utwórz docker-compose.yml**

Utwórz `deploy/nuc-runner/docker-compose.yml` o dokładnie tej treści:

```yaml
# PSXPlace monitor — wake-window self-hosted runner stack (Portainer).
# Design: docs/superpowers/specs/2026-07-18-nuc-selfhosted-runner-design.md
#
# ACCESS_TOKEN = fine-grained PAT scoped to this single repo with ONLY the
# "Administration: Read and write" permission (runner registration). Supply it
# as a stack environment variable in Portainer — NEVER commit it.
services:
  ofelia:
    image: mcuadros/ofelia:latest
    container_name: psxplace-ofelia
    restart: unless-stopped
    command: daemon --docker
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    labels:
      # Ofelia cron has 6 fields (seconds first); container TZ is UTC.
      # 05:55 UTC = 5 minutes before the GitHub cron (06:00 UTC). Order is
      # forgiving either way: a queued job is picked up on registration, and
      # an early runner just listens until the job arrives.
      ofelia.job-run.wake-runner.schedule: "0 55 5 * * *"
      ofelia.job-run.wake-runner.container: "psxplace-runner"
    mem_limit: 64m

  runner:
    image: psxplace-runner:latest
    container_name: psxplace-runner
    # Wake-window: Ofelia starts this container daily; EPHEMERAL makes the
    # runner deregister and the container exit after one job. No restart.
    restart: "no"
    environment:
      RUNNER_NAME: psxplace-runner   # visible in public run logs — keep neutral
      RUNNER_SCOPE: repo
      REPO_URL: https://github.com/DoSpamu/RPCS3toArtemisPatches
      ACCESS_TOKEN: ${ACCESS_TOKEN}
      LABELS: psxplace               # must match runs-on in check-psxplace.yml
      EPHEMERAL: "1"
      RUN_AS_ROOT: "false"
    mem_limit: 2g
    cpus: 1.5
    networks:
      - runner-net

networks:
  runner-net:
    driver: bridge
```

- [ ] **Step 2: Walidacja składni YAML**

Run: `npx --yes js-yaml@4 deploy/nuc-runner/docker-compose.yml > /dev/null; echo $?`
Expected: `0`.

- [ ] **Step 3: Weryfikacja spójności etykiet**

Run: `grep -n "psxplace" .github/workflows/check-psxplace.yml deploy/nuc-runner/docker-compose.yml`
Expected: `runs-on: [self-hosted, psxplace]` w workflow ORAZ `LABELS: psxplace` + `container_name: psxplace-runner` + labelka `ofelia.job-run.wake-runner.container: "psxplace-runner"` w compose — nazwy identyczne co do znaku.

- [ ] **Step 4: Commit**

```bash
git add deploy/nuc-runner/docker-compose.yml
git commit -m "feat(deploy): Ofelia wake-window compose stack for NUC runner"
```

---

### Task 5: README wdrożeniowe + wzmianka w CLAUDE.md

README jest jedyną instrukcją dla przyszłego siebie (reinstalacja NUC-a, wygasły PAT, rebuild obrazu) — musi być kompletne i samodzielne.

**Files:**
- Create: `deploy/nuc-runner/README.md`
- Modify: `CLAUDE.md` (sekcja "PSXPlace thread monitor", pierwszy akapit)

**Interfaces:**
- Consumes: nazwy/komendy z Tasków 2–4 (etykieta `psxplace`, obraz `psxplace-runner:latest`, kontener `psxplace-runner`).
- Produces: procedury operatorskie wykonywane w Tasku 6.

- [ ] **Step 1: Utwórz README.md**

Utwórz `deploy/nuc-runner/README.md` o dokładnie tej treści:

````markdown
# Monitor PSXPlace na NUC-u — self-hosted runner (wake-window)

Codzienny scrape wątku PSXPlace działa na NUC-u (residential IP omija blokadę
Cloudflare, która od 2026-07-07 zabija runnery GitHuba). Projekt:
`docs/superpowers/specs/2026-07-18-nuc-selfhosted-runner-design.md`.

Jak to działa: kontener `psxplace-ofelia` (always-on, ~10 MB) codziennie o
**05:55 UTC** startuje kontener `psxplace-runner`. Runner rejestruje się w repo
(ephemeral), odbiera job crona GitHuba (06:00 UTC), wykonuje go i gaśnie.
Zużycie idle NUC-a: tylko Ofelia.

## Wymagania

- Docker + docker-compose na NUC-u, Portainer.
- Fine-grained PAT (patrz niżej).
- ~2,5 GB dysku na obraz.

## 1. Fine-grained PAT (rejestracja runnera)

GitHub → Settings (profil) → Developer settings → Fine-grained tokens →
Generate new token:

- **Repository access:** Only select repositories → `RPCS3toArtemisPatches`.
- **Permissions → Repository:** Administration = **Read and write**. NIC więcej.
- **Expiration:** max (1 rok). Zapisz przypomnienie o odnowieniu — wygasły PAT
  = runner się nie zarejestruje = job wisi w kolejce 24 h i failuje (dostaniesz
  maila z GitHuba).

PAT służy WYŁĄCZNIE do rejestracji runnera. Push do repo robi wbudowany
`GITHUB_TOKEN` joba.

## 2. Ustawienia repo (jednorazowo, hardening)

Repo → Settings → Actions → General:

- **Fork pull request workflows:** "Require approval for **all** outside
  collaborators".
- Sprawdź, że tylko `check-psxplace.yml` używa `runs-on: [self-hosted, psxplace]`
  (żaden workflow odpalany przez PR nie może celować w self-hosted).

## 3. Build obrazu (na NUC-u)

```bash
git clone https://github.com/DoSpamu/RPCS3toArtemisPatches.git
cd RPCS3toArtemisPatches
docker build -f deploy/nuc-runner/Dockerfile -t psxplace-runner:latest .
```

Kontekst buildu MUSI być korzeniem repo (Dockerfile kopiuje `package*.json`).

## 4. Deploy stacka w Portainerze

Portainer → Stacks → Add stack → nazwa `psxplace-runner` → wklej zawartość
`docker-compose.yml` z tego katalogu → w sekcji **Environment variables** dodaj
`ACCESS_TOKEN` = PAT z kroku 1 → Deploy.

Po deployu kontener runnera startuje od razu (jednorazowo) — wykorzystaj to
okno na test z kroku 5. Po pierwszym jobie zgaśnie i dalej budzi go już tylko
Ofelia.

## 5. Test wdrożenia

1. Repo → Settings → Actions → Runners: `psxplace-runner` widoczny jako Idle.
2. Actions → "Check PSXPlace Thread" → Run workflow (workflow_dispatch).
3. Oczekiwane: job rusza na runnerze w ciągu minuty; log scrape'a pokazuje
   przejście challenge'u (samoistne albo po kliku Turnstile) i "Found N posts";
   run zielony.
4. `docker ps -a` na NUC-u: `psxplace-runner` w stanie Exited (ephemeral zszedł
   po jobie).
5. Następnego dnia po 06:00 UTC: run z crona zielony, kontener znów Exited.

## Utrzymanie

- **Rebuild obrazu** (gdy log runa pokazuje, że `npx camoufox fetch` pobiera
  ~200 MB — wyszła nowa wersja przeglądarki):
  `git -C RPCS3toArtemisPatches pull && docker build -f RPCS3toArtemisPatches/deploy/nuc-runner/Dockerfile -t psxplace-runner:latest RPCS3toArtemisPatches`
  Stack w Portainerze podniesie nowy obraz przy następnym starcie kontenera.
- **Zmiana godziny:** labelka `ofelia.job-run.wake-runner.schedule` w compose
  (6 pól, sekundy najpierw, UTC) + cron w `.github/workflows/check-psxplace.yml`.
- **Rollback na runnery GitHuba:** w workflow przywróć `runs-on: ubuntu-latest`
  oraz kroki `actions/setup-node` i instalację xvfb (git log `ci:` z 2026-07-18).

## Opcjonalne wzmocnienie: odcięcie LAN-u

Bridge izoluje runner od innych kontenerów, ale NIE od sieci domowej. Żeby
odciąć LAN (zostawić tylko internet), dodaj na hoście regułę (przykład dla
podsieci dockera 172.x i LAN-u 192.168.0.0/16):

```bash
iptables -I DOCKER-USER -s 172.16.0.0/12 -d 192.168.0.0/16 -j DROP
```

Uwaga: reguła jest globalna dla kontenerów — jeśli inne stacki mają gadać
z LAN-em, zawęź `-s` do podsieci sieci `runner-net` (`docker network inspect`).
````

- [ ] **Step 2: Wzmianka w CLAUDE.md**

W `CLAUDE.md`, w sekcji `## PSXPlace thread monitor (scripts/check_psxplace.js)`, podmień pierwszy akapit:

Stary tekst (fragment): `Daily automation (GitHub Actions, cron 06:00 UTC, .github/workflows/check-psxplace.yml) that scrapes PSXPlace thread #49905 via Camoufox (Cloudflare-resistant Firefox).`

Nowy tekst: `Daily automation (GitHub Actions, cron 06:00 UTC, .github/workflows/check-psxplace.yml) that scrapes PSXPlace thread #49905 via Camoufox (Cloudflare-resistant Firefox). Since 2026-07 the job runs on a self-hosted runner (label psxplace) on the user's home NUC — datacenter IPs are Cloudflare-blocked; deployment docs in deploy/nuc-runner/.`

- [ ] **Step 3: Weryfikacja**

Run: `npx --yes js-yaml@4 deploy/nuc-runner/docker-compose.yml > /dev/null; echo $?`
Expected: `0` (compose nadal poprawny — README nie mógł go zepsuć, to czysty sanity re-check przed commitem całego katalogu).
Run: `grep -c "deploy/nuc-runner" CLAUDE.md`
Expected: `1`.

- [ ] **Step 4: Commit i PR**

```bash
git add deploy/nuc-runner/README.md CLAUDE.md
git commit -m "docs(deploy): NUC runner deployment guide; note self-hosted runner in CLAUDE.md"
git push -u origin feat/nuc-runner
gh pr create --title "feat: move PSXPlace monitor to self-hosted NUC runner (wake-window)" --body "$(cat <<'EOF'
Moves the daily PSXPlace scrape to a self-hosted runner on the home NUC (residential IP beats the Cloudflare datacenter-IP block active since 2026-07-07).

- workflow: runs-on [self-hosted, psxplace]; setup-node and xvfb steps replaced by the baked image
- deploy/nuc-runner/: Dockerfile (Node 22 + Camoufox + Xvfb baked), Ofelia wake-window compose stack, deployment guide
- design spec: docs/superpowers/specs/2026-07-18-nuc-selfhosted-runner-design.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR utworzony. Po review użytkownika: `gh pr merge --merge`.

---

### Task 6: Wdrożenie i weryfikacja (kroki operatorskie — GitHub UI + NUC)

Ten task wykonuje użytkownik (lub agent z dostępem do NUC-a przez SSH/wmux). Wszystkie procedury są w `deploy/nuc-runner/README.md` — poniżej kolejność i kryteria zaliczenia.

**Files:** brak zmian w repo (operacje na GitHub UI i NUC-u).

**Interfaces:**
- Consumes: zmergowany PR z Taska 5 (pliki `deploy/nuc-runner/*` na masterze), workflow z Taska 2.
- Produces: działający, zweryfikowany monitor — kryterium końcowe planu.

- [ ] **Step 1: Hardening repo (GitHub UI)** — README sekcja 2. Expected: "Require approval for all outside collaborators" zaznaczone.

- [ ] **Step 2: PAT (GitHub UI)** — README sekcja 1. Expected: fine-grained token, jedno repo, tylko Administration RW.

- [ ] **Step 3: Sanity obrazu bazowego (NUC)**

```bash
docker run --rm --entrypoint bash myoung34/github-runner:ubuntu-jammy -c "id runner"
```
Expected: `uid=1000(runner) ...`. Jeśli user `runner` nie istnieje — STOP: Dockerfile wymaga poprawki (jawne `useradd`), wróć do Taska 3.

- [ ] **Step 4: Build obrazu (NUC)** — README sekcja 3. Expected: build kończy się sukcesem; `docker image ls psxplace-runner` pokazuje obraz ~2–2,5 GB.

- [ ] **Step 5: Deploy stacka (Portainer)** — README sekcja 4. Expected: `psxplace-ofelia` Running, `psxplace-runner` Running (pierwsze okno) → w Settings → Actions → Runners widać `psxplace-runner` (Idle).

- [ ] **Step 6: Test workflow_dispatch** — README sekcja 5, punkty 2–4. Expected: run zielony na runnerze `psxplace-runner`; log scrape'a zawiera "Found" (posty znalezione); po jobie kontener Exited. Jeśli `CF_BLOCKED` mimo residential IP — zbadaj log kroku Turnstile (`Turnstile:` linie) przed jakąkolwiek zmianą kodu.

- [ ] **Step 7: Test wake-window (następny dzień)** — README sekcja 5, punkt 5. Expected: poranny run z crona zielony bez ręcznej interwencji; kontener Exited po jobie.

- [ ] **Step 8: Domknięcie** — po pierwszym zielonym cronie zaktualizuj notatki pamięci projektu (psxplace_monitor: monitor działa z NUC-a; project_nuc_portainer: wdrożone). Opcjonalnie: reguła iptables z README ("Opcjonalne wzmocnienie").

---

## Self-Review (wykonane przy pisaniu planu)

- **Spec coverage:** wake-window/Ofelia → Task 4; obraz z bake → Task 3; merge PR #7 + odrzucenie revertu → Task 1; zmiany workflow → Task 2; hardening (approval, etykieta, EPHEMERAL, izolacja, PAT, RUNNER_NAME, RUN_AS_ROOT=false) → Taski 4-6 + README; awarie/alerting → bez zmian kodu (zachowane kroki workflow); testowanie ze speca → Task 6; rollback → README sekcja Utrzymanie. Brak luk.
- **Placeholder scan:** brak TBD/TODO; wszystkie pliki mają pełną treść.
- **Type consistency:** etykieta `psxplace`, nazwa `psxplace-runner`, obraz `psxplace-runner:latest` — spójne między Taskami 2/3/4/5/6.
