import puppeteer from "puppeteer-extra";
import { Page } from "puppeteer";

const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());

// const proxyPlugin = require("puppeteer-extra-plugin-proxy");
// puppeteer.use(
//   proxyPlugin({
//     address: "tpt16bu0.as.thordata.net",
//     port: 9999,
//     credentials: {
//       username: "td-customer-yXyRF9s3tfvr-country-tw",
//       password: "OxyhBt7a3qhn",
//     },
//   })
// );

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

  const cookies = require("../../shopee.tw.cookies.json");
  await browser.setCookie(...cookies);

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
  );

  // Spoof languages and plugins
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3],
    });
  });

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (!req.url().includes("https://shopee.tw/api/v4/pdp")) {
      req.continue();
      return;
    }

    const headers = req.headers();
    headers["accept-language"] = `en-US,en;q=0.9,id;q=0.8`;
    headers["priority"] = `u=1, i`;
    headers["sec-ch-ua"] = `"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"`;
    headers["sec-fetch-dest"] = `empty`;
    headers["sec-fetch-mode"] = `cors`;
    headers["sec-fetch-site"] = `same-origin`;
    headers["cookie"] = cookies.map((cookie: any) => `${cookie.name}=${cookie.value}`).join("; ");
    console.log(headers);

    req.continue({ headers });
  });

  // Block images for faster loading
  // page.on("request", (req) => {
  //   if (["image"].includes(req.resourceType())) {
  //     req.abort();
  //   } else {
  //     req.continue();
  //   }
  // });

  try {
    await page.goto("https://shopee.tw", {
      waitUntil: "domcontentloaded",
    });

    const apiResp = await page.waitForResponse(
      (res) => res.url().includes("https://shopee.tw/api/v4/pdp"),
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
