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
      console.error('CF_BLOCKED: Cloudflare challenge not resolved.');
      console.error('Fallback: swap patchright for camoufox (see CLAUDE.md).');
      process.exit(1);
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

  while (url) {
    console.log(`Scraping: ${url}`);
    const { posts, nextUrl } = await scrapePage(page, url);
    allPosts.push(...posts.filter(p => p.id));
    console.log(`  Found ${posts.length} posts on this page (total: ${allPosts.length})`);
    url = nextUrl;
    if (url) await page.waitForTimeout(1500); // polite delay between pages
  }

  await browser.close();
  return allPosts;
}
