import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  // 1. Landing View Screenshot
  console.log('Capturing Landing Page...');
  await delay(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01-landing.png') });

  // Helper to click navigation tab and capture view
  const views = [
    { name: 'playground', label: 'Playground', file: '02-playground.png' },
    { name: 'visualizer', label: 'Step by step', file: '03-visualizer.png' },
    { name: 'ast', label: 'Pattern tree', file: '05-ast.png' },
    { name: 'compatibility', label: 'Languages', file: '08-compatibility.png' },
    { name: 'builder', label: 'Builder', file: '04-builder.png' },
    { name: 'debugger', label: 'Fix errors', file: '06-debugger.png' },
    { name: 'performance', label: 'Speed check', file: '07-performance.png' },
    { name: 'compare', label: 'Compare', file: '10-compare.png' },
    { name: 'library', label: 'Examples', file: '09-library.png' },
    { name: 'challenges', label: 'Practice', file: '11-challenges.png' },
  ];

  for (const v of views) {
    console.log(`Navigating to ${v.label}...`);
    // Find the sidebar button matching label text and click it
    const clicked = await page.evaluate((label) => {
      const buttons = Array.from(document.querySelectorAll('aside button, nav button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes(label));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, v.label);

    if (clicked) {
      await delay(1200); // Allow spring transitions and canvas animations to settle
      await page.screenshot({ path: path.join(OUTPUT_DIR, v.file) });
      console.log(`Saved screenshots/${v.file}`);
    } else {
      console.warn(`Could not find button for ${v.label}`);
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully in /screenshots directory!');
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
