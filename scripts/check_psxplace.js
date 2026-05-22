'use strict';
const { chromium } = require('patchright');
const fs = require('fs');
const path = require('path');

const THREAD_URL = 'https://www.psx-place.com/threads/60-unlock-fps-patches.49905/';
const STATE_FILE  = path.join(__dirname, '..', 'known_posts.json');
const USERLIST_DIR = path.join(__dirname, '..', 'USERLIST');
const RAW_DIR     = path.join(__dirname, '..', 'new_patches_raw');
const PR_BODY_FILE = path.join(__dirname, '..', 'pr_body.txt');

async function scrapePage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait out Cloudflare challenge (title = "Just a moment..." for up to 15s)
  try {
    await page.waitForFunction(
      () => !document.title.includes('Just a moment'),
      { timeout: 15000 }
    );
  } catch (_) {
    if ((await page.title()).includes('Just a moment')) {
      throw new Error('CF_BLOCKED');
    }
  }

  const posts = await page.evaluate(() => {
    const articles = document.querySelectorAll('article.message[data-author]');
    return Array.from(articles).map(a => ({
      id:     a.id || a.getAttribute('data-content') || '',
      author: a.getAttribute('data-author') || 'unknown',
      text:   (a.querySelector('.bbWrapper') || a.querySelector('.message-body'))?.innerText || '',
    }));
  });

  const nextAnchor = await page.$('a.pageNav-jump--next');
  const nextHref   = nextAnchor ? await nextAnchor.getAttribute('href') : null;
  const nextUrl    = nextHref ? new URL(nextHref, url).href : null;

  return { posts, nextUrl };
}

async function scrapeThread() {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();
  const allPosts = [];
  let url = THREAD_URL;

  try {
    while (url) {
      console.log(`Scraping: ${url}`);
      const { posts, nextUrl } = await scrapePage(page, url);
      const filtered = posts.filter(p => p.id);
      allPosts.push(...filtered);
      console.log(`  Found ${filtered.length} posts on this page (total: ${allPosts.length})`);
      url = nextUrl;
      if (url) await page.waitForTimeout(1500); // polite delay between pages
    }
  } catch (err) {
    if (err.message === 'CF_BLOCKED') {
      console.error('CF_BLOCKED: Cloudflare challenge not resolved.');
      console.error('Fallback: swap patchright for camoufox (see CLAUDE.md).');
      process.exit(1);
    }
    throw err;
  } finally {
    await browser.close();
  }

  return allPosts;
}

const TITLE_ID_RE = /\b(BL[UECSJA][A-Z0-9]{6}|NP[A-Z]{2}[0-9]{5}|BC[A-Z]{2}[0-9]{5})\b/gi;

function extractTitleIds(text) {
  return [...new Set((text.match(TITLE_ID_RE) || []).map(s => s.toUpperCase()))];
}

function extractPatches(text) {
  // Priority 1: already in NCL format "0 XXXXXXXX YYYYYYYY"
  const nclMatches = [...text.matchAll(/^0\s+([0-9A-Fa-f]{8})\s+([0-9A-Fa-f]{4,8})\s*$/gm)];
  if (nclMatches.length) {
    return nclMatches.map(m => `0 ${m[1].toUpperCase()} ${m[2].toUpperCase()}`);
  }

  // Priority 2: "0xADDR 0xVALUE" hex pairs (whitespace-separated, no intervening text)
  return [...text.matchAll(/0x([0-9A-Fa-f]{1,})\s+0x([0-9A-Fa-f]{1,})/gi)].map(m => {
    const addr    = m[1].toUpperCase().padStart(8, '0').slice(-8);
    const rawVal  = m[2].toUpperCase();
    const val     = rawVal.length <= 4
      ? rawVal.padStart(4, '0')
      : rawVal.padStart(8, '0').slice(-8);
    return `0 ${addr} ${val}`;
  });
}

function buildNclEntry(cheatName, author, patches) {
  return [`${cheatName} (PSXPlace)`, '0', author, ...patches, '#'].join('\n');
}

module.exports = { scrapeThread, scrapePage, extractTitleIds, extractPatches, buildNclEntry };
