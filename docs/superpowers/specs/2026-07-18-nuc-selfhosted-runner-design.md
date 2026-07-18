# Design: monitor PSXPlace na NUC-u — self-hosted GitHub runner (wake-window)

**Data:** 2026-07-18
**Pliki główne:** `.github/workflows/check-psxplace.yml`, nowy katalog `deploy/nuc-runner/`
**Powiązane specyfikacje:** `2026-07-08-cf-retry-scraper-design.md`, `2026-07-08-turnstile-click-design.md`

## Kontekst i problem

Od 2026-07-07 codzienny cron monitora pada z `CF_BLOCKED` — 10+ czerwonych runów
z rzędu (ostatni 07-17). Ustalono empirycznie, że barierą jest **reputacja IP,
nie fingerprint przeglądarki**: datacenter IP GitHub Actions (zakresy Azure)
dostaje zapętlony challenge "Just a moment" bez klikalnego widgetu Turnstile,
podczas gdy z residential IP checkbox się pojawia. Camoufox jest już najlepszym
dostępnym narzędziem stealth — żadna zmiana kodu nie obejdzie reputacji IP.
Retry ze świeżym fingerprintem (PR #6, na masterze) i klik Turnstile
(PR #7, gałąź `fix/turnstile-click`, niezmergowany) nie pomagają z datacenter IP.

Jedyna realna droga: uruchamiać scrape z residential IP. Użytkownik ma NUC-a
działającego 24/7 z Portainerem.

## Decyzja architektoniczna (2026-07-18)

Wybrano **opcję 2 — self-hosted GitHub Actions runner** (zamiast standalone
kontenera z własnym harmonogramem i push przez PAT). Powody użytkownika:
minimalne utrzymanie (harmonogram, logi, alerting zostają w GitHubie; workflow
zmienia się w jednej linii), pod warunkiem zabezpieczenia ryzyk publicznego repo
i minimalnego zużycia zasobów NUC-a.

Doprecyzowane decyzje:

| Decyzja | Wybór |
|---------|-------|
| Cykl życia runnera | **Wake-window**: kontener budzony raz dziennie, gaśnie po jobie |
| Budzik | **Ofelia** w tym samym stacku Portainera (~10 MB RAM idle) |
| Zależności joba | **Wypieczone w obraz** (Node 22, Camoufox, Xvfb, cache npm) |
| Harmonogram | Bez zmian: cron GitHuba 06:00 UTC, Ofelia startuje runner 05:55 UTC |
| Klik Turnstile | **Merge PR #7 do mastera** — na residential IP checkbox istnieje, klik jest sensownym fallbackiem |

## Cel

Codzienny scrape wątku #49905 z residential IP NUC-a, z zachowaniem całej
istniejącej logiki (testy przed scrape'em, exit-kody 2/3/1, commit na master,
alerting mailowy przez czerwone runy), przy praktycznie zerowym idle na NUC-u
i bez otwierania NUC-a na kod z fork-PR-ów.

## Architektura

Jeden stack docker-compose w Portainerze (`psxplace-runner`), dwa serwisy:

### Serwis `ofelia` (always-on)

- Obraz `mcuadros/ofelia`, jedyny stale działający proces (~10–15 MB RAM).
- Jedno zadanie `job-run`: codziennie **05:55 UTC** uruchamia kontener runnera.
- Konfiguracja przez labelki compose — całość widoczna i edytowalna w Portainerze.

### Serwis `runner` (on-demand, `restart: "no"`)

- Obraz własny (`deploy/nuc-runner/Dockerfile`) na bazie `myoung34/github-runner`.
- Zmienne: `RUNNER_SCOPE=repo`, `REPO_URL` wskazujące to repo, `EPHEMERAL=1`,
  `LABELS=psxplace`, `ACCESS_TOKEN` = fine-grained PAT (patrz Bezpieczeństwo).
- Cykl: rejestracja → odbiór joba → wykonanie → wyrejestrowanie → kontener gaśnie.

### Odporność na poślizg crona GitHuba

Cron GitHuba potrafi odpalić się 15–60 min po czasie. Kolejność jest obojętna:

- Job w kolejce przed startem runnera → runner odbiera go natychmiast po rejestracji.
- Job po starcie runnera → runner nasłuchuje aż job przyjdzie, wykonuje, gaśnie.

Worst case: runner nasłuchuje bezczynnie do ~1 h dziennie (~150 MB RAM w tym oknie).

## Obraz (`deploy/nuc-runner/Dockerfile`)

Wypieczone w warstwy obrazu:

- Node 22 (workflow przestaje używać `actions/setup-node`),
- biblioteki GTK wymagane przez bundlowanego Firefoksa Camoufoxa,
- **Xvfb** — pod `headless:'virtual'` z gałęzi turnstile-click,
- binarka Camoufoxa: `npx camoufox fetch` w trakcie budowy obrazu,
- rozgrzany cache npm (`npm ci` w jobie trafia w cache, działa szybko).

**Samonaprawa wersji przeglądarki:** krok `npx camoufox fetch` zostaje w
workflow. Dopóki wypieczona wersja jest najnowsza w zakresie — no-op. Gdy wyjdzie
nowy build, job dociąga go do warstwy tymczasowej kontenera (~200 MB, widoczne
w logu runa jako sygnał, że przy okazji warto przebudować obraz). Rebuild obrazu
jest ręczny i niewymuszony — świeżość przeglądarki nie zależy od niego.

Szacunki: obraz ~2–2,5 GB na dysku; szczyt RAM w jobie ~1 GB (Firefox),
limit twardy 2 GB.

## Zmiany w repo

1. **Gałąź `fix/turnstile-click`:** odrzucić wiszący zastage'owany revert
   (`git restore --staged . && git checkout .`), po czym **zmergować PR #7 do
   mastera**. Kod kliku Turnstile (`solveTurnstile`, `challengeCleared`,
   `headless:'virtual'`) staje się użyteczny dopiero z residential IP — dokładnie
   ten scenariusz. Xvfb instalowany dotąd krokiem workflow przechodzi do obrazu.
2. **`.github/workflows/check-psxplace.yml`:**
   - `runs-on: [self-hosted, psxplace]` zamiast `ubuntu-latest`,
   - usunąć krok `actions/setup-node` (Node w obrazie),
   - usunąć krok `apt-get install xvfb` z gałęzi turnstile (Xvfb w obrazie),
   - reszta bez zmian: `npm ci` → `npm test` → `camoufox fetch` → scrape →
     commit na master przez `GITHUB_TOKEN` → krok re-raise przy porażce scrape'u.
3. **Nowy katalog `deploy/nuc-runner/`:** `Dockerfile`, `docker-compose.yml`
   (runner + ofelia + labelki harmonogramu + limity zasobów + sieć), `README.md`
   z instrukcją wdrożenia w Portainerze (stack z repozytorium git lub wklejka)
   i utworzenia PAT.

## Bezpieczeństwo (repo jest publiczne)

Model zagrożenia: obcy kod (fork-PR) wykonany na runnerze w domowej sieci.

- **Ustawienia repo:** Actions → *Require approval for all outside
  collaborators* — workflow z fork-PR-a nie ruszy bez ręcznej zgody.
- **Etykieta jako zapora:** tylko `check-psxplace.yml` ma
  `runs-on: [self-hosted, psxplace]`, a jego triggery (`schedule`,
  `workflow_dispatch`) wykonują wyłącznie kod z mastera. Żaden workflow
  uruchamialny przez fork-PR nie celuje w self-hosted.
- **`EPHEMERAL=1`:** czysty stan runnera co job — brak trwałej maszyny do
  zatrucia; wake-window dodatkowo oznacza świeży kontener co dobę.
- **Izolacja kontenera:** bez montowania `docker.sock`; własna sieć bridge
  (runner nie widzi innych kontenerów stacka Portainera). Uwaga: bridge NIE
  odcina dostępu do LAN-u — jeśli ma być odcięty, potrzebna reguła firewalla
  na hoście (np. DROP z podsieci dockera do 192.168.0.0/16); README opisze ją
  jako opcjonalne wzmocnienie. `mem_limit: 2g`, `cpus: 1.5`; proces runnera
  jako non-root przez jawne `RUN_AS_ROOT=false` (domyślnie obraz myoung34
  działa jako root).
- **Token:** fine-grained PAT ograniczony do tego jednego repo, wyłącznie
  uprawnienie *Administration: read/write* (rejestracja runnera). Trzymany jako
  zmienna środowiskowa stacka w Portainerze. Push do repo wykonuje wbudowany
  `GITHUB_TOKEN` joba (`permissions: contents: write` już jest w workflow) —
  PAT nigdy nie dotyka zawartości repo.

## Awarie i alerting

Istniejące ścieżki bez zmian: exit 2 = `CF_BLOCKED`, 3 = `SCRAPE_EMPTY`,
1 = crash → czerwony run → mail z GitHuba.

Nowy tryb awarii: NUC wyłączony / kontener nie wstał / PAT wygasł → job wisi
w kolejce GitHuba do 24 h → auto-fail → mail. Każda ścieżka awarii kończy się
powiadomieniem bez dodatkowej infrastruktury monitorującej.

Rollback: przywrócenie `runs-on: ubuntu-latest` w jednej linii wraca na runnery
GitHuba (z powrotem do stanu "czerwona sonda CF").

## Profil zasobów NUC-a

| Stan | RAM | CPU | Dysk |
|------|-----|-----|------|
| Idle (~23,9 h/dobę) | ~10–15 MB (Ofelia) | ~0% | obraz ~2–2,5 GB |
| Okno joba (~3–5 min/dobę; do ~1 h przy poślizgu crona) | szczyt ~1 GB, cap 2 GB | 1–2 rdzenie chwilowo | — |

## Testowanie

1. **Build lokalny obrazu** i `docker compose run runner` ręcznie — runner musi
   się zarejestrować (widoczny w Settings → Actions → Runners) i czekać na job.
2. **`workflow_dispatch` z UI** przy działającym runnerze — pełny przebieg:
   testy, scrape z residential IP (oczekiwanie: challenge przechodzi sam albo
   po kliku Turnstile), commit jeśli są nowe patche.
3. **Test wake-window:** pozostawić stack na noc, sprawdzić rano czy run 06:00
   UTC przeszedł i czy kontener runnera zgasł po jobie.
4. **Test negatywny bezpieczeństwa:** sprawdzić w ustawieniach repo, że PR
   z forka wymaga zgody, i że żaden workflow poza `check-psxplace.yml` nie ma
   etykiety `psxplace`.

## Poza zakresem

- Automatyczny rebuild obrazu przy nowym buildzie Camoufoxa (ręczny, sygnał w logach).
- Przenoszenie sesji `cf_clearance` między maszynami (wiązana z IP+UA, niemożliwe).
- Zmiana logiki scrapera/parsera — kod `scripts/check_psxplace.js` pozostaje
  nietknięty poza tym, co już jest na gałęzi turnstile-click.
