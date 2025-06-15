# Shopee Scraper

REST API for scraping product details from Shopee.

## Features
- Scrape Shopee product details via API.

## Project Structure
```
shopee_scraper/
├── src/
│   ├── controller/      # API controllers
│   ├── infrastructure/  # Infrastructure
│   ├── router/          # API route definitions
│   ├── service/         # Business logic
│   ├── utils/           # Utilities
│   └── server.ts        # Main entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript config
└── README.md            # Project documentation
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd shopee_scraper
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Build the project**
   ```bash
   npx tsc
   ```
4. **Run the server**
   ```bash
   node dist/src/server.js
   ```
   Or, for development with auto-reload:
   ```bash
   npx ts-node src/server.ts
   ```
5. Install Chrome Browser
   ```bash
   brew install --cask google-chrome
   ```
6. Install Tampermonkey extension on Chrome
   ```
   https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   ```
7. Add the following script to Tampermonkey:
  ```javascript
  // ==UserScript==
  // @name         Shopee Collector v2 (Socket.IO)
  // @namespace    http://tampermonkey.net/
  // @version      2.1
  // @description  Save and forward Shopee’s /api/v4/pdp/get_pc response using Socket.IO
  // @match        https://shopee.tw/*
  // @grant        none
  // @run-at       document-start
  // ==/UserScript==

  (function () {
    "use strict";

    const SOCKET_IO_SRC = "https://cdn.socket.io/4.7.2/socket.io.min.js";
    const SOCKET_SERVER = "http://127.0.0.1:3000";

    let socket = null;

    // Load Socket.IO script into the page
    function loadSocketIO(callback) {
      const script = document.createElement("script");
      script.src = SOCKET_IO_SRC;
      script.onload = callback;
      document.head.appendChild(script);
    }

    function connectSocket() {
      socket = io(SOCKET_SERVER);

      socket.on("connect", () => {
        console.log("[Shopee Collector] Socket.IO connected:", socket.id);
      });

      socket.on("disconnect", () => {
        console.warn("[Shopee Collector] Socket.IO disconnected");
      });

      socket.on("shopee_product_detail_request", async ({ shopId, itemId }) => {
        console.log("[Shopee Collector] Task received:", `${shopId}.${itemId}`);
        await handleIncomingTask(shopId, itemId);
      });
    }

    function handleIncomingTask(shopId, itemId) {
      const url = `https://shopee.tw/a-i.${shopId}.${itemId}`;
      if (location.href !== url) location.href = url;
    }

    function sendToServer(payload) {
      if (socket && socket.connected) {
        socket.emit("shopee_product_detail_response", payload);
        console.log("[Shopee Collector] Sent payload:", payload);
      } else {
        console.error("[Shopee Collector] Socket.IO not connected");
      }
    }

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const url = args[0];
      const res = await originalFetch.apply(this, args);

      if (typeof url === "string" && url.includes("/api/v4/pdp/get_pc")) {
        const shopId = url.split("shop_id=")[1].split("&")[0];
        const itemId = url.split("item_id=")[1].split("&")[0];

        res.clone()
          .json()
          .then((data) => sendToServer({ shopId, itemId, data }))
          .catch(() => {});
      }

      return res;
    };

    loadSocketIO(connectSocket);
  })();
  ```
8. Install Oxylabs proxy extension on Chrome
   ```
   https://chromewebstore.google.com/detail/oxylabs-proxy-extension/infajoaodhhdogakhloedbppcbeajhoo
   ```
9. Setup Oxylabs proxy (Residential proxy recommended)
10. Open the browser and navigate to `https://shopee.tw`.

## Usage

### API Endpoint
- **GET** `/shopee?shopId=<shop_id>&itemId=<item_id>`
  - Returns Shopee product details as JSON.
  - Example:
    ```bash
    curl 'http://localhost:3000/shopee?shopId=178926468&itemId=21448123549'
    ```
- **Validation**: Both `shopId` and `itemId` are required and must be numeric.
- **Rate Limiting**: 100 requests per minute per IP.

### Real-time Scraping
- The backend communicates with a browser instance via Socket.io for real-time scraping.
- Ensure a compatible browser client is connected to the Socket.io server for full functionality.

## Main Technologies
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Socket.io](https://socket.io/)
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)
- [express-validator](https://express-validator.github.io/)

## Environment Variables
- `PORT`: (Optional) Set the server port. Default is `3000`.