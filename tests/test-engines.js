// Test script for Accessibility Testing MCP Server v2.0.0
// Tests both Axe-core and IBM Equal Access engines

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const AXE_CORE_PATH = join(__dirname, 'node_modules/axe-core/axe.min.js');

const testHtml = `
<!DOCTYPE html>
<html>
<head><title>Test Page</title></head>
<body>
  <img src="test.jpg">
  <button></button>
  <input type="text">
  <a href="#">Click here</a>
</body>
</html>
`;

async function testAxeCore() {
  console.log('\n=== Testing Axe-core Engine ===\n');
  
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(testHtml, { waitUntil: 'networkidle0' });
    await page.addScriptTag({ path: AXE_CORE_PATH });
    
    const results = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore
        axe.run().then(resolve);
      });
    });
    
    console.log(`✅ Axe-core found ${results.violations.length} violations`);
    results.violations.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.id}: ${v.help} (${v.nodes.length} elements)`);
    });
    console.log(`✅ Axe-core test passed!`);
    return true;
  } catch (error) {
    console.error('❌ Axe-core test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

async function testIBMEqualAccess() {
  console.log('\n=== Testing IBM Equal Access Engine ===\n');
  
  try {
    const aChecker = await import('accessibility-checker');
    
    const result = await aChecker.getCompliance(testHtml, 'test-html');
    const report = result.report;
    
    const violations = report.results.filter(r => r.level === 'violation');
    const potentialViolations = report.results.filter(r => r.level === 'potentialviolation');
    
    console.log(`✅ IBM Equal Access found:`);
    console.log(`   - ${violations.length} violations`);
    console.log(`   - ${potentialViolations.length} potential violations`);
    
    violations.slice(0, 5).forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.ruleId}: ${v.message}`);
    });
    
    await aChecker.close();
    console.log(`✅ IBM Equal Access test passed!`);
    return true;
  } catch (error) {
    console.error('❌ IBM Equal Access test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('Accessibility Testing MCP Server v2.0.0 - Test Suite');
  console.log('====================================================');
  
  const axeResult = await testAxeCore();
  const aceResult = await testIBMEqualAccess();
  
  console.log('\n=== Test Summary ===');
  console.log(`Axe-core: ${axeResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`IBM Equal Access: ${aceResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (axeResult && aceResult) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed');
    process.exit(1);
  }
}

main();
