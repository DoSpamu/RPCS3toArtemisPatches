# Design: uodpornienie scrapera PSXPlace na blokady Cloudflare

**Data:** 2026-07-08
**Plik główny:** `scripts/check_psxplace.js`
**Powiązane testy:** `scripts/check_psxplace.test.js`

## Kontekst i problem

Codzienny monitor wątku PSXPlace (`scripts/check_psxplace.js`, cron 06:00 UTC) zaczął
zawodzić 2026-07-07 z błędem `CF_BLOCKED`. Trzy uruchomienia z rzędu (07-07 rano,
07-08 rano, 07-08 ręczne o 18:19 UTC) zatrzymały się na challenge'u Cloudflare
"Just a moment...", który nie zniknął w ciągu 30 s.

Ustalenia diagnostyczne:

- **To nie regresja kodu.** Między ostatnim sukcesem (07-06) a pierwszą porażką
  (07-07) zmieniły się tylko commity dotyczące parsowania nazw katalogu (`6f787fd`)
  i dokumentacji (`b8805a4`) — żaden nie dotyka `scrapePage()` ani ścieżki Cloudflare.
- **Blokada jest genuinnie nowa.** Logi 7 wcześniejszych zielonych runów (06-30 →
  07-06) nie zawierają `CF_BLOCKED` i pokazują 6–7 przescrape'owanych stron.
- **Przeglądarka nie jest przypięta.** `npx camoufox fetch` pobiera build z GitHub
  Releases w zakresie `>=beta.19, <1` (zabetonowanym w pakiecie `camoufox@0.1.19`).
  Na świeżym runnerze CI (pusty cache) zawsze ciągnie najnowszy build w zakresie.
  Pin npm blokuje *fetcher*, nie binarną przeglądarkę.
- Nie da się z logów CI rozróżnić, czy winny jest nowy build Camoufoxa, czy
  zaostrzenie Cloudflare. **Retry pomaga w obu przypadkach** — dlatego jest to
  bezpieczny pierwszy krok, niezależny od przyczyny.

## Cel

Zmniejszyć false-negatywne `CF_BLOCKED` w codziennym CI przez retry ze świeżym
fingerprintem i wydłużony timeout na challenge — bez utraty wartości
diagnostycznej kodów wyjścia.

## Kluczowa obserwacja architektoniczna

`scrapeThread()` tworzy jedną instancję Camoufoxa i jedną kartę, po czym
`scrapePage()` przechodzi przez wszystkie strony wątku tą samą kartą. Blokada CF
realnie występuje tylko przy pierwszym `page.goto` (strona 1). Dlatego **retry
samego `scrapePage()` na tej samej karcie jest bezwartościowy** wobec Cloudflare:
ten sam fingerprint + ta sama sesja = ta sama blokada. Skuteczny retry musi
zamknąć przeglądarkę i utworzyć nową instancję (świeży fingerprint dzięki
`humanize:true` + losowanemu profilowi).

## Decyzje projektowe

| Decyzja | Wybór |
|---------|-------|
| Granularność retry | Cała przeglądarka — świeży Camoufox co próbę |
| Profil | Zbalansowany: 3 próby, timeout challenge 45 s, backoff [10 s, 20 s] |
| Zakres retry | Tylko `CF_BLOCKED`; `SCRAPE_EMPTY` leci od razu (exit 3) |

Najgorszy przypadek czasowy: ~3–4 min.

## Rozwiązanie

### 1. Inwersja własności przeglądarki

- `scrapeThread(browser)` — przyjmuje gotową przeglądarkę, robi pętlę po stronach,
  **nie zamyka** jej (własność należy do wołającego). Nadal rzuca `SCRAPE_EMPTY`
  przy zerze postów.
- Wołający (`scrapeThreadWithRetry`) zarządza cyklem życia: tworzy i zamyka
  przeglądarkę między próbami.

### 2. Czysta, testowalna funkcja retry

```js
// Higher-order retry — testowalna bez sieci przez wstrzyknięcie fn.
async function retryOnCfBlock(fn, opts) {
  const { attempts, backoffMs } = opts;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn(i);
    } catch (err) {
      if (err.message !== 'CF_BLOCKED' || i === attempts) throw err;
      const wait = backoffMs[i - 1] ?? backoffMs[backoffMs.length - 1];
      console.error(`CF block on attempt ${i}/${attempts}, retrying in ${wait / 1000}s…`);
      await sleep(wait);
    }
  }
}
```

- Łapie **tylko** `CF_BLOCKED`. Każdy inny błąd (w tym `SCRAPE_EMPTY`) → natychmiast
  w górę, bez retry.
- Po wyczerpaniu prób rzuca `CF_BLOCKED` → `main()` mapuje na exit 2 (bez zmian).
- `sleep` = zwykły `await new Promise(r => setTimeout(r, ms))` (przeglądarka
  zamknięta, więc nie `page.waitForTimeout`).

### 3. Wrapper spinający całość

```js
const CF_RETRY = { attempts: 3, challengeTimeoutMs: 45000, backoffMs: [10000, 20000] };

async function scrapeThreadWithRetry() {
  return retryOnCfBlock(async () => {
    const browser = await Camoufox({ headless: true, os: 'windows', humanize: true });
    try {
      return await scrapeThread(browser);
    } finally {
      await browser.close();
    }
  }, CF_RETRY);
}
```

`main()` woła `scrapeThreadWithRetry()` zamiast `scrapeThread()`.

### 4. Parametryzacja timeoutu challenge'u

`scrapePage()` używa `CF_RETRY.challengeTimeoutMs` zamiast zahardkodowanego 30000
w wywołaniu `waitForFunction` (30 s → 45 s).

### 5. Zachowanie semantyki (bez zmian)

- Exit 2 (`CF_BLOCKED`, przejściowy) i exit 3 (`SCRAPE_EMPTY`, zmiana layoutu)
  pozostają rozróżnione.
- Stan (`known_posts.json`) zapisywany dopiero po sukcesie.
- Workflow YAML bez zmian (`continue-on-error` + "Fail run if scraper failed").

## Testy

Dodać do `scripts/check_psxplace.test.js` (styl `node:assert`, bez sieci, bez
Camoufoxa) testy dla wyeksportowanej `retryOnCfBlock` z wstrzykiwanym fake'owym
`fn`:

1. `CF_BLOCKED` rzucany za każdym razem → `fn` wołane dokładnie `attempts` razy,
   następnie propagacja `CF_BLOCKED`.
2. `CF_BLOCKED` w próbie 1, sukces w próbie 2 → zwraca wynik, `fn` wołane 2×.
3. `SCRAPE_EMPTY` w próbie 1 → propagacja natychmiast, `fn` wołane 1×.

Aby test nie czekał realnych sekund, `retryOnCfBlock` przyjmuje wstrzykiwalny
`sleep` (domyślnie prawdziwy) — test podaje no-op. Alternatywnie test używa
`backoffMs: [0, 0]`.

`retryOnCfBlock` i `sleep` dodać do `module.exports`.

Weryfikacja E2E po implementacji: `npm test` musi przejść; ręczny run workflow
(`gh workflow run`) potwierdzi zachowanie na żywym Cloudflare.

## Poza zakresem (YAGNI)

- Przypinanie konkretnego builda Camoufoxa / `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` —
  osobna dźwignia, do rozważenia dopiero jeśli retry nie wystarczy.
- Alternatywne wejścia (FlareSolverr z `legacy/`).
- Zmiany w workflow YAML.
