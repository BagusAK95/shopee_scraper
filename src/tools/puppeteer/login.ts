import puppeteer from "puppeteer-extra";
import { Page } from "puppeteer";
import { createCursor, GhostCursor } from "ghost-cursor";
import { installMouseHelper } from "ghost-cursor";
import { typeInto } from "@forad/puppeteer-humanize";

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

const typeConfig = {
  mistakes: {
    chance: 8,
    delay: {
      min: 50,
      max: 500,
    },
  },
  delays: {
    space: {
      chance: 70,
      min: 10,
      max: 50,
    },
  },
};

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
  const cursor = createCursor(page);
  await installMouseHelper(page);

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

  // Block images for faster loading
  // await page.setRequestInterception(true);
  // page.on("request", (req) => {
  //   const type = req.resourceType();
  //   if (["image"].includes(type)) {
  //     req.abort();
  //   } else {
  //     req.continue();
  //   }
  // });

  try {
    await page.goto("https://shopee.tw", {
      waitUntil: "domcontentloaded",
    });

    await inputEmail(page, cursor);
    await inputPassword(page, cursor);
    await clickLogin(page, cursor);

    await page.waitForSelector("div#sll2-UserAvatar", { timeout: 300000 });
    await new Promise((resolve) => setTimeout(resolve, 120000));
    await page.goto("https://shopee.tw/a-i.1439463026.28430488074", {
      waitUntil: "domcontentloaded",
    });

    const apiResp = await page.waitForResponse(
      (res) => res.url().includes("https://shopee.tw/api/v4/pdp"),
      { timeout: 300000 }
    );

    const jsonResp = await apiResp.json();
    console.log(jsonResp);

    await new Promise((resolve) => setTimeout(resolve, 999999999));
  } catch (e) {
    console.error(e);
    return e;
  } finally {
    await browser.close();
  }
})();

async function inputEmail(page: Page, cursor: GhostCursor) {
  const emailInput: any = await page.waitForSelector("input[name='loginKey']");
  if (!emailInput) {
    throw new Error("Email input not found");
  }

  await cursor.move(emailInput, { randomizeMoveDelay: true });
  await cursor.click(emailInput);
  await typeInto(emailInput, "wildan.christine@gmail.com", typeConfig);

  await new Promise((resolve) =>
    setTimeout(resolve, 300 + Math.random() * 300)
  );
}

async function inputPassword(page: Page, cursor: GhostCursor) {
  const passwordInput: any = await page.waitForSelector(
    "input[name='password']"
  );
  if (!passwordInput) {
    throw new Error("Password input not found");
  }

  await cursor.move(passwordInput, { randomizeMoveDelay: true });
  await cursor.click(passwordInput);
  await typeInto(passwordInput, "2804ShopeeSaya", typeConfig);

  await new Promise((resolve) =>
    setTimeout(resolve, 300 + Math.random() * 300)
  );
}

async function clickLogin(page: Page, cursor: GhostCursor) {
  const loginButton: any = await page.waitForSelector("button.b5aVaf");
  if (!loginButton) {
    throw new Error("Login button not found");
  }

  await cursor.move(loginButton, { randomizeMoveDelay: true });
  await cursor.click(loginButton);
}
