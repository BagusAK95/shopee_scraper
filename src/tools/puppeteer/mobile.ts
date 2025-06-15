import puppeteer from "puppeteer-extra";
import { KnownDevices, Page } from "puppeteer";

const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());

const proxyPlugin = require("puppeteer-extra-plugin-proxy");
puppeteer.use(
  proxyPlugin({
    address: process.env.PROXY_ADDRESS,
    port: process.env.PROXY_PORT,
    credentials: {
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD,
    },
  })
);

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: [
      "--disable-http2",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--start-maximized",
      "--disable-features=NetworkService",
      "--force-ipv4",
      // "--auto-open-devtools-for-tabs",
    ],
  });

  const page = await browser.newPage();

  const iPhone = KnownDevices["iPhone 15 Pro"];
  await page.emulate(iPhone);

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3],
    });
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  // Block images for faster loading
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    await page.goto("https://shopee.tw/a-i.1439463026.28430488074", {
      waitUntil: "domcontentloaded",
    });

    const apiResp = await page.waitForResponse(
      (res) => res.url().includes("/api/v4/pdp/"),
      { timeout: 300000 }
    );

    const jsonResp = await apiResp.json();
    console.log(jsonResp);

    // Debug mode
    await new Promise((resolve) => setTimeout(resolve, 99999999));
  } catch (e) {
    console.error(e);
    return e;
  } finally {
    await browser.close();
  }
})();
