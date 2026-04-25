const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 640 });

  const svg = fs.readFileSync(path.join(__dirname, 'social-preview.svg'), 'utf-8');
  const html = `<!DOCTYPE html><html><head><style>
    * { margin: 0; padding: 0; overflow: hidden; }
    body { width: 1280px; height: 640px; background: #000; }
    svg { display: block; }
  </style></head><body>${svg}</body></html>`;

  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({
    path: path.join(__dirname, 'social-preview.png'),
    clip: { x: 0, y: 0, width: 1280, height: 640 }
  });

  await browser.close();
  console.log('Generated social-preview.png (1280x640)');
})();
