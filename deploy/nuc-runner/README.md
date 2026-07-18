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
