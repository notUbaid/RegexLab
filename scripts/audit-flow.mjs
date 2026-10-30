import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const LOGS = [];
const ERRORS = [];

async function auditFlow() {
  console.log('--- STARTING VERIFICATION & DEMO USER FLOW ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    LOGS.push({ type, text });
    if (type === 'error') {
      console.error(`[BROWSER ERROR]: ${text}`);
      ERRORS.push(text);
    }
  });

  page.on('pageerror', (err) => {
    console.error(`[UNCAUGHT PAGE ERROR]: ${err.toString()}`);
    ERRORS.push(err.toString());
  });

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  // Helper to click sidebar / nav buttons
  async function goToView(label) {
    const clicked = await page.evaluate((targetLabel) => {
      const buttons = Array.from(document.querySelectorAll('aside button, nav button'));
      const btn = buttons.find((b) => b.textContent && b.textContent.trim().toLowerCase() === targetLabel.toLowerCase()) ||
                  buttons.find((b) => b.textContent && b.textContent.trim().toLowerCase().includes(targetLabel.toLowerCase()));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, label);
    if (!clicked) {
      console.warn(`WARNING: Could not find nav button for "${label}"`);
    }
    await delay(700);
    return clicked;
  }

  // 1. Visit Home / Landing
  console.log('1. Loading http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await delay(1000);

  // Verify landing page is default
  const isLanding = await page.evaluate(() => {
    return document.body.textContent.includes('Find the pattern in the text');
  });
  console.log('Default page is Landing Hero:', isLanding);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01-landing.png') });

  // Test Specimen click on Landing (Dates)
  console.log('Testing specimen selection (Dates)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const datesBtn = buttons.find(b => b.textContent?.includes('Dates'));
    if (datesBtn) datesBtn.click();
  });
  await delay(600);

  // Click "Open in the playground"
  console.log('Clicking "Open in the playground"...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const openBtn = buttons.find(b => b.textContent?.includes('Open in the playground'));
    if (openBtn) openBtn.click();
  });
  await delay(900);

  // 2. Audit Playground View
  console.log('2. Auditing Playground View...');
  const playgroundState = await page.evaluate(() => {
    const patternInput = document.querySelector('input[aria-label="Regular expression"]') || document.querySelector('input');
    const testArea = document.querySelector('textarea#rx-test') || document.querySelector('textarea');
    const marks = document.querySelectorAll('mark');
    return {
      patternValue: patternInput ? patternInput.value : null,
      testAreaHasDates: testArea ? testArea.value.includes('1837-12-01') : false,
      markCount: marks.length,
    };
  });
  console.log('Playground received specimen state:', JSON.stringify(playgroundState));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02-playground.png') });

  // Test Explanation tab
  console.log('Switching to Explanation tab in Playground...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
    const expTab = tabs.find(t => t.textContent?.includes('Explanation'));
    if (expTab) expTab.click();
  });
  await delay(500);

  // Test Replace tab
  console.log('Switching to Replace tab in Playground...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
    const repTab = tabs.find(t => t.textContent?.includes('Replace'));
    if (repTab) repTab.click();
  });
  await delay(500);

  // Switch back to Matches tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
    const mTab = tabs.find(t => t.textContent?.includes('Matches'));
    if (mTab) mTab.click();
  });
  await delay(400);

  // 3. Step by step (Engine Visualizer)
  console.log('3. Auditing Step by step visualizer...');
  await goToView('Step by step');
  await delay(600);
  // Click Next step twice
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find(b => b.title?.includes('Next') || b.textContent?.includes('Next'));
    if (nextBtn) {
      nextBtn.click();
      setTimeout(() => nextBtn.click(), 200);
    }
  });
  await delay(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03-visualizer.png') });

  // 4. Pattern tree (AST)
  console.log('4. Auditing Pattern tree...');
  await goToView('Pattern tree');
  await delay(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05-ast.png') });

  // 5. Languages (Compatibility)
  console.log('5. Auditing Languages compatibility view...');
  await goToView('Languages');
  await delay(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08-compatibility.png') });

  // 6. Builder (No-Code Builder)
  console.log('6. Auditing Builder view...');
  await goToView('Builder');
  await delay(600);
  // Click "+ Numbers" to add a block
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const numBtn = buttons.find(b => b.textContent?.includes('Numbers'));
    if (numBtn) numBtn.click();
  });
  await delay(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04-builder.png') });

  // 7. Fix errors (Debugger)
  console.log('7. Auditing Fix errors view...');
  await goToView('Fix errors');
  await delay(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06-debugger.png') });

  // 8. Speed check (Performance)
  console.log('8. Auditing Speed check view...');
  await goToView('Speed check');
  await delay(600);
  // Click "Run Adversarial Benchmark"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const benchBtn = buttons.find(b => b.textContent?.includes('Run Adversarial Benchmark'));
    if (benchBtn) benchBtn.click();
  });
  await delay(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07-performance.png') });

  // 9. Compare view
  console.log('9. Auditing Compare view...');
  await goToView('Compare');
  await delay(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10-compare.png') });

  // 10. Examples (Pattern library)
  console.log('10. Auditing Examples view...');
  await goToView('Examples');
  await delay(600);
  // Filter by 'Web & Network'
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button[role="tab"]'));
    const webBtn = buttons.find(b => b.textContent?.includes('Web & Network'));
    if (webBtn) webBtn.click();
  });
  await delay(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09-library.png') });

  // 11. Practice (Challenges)
  console.log('11. Auditing Practice challenges view...');
  await goToView('Practice');
  await delay(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '11-challenges.png') });

  // 12. Cheat Sheet Modal (Header button test)
  console.log('12. Auditing Cheat Sheet modal button in header...');
  await page.evaluate(() => {
    const cheatBtn = Array.from(document.querySelectorAll('header button')).find(b => 
      b.textContent?.includes('Cheat') || b.getAttribute('aria-label')?.includes('Cheat')
    );
    if (cheatBtn) cheatBtn.click();
  });
  await delay(600);
  const isCheatOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"], .fixed'));
  console.log('Cheat sheet opened via header button:', isCheatOpen);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '12-cheatsheet-modal.png') });
  await page.keyboard.press('Escape');
  await delay(400);

  // 13. Share Modal (Header button)
  console.log('13. Auditing Share modal...');
  await page.evaluate(() => {
    const shareBtn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent?.includes('Share'));
    if (shareBtn) shareBtn.click();
  });
  await delay(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '13-share-modal.png') });
  await page.keyboard.press('Escape');
  await delay(400);

  // 14. Theme Switcher (Paper theme)
  console.log('14. Auditing Theme switch (Paper light theme)...');
  await page.evaluate(() => {
    const themeBtn = Array.from(document.querySelectorAll('header button')).find(b => b.getAttribute('aria-label') === 'Change theme');
    if (themeBtn) themeBtn.click();
  });
  await delay(400);
  await page.evaluate(() => {
    const paperBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Paper'));
    if (paperBtn) paperBtn.click();
  });
  await delay(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '14-theme-paper.png') });

  // Switch back to Ink dark theme
  await page.evaluate(() => {
    const themeBtn = Array.from(document.querySelectorAll('header button')).find(b => b.getAttribute('aria-label') === 'Change theme');
    if (themeBtn) themeBtn.click();
  });
  await delay(400);
  await page.evaluate(() => {
    const inkBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Ink'));
    if (inkBtn) inkBtn.click();
  });
  await delay(600);

  await browser.close();

  console.log('\n--- BROWSER FLOW AUDIT COMPLETED SUCCESSFULLY ---');
  console.log(`Total errors captured: ${ERRORS.length}`);
  if (ERRORS.length > 0) {
    console.error('Errors encountered:', ERRORS);
    process.exit(1);
  } else {
    console.log('ALL FLOWS PASSED WITH 0 BROWSER ERRORS!');
  }
}

auditFlow().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
