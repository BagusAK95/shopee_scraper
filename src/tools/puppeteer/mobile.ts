import puppeteer from "puppeteer-extra";
import { KnownDevices, Page } from "puppeteer";

const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());

const proxyPlugin = require("puppeteer-extra-plugin-proxy");
puppeteer.use(
  proxyPlugin({
    address: "tpt16bu0.as.thordata.net",
    port: 9999,
    credentials: {
      username: "td-customer-yXyRF9s3tfvr-country-tw",
      password: "OxyhBt7a3qhn",
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
      "--auto-open-devtools-for-tabs",
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

  // await page.setRequestInterception(true);
  // page.on("request", (request) => {
  //   if (request.url().includes(".js")) {
  //     request.abort();
  //   } else {
  //     request.continue();
  //   }
  // });

  try {
    await page.goto("https://shopee.tw", {
      waitUntil: "domcontentloaded",
    });

    const apiResp = await page.waitForResponse(
      (res) => res.url().includes("/api/v4/pdp/get_pc"),
      { timeout: 300000 }
    );

    const jsonResp = await apiResp.json();
    console.log(jsonResp);

    await new Promise((resolve) => setTimeout(resolve, 99999999));
  } catch (e) {
    console.error(e);
    return e;
  } finally {
    await browser.close();
  }
})();
