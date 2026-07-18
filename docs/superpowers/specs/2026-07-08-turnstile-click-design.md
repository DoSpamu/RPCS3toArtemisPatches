# Design: automatyczne kliknięcie Cloudflare Turnstile w GitHub Actions

**Data:** 2026-07-08
**Plik główny:** `scripts/check_psxplace.js`
**Workflow:** `.github/workflows/check-psxplace.yml`
**Poprzednik:** `2026-07-08-cf-retry-scraper-design.md` (retry na CF_BLOCKED — już wdrożone)

## Kontekst

Po wdrożeniu retry, dispatch CI (run 28967790657) potwierdził: 3 świeże
fingerprinty z datacenter IP GitHuba wszystkie dostały `CF_BLOCKED`. Test w
przeglądarce użytkownika (residential IP) pokazał **interaktywny checkbox
Turnstile** ("Verify you are human") — klikalny dla człowieka, ale wątek nie
ładuje się sam.

## Uczciwa ocena szans

Z datacenter IP GitHuba szansa powodzenia jest **niska** — reputacja IP dominuje
ocenę ryzyka Turnstile niezależnie od jakości kliknięcia. Nie próbowaliśmy jednak
nigdy *aktywnego* kliknięcia z tego IP (dotąd tylko bierne czekanie). To
legalny, tani eksperyment: zmiana kodu + jeden dispatch CI da definitywną,
empiryczną odpowiedź. Design jest zbudowany tak, by **każdy wynik był
diagnostyczny** (logi na każdym etapie), a porażka była łagodna (zwykłe
CF_BLOCKED → istniejący retry → exit 2).

## Decyzje projektowe

| Decyzja | Wybór | Uzasadnienie |
|---------|-------|--------------|
| Tryb przeglądarki | `headless: 'virtual'` (Xvfb) na Linuksie, `true` gdzie indziej | Turnstile w headless prawie nigdy nie przechodzi; wirtualny wyświetlacz daje realne renderowanie — pojedynczy czynnik o największym wpływie |
| Klik | Playwright `frameLocator` w ramce cross-origin + fallback po współrzędnych | JS strony nie sięgnie ramki CF; Playwright tak |
| Integracja | Próba `solveTurnstile` przed rzuceniem CF_BLOCKED; retry bez zmian | Każda z 3 prób retry zawiera teraz próbę kliknięcia |
| Testy | Utrzymać unit-testy `retryOnCfBlock`; `solveTurnstile` weryfikowany empirycznie w CI | Funkcja jest I/O/sieć-bound, bez sensownego unit-testu offline |

## Weryfikacja API Camoufox (potwierdzone w źródle pakietu)

- `camoufox-js` wspiera `headless: boolean | 'virtual'` (`index.d.ts:65`).
  `'virtual'` na Linuksie uruchamia Xvfb.
- Camoufox spawnuje **systemowy** Xvfb (`which Xvfb`,
  `chunk-NZSG52OA.cjs:10936`) — **nie dostarcza własnego**. Brak binarki →
  `CannotFindXvfb: "Please install Xvfb to use headless mode."`
- Wniosek: workflow MUSI zainstalować `xvfb` przed krokiem scrape.

## Rozwiązanie

### 1. `solveTurnstile(page)` — nowa funkcja

```js
// Best-effort click of the Cloudflare Turnstile widget. Logs each step so a
// single CI dispatch is diagnostic regardless of outcome. Never throws — the
// caller re-checks whether the challenge cleared.
async function solveTurnstile(page) {
  try {
    const frame = page.frameLocator('iframe[src*="challenges.cloudflare.com"]');
    const target = frame.locator('input[type="checkbox"], body');
    await target.waitFor({ state: 'visible', timeout: 15000 });
    console.error('Turnstile: widget found, clicking checkbox…');
    await target.click({ timeout: 10000 });
    console.error('Turnstile: checkbox click dispatched.');
    return;
  } catch (e) {
    console.error(`Turnstile: frame click failed (${e.message}); trying coordinate click…`);
  }
  try {
    const el = await page.$('iframe[src*="challenges.cloudflare.com"]');
    if (!el) { console.error('Turnstile: no widget iframe present.'); return; }
    const bb = await el.boundingBox();
    if (!bb) { console.error('Turnstile: iframe has no bounding box.'); return; }
    await page.mouse.click(bb.x + 30, bb.y + bb.height / 2);
    console.error('Turnstile: coordinate click dispatched.');
  } catch (e) {
    console.error(`Turnstile: coordinate click failed (${e.message}).`);
  }
}
```

### 2. `scrapePage()` — próba kliknięcia przed poddaniem się

Wydzielić bierne czekanie do `challengeCleared(page)` (zwraca boolean).
Po `goto`: jeśli challenge nie zniknął sam → `solveTurnstile` → sprawdź
ponownie; dopiero gdy dalej blok → `throw CF_BLOCKED`.

```js
async function challengeCleared(page) {
  try {
    await page.waitForFunction(
      () => !document.title.includes('Just a moment'),
      { timeout: CF_RETRY.challengeTimeoutMs }
    );
    return true;
  } catch (_) {
    return !(await page.title()).includes('Just a moment');
  }
}

async function scrapePage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  if (!(await challengeCleared(page))) {
    console.error('Challenge did not auto-clear — attempting Turnstile solve…');
    await solveTurnstile(page);
    if (!(await challengeCleared(page))) throw new Error('CF_BLOCKED');
    console.error('Turnstile: challenge cleared after click.');
  }
  // …existing post extraction unchanged…
}
```

### 3. Tryb wirtualnego wyświetlacza

W `scrapeThreadWithRetry`:
```js
const headless = process.platform === 'linux' ? 'virtual' : true;
const browser = await Camoufox({ headless, os: 'windows', humanize: true });
```
Lokalne uruchomienia poza Linuksem zachowują dawne `headless: true`
(bez zależności od Xvfb).

### 4. Workflow — instalacja Xvfb

W `.github/workflows/check-psxplace.yml`, przed krokiem scrape:
```yaml
- name: Install Xvfb (virtual display for headed Camoufox)
  run: sudo apt-get update && sudo apt-get install -y xvfb
```
Kody wyjścia, `continue-on-error`, krok "Fail run" — bez zmian.

### 5. Testy

Bez zmian w unit-testach (`retryOnCfBlock`). `solveTurnstile` weryfikowany
empirycznie: `npm test` musi dalej przechodzić; dispatch CI z logami
diagnostycznymi rozstrzyga skuteczność klika.

## Interpretacja wyników dispatchu (każdy jest wartościowy)

- **Klik przeszedł, wątek się załadował** → sukces, CI działa.
- **Checkbox był, klik nie pomógł** → potwierdzenie, że blokuje reputacja IP
  datacenter, nie klik → następny krok: przeniesienie na residential IP.
- **Brak widgetu / twarda odmowa** → CF nie daje CI nawet szansy klika →
  jw., residential IP jest jedyną drogą.

## Poza zakresem (YAGNI)

- Przeniesienie monitora na komputer użytkownika (residential IP) — osobny,
  większy projekt; rozważyć jeśli klik z CI zawiedzie (co jest prawdopodobne).
- Płatne solvery Turnstile (2captcha), proxy residential.
