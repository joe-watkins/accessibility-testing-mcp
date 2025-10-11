#!/usr/bin/env node

/**
 * Quick test script for the analyze_url_json functionality
 * Run with: node test-json-tool.js
 */

import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const AXE_CORE_PATH = join(__dirname, "node_modules/axe-core/axe.min.js");
const NAVIGATION_TIMEOUT = 90000;

async function testAnalyzeUrlJson(url, tags) {
  console.log(`Testing: ${url}`);
  console.log(`Tags: ${tags ? tags.join(", ") : "all"}`);
  console.log("---\n");

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT,
    });

    // Wait a bit for dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Inject axe-core
    await page.addScriptTag({
      path: AXE_CORE_PATH,
    });

    // Run axe
    const results = await page.evaluate((runTags) => {
      return new Promise((resolve) => {
        // @ts-ignore - axe is injected globally
        axe.run(runTags ? { runOnly: runTags } : {}).then(resolve);
      });
    }, tags);

    // Return only violations as JSON
    console.log(JSON.stringify(results.violations, null, 2));
    console.log("\n---");
    console.log(`Total violations found: ${results.violations.length}`);
  } finally {
    await browser.close();
  }
}

// Test the T-Mobile URL
testAnalyzeUrlJson("https://www.t-mobile.com/")
  .then(() => {
    console.log("\nTest completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
