const puppeteer = require("puppeteer");
const path = require("path");
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  const url = `file://${path.resolve("index.html").replace(/\\/g, "/")}`;

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.screenshot({ path: "screenshots/dashboard-desktop.png", fullPage: true });

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.screenshot({ path: "screenshots/dashboard-mobile.png", fullPage: true });

  await browser.close();
})();
