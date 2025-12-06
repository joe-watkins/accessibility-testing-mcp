#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import puppeteer, { Browser, Page } from "puppeteer";
import type { AxeResults } from "axe-core";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const AXE_CORE_PATH = join(__dirname, "../node_modules/axe-core/axe.min.js");

// Configuration
const NAVIGATION_TIMEOUT = 90000; // 90 seconds for complex sites

// Engine types
type Engine = "axe" | "ace";

// Normalized WCAG levels that work for both engines
type WcagLevel = "2.0_A" | "2.0_AA" | "2.0_AAA" | "2.1_A" | "2.1_AA" | "2.1_AAA" | "2.2_A" | "2.2_AA" | "2.2_AAA";

// Mapping from normalized WCAG level to engine-specific values
const WCAG_LEVEL_MAP: Record<WcagLevel, { axeTags: string[]; acePolicy: string }> = {
  "2.0_A":   { axeTags: ["wcag2a"],   acePolicy: "WCAG_2_0" },
  "2.0_AA":  { axeTags: ["wcag2a", "wcag2aa"],  acePolicy: "WCAG_2_0" },
  "2.0_AAA": { axeTags: ["wcag2a", "wcag2aa", "wcag2aaa"], acePolicy: "WCAG_2_0" },
  "2.1_A":   { axeTags: ["wcag2a", "wcag21a"],  acePolicy: "WCAG_2_1" },
  "2.1_AA":  { axeTags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"], acePolicy: "WCAG_2_1" },
  "2.1_AAA": { axeTags: ["wcag2a", "wcag2aa", "wcag2aaa", "wcag21a", "wcag21aa", "wcag21aaa"], acePolicy: "WCAG_2_1" },
  "2.2_A":   { axeTags: ["wcag2a", "wcag21a", "wcag22a"], acePolicy: "WCAG_2_2" },
  "2.2_AA":  { axeTags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"], acePolicy: "WCAG_2_2" },
  "2.2_AAA": { axeTags: ["wcag2a", "wcag2aa", "wcag2aaa", "wcag21a", "wcag21aa", "wcag21aaa", "wcag22a", "wcag22aa", "wcag22aaa"], acePolicy: "WCAG_2_2" },
};

// Environment-based configuration with defaults
const DEFAULT_ENGINE: Engine = "axe";
const DEFAULT_WCAG_LEVEL: WcagLevel = "2.1_AA";
const DEFAULT_RUN_EXPERIMENTAL = false;
const DEFAULT_BEST_PRACTICES = true;

interface ServerConfig {
  engine: Engine;
  wcagLevel: WcagLevel;
  runExperimental: boolean;
  includeBestPractices: boolean;
  aceReportLevels: string[];
}

// Parse WCAG_LEVEL env var with flexible input formats
function parseWcagLevel(input: string | undefined): WcagLevel {
  if (!input) return DEFAULT_WCAG_LEVEL;
  
  // Normalize input: remove spaces, convert to uppercase for level
  const normalized = input.trim().toLowerCase()
    .replace(/wcag\s*/i, "")      // Remove "WCAG" prefix
    .replace(/\s+/g, "_")          // Replace spaces with underscore
    .replace(/level\s*/i, "")      // Remove "level" word
    .replace(/_+/g, "_");          // Clean up multiple underscores
  
  // Try to match patterns like "2.1_aa", "21aa", "2.1 AA", etc.
  const match = normalized.match(/^(\d)\.?(\d)?[_\s]*(a{1,3})$/i);
  if (match) {
    const major = match[1];
    const minor = match[2] || "0";
    const level = match[3].toUpperCase();
    const key = `${major}.${minor}_${level}` as WcagLevel;
    if (key in WCAG_LEVEL_MAP) return key;
  }
  
  // Direct match attempt
  if (input in WCAG_LEVEL_MAP) return input as WcagLevel;
  
  // Fallback to default
  console.error(`Invalid WCAG_LEVEL "${input}", using default "${DEFAULT_WCAG_LEVEL}"`);
  return DEFAULT_WCAG_LEVEL;
}

// Load configuration from environment variables
function loadConfig(): ServerConfig {
  const engine = (process.env.A11Y_ENGINE?.toLowerCase() as Engine) || DEFAULT_ENGINE;
  const wcagLevel = parseWcagLevel(process.env.WCAG_LEVEL);
  const runExperimental = process.env.RUN_EXPERIMENTAL === "true" || DEFAULT_RUN_EXPERIMENTAL;
  const includeBestPractices = process.env.BEST_PRACTICES !== "false" && DEFAULT_BEST_PRACTICES;
  
  // Build ACE report levels based on BEST_PRACTICES (recommendations = best practices for ACE)
  const aceReportLevels = process.env.ACE_REPORT_LEVELS
    ? process.env.ACE_REPORT_LEVELS.split(",").map(l => l.trim())
    : includeBestPractices 
      ? ["violation", "potentialviolation", "recommendation"]
      : ["violation", "potentialviolation"];

  return {
    engine,
    wcagLevel,
    runExperimental,
    includeBestPractices,
    aceReportLevels,
  };
}

const serverConfig = loadConfig();

// Get axe tags for current WCAG level
function getAxeTags(): string[] {
  return WCAG_LEVEL_MAP[serverConfig.wcagLevel].axeTags;
}

// Get ACE policy for current WCAG level
function getAcePolicy(): string {
  return WCAG_LEVEL_MAP[serverConfig.wcagLevel].acePolicy;
}

// Helper function to build axe run options
function buildAxeOptions(userTags?: string[]): any {
  const tags: string[] = [];
  
  // If user provides tags, use those exclusively
  if (userTags && userTags.length > 0) {
    return { runOnly: userTags };
  }
  
  // Otherwise, use server configuration
  tags.push(...getAxeTags());
  
  if (serverConfig.includeBestPractices) {
    tags.push("best-practice");
  }
  
  const options: any = { runOnly: tags };
  
  if (serverConfig.runExperimental) {
    options.runExperimental = true;
  }
  
  return options;
}

// Type definitions for axe-core results
interface AxeResultNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

interface AxeResultItem {
  id: string;
  impact?: string;
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeResultNode[];
}

// ACE result types
interface ACEResultItem {
  ruleId: string;
  reasonId: string;
  value: [string, string]; // [VIOLATION|RECOMMENDATION|INFORMATION, PASS|FAIL|POTENTIAL|MANUAL]
  path: {
    dom: string;
    aria: string;
  };
  message: string;
  messageArgs: string[];
  snippet: string;
  category: string;
  level: string; // violation, potentialviolation, recommendation, potentialrecommendation, manual, pass
  help?: string;
}

interface ACEReport {
  scanID: string;
  toolID: string;
  label: string;
  numExecuted: number;
  nls: Record<string, Record<string, string>>;
  summary: {
    URL: string;
    counts: {
      violation: number;
      potentialviolation: number;
      recommendation: number;
      potentialrecommendation: number;
      manual: number;
      pass: number;
      ignored: number;
    };
    scanTime: number;
    ruleArchive: string;
    policies: string[];
    reportLevels: string[];
    startScan: number;
  };
  results: ACEResultItem[];
}

// Create server instance
const server = new Server(
  {
    name: "accessibility-testing-mcp",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// Helper function to format axe results
function formatAxeResults(results: any): string {
  const violations = results.violations || [];
  const passes = results.passes || [];
  const incomplete = results.incomplete || [];
  const inapplicable = results.inapplicable || [];
  
  let output = `# Accessibility Test Results (Axe-core)\n\n`;
  output += `**URL**: ${results.url}\n`;
  output += `**Timestamp**: ${results.timestamp}\n\n`;
  output += `## Summary\n`;
  output += `- ✅ Passes: ${passes.length}\n`;
  output += `- ❌ Violations: ${violations.length}\n`;
  output += `- ⚠️  Incomplete: ${incomplete.length}\n`;
  output += `- ℹ️  Inapplicable: ${inapplicable.length}\n\n`;

  if (violations.length > 0) {
    output += `## Violations\n\n`;
    violations.forEach((violation: AxeResultItem, index: number) => {
      output += `### ${index + 1}. ${violation.help}\n`;
      output += `**Impact**: ${violation.impact}\n`;
      output += `**Description**: ${violation.description}\n`;
      output += `**WCAG**: ${violation.tags.filter((tag: string) => tag.startsWith('wcag')).join(', ')}\n`;
      output += `**Affected Elements**: ${violation.nodes.length}\n\n`;
      violation.nodes.forEach((node: AxeResultNode, nodeIndex: number) => {
        output += `  ${nodeIndex + 1}. \`${node.html}\`\n`;
        output += `     Target: ${node.target.join(' ')}\n`;
        if (node.failureSummary) {
          output += `     ${node.failureSummary}\n`;
        }
        output += `\n`;
      });
      output += `**How to fix**: ${violation.helpUrl}\n\n`;
    });
  }

  if (incomplete.length > 0) {
    output += `## Incomplete Checks (Need Manual Review)\n\n`;
    incomplete.forEach((item: AxeResultItem, index: number) => {
      output += `${index + 1}. **${item.help}** (${item.nodes.length} elements)\n`;
    });
    output += `\n`;
  }

  return output;
}

// Helper function to format ACE results
function formatACEResults(report: ACEReport): string {
  const { summary, results } = report;
  const violations = results.filter(r => r.level === "violation");
  const potentialViolations = results.filter(r => r.level === "potentialviolation");
  const recommendations = results.filter(r => r.level === "recommendation");
  const manualChecks = results.filter(r => r.level === "manual");
  
  let output = `# Accessibility Test Results (IBM Equal Access)\n\n`;
  output += `**URL**: ${summary.URL}\n`;
  output += `**Scan Time**: ${summary.scanTime}ms\n`;
  output += `**Policies**: ${summary.policies.join(", ")}\n`;
  output += `**Rule Archive**: ${summary.ruleArchive}\n\n`;
  
  output += `## Summary\n`;
  output += `- ❌ Violations: ${summary.counts.violation}\n`;
  output += `- ⚠️  Potential Violations: ${summary.counts.potentialviolation}\n`;
  output += `- 💡 Recommendations: ${summary.counts.recommendation}\n`;
  output += `- 🔍 Manual Checks: ${summary.counts.manual}\n`;
  output += `- ✅ Passes: ${summary.counts.pass}\n\n`;

  if (violations.length > 0) {
    output += `## Violations\n\n`;
    violations.forEach((item, index) => {
      output += `### ${index + 1}. ${item.ruleId}\n`;
      output += `**Message**: ${item.message}\n`;
      output += `**Category**: ${item.category}\n`;
      output += `**Path**: ${item.path.dom}\n`;
      output += `**Snippet**: \`${item.snippet}\`\n`;
      output += `**Help**: https://able.ibm.com/rules/rule/${item.ruleId}\n\n`;
    });
  }

  if (potentialViolations.length > 0) {
    output += `## Potential Violations (Need Review)\n\n`;
    potentialViolations.forEach((item, index) => {
      output += `### ${index + 1}. ${item.ruleId}\n`;
      output += `**Message**: ${item.message}\n`;
      output += `**Category**: ${item.category}\n`;
      output += `**Path**: ${item.path.dom}\n`;
      output += `**Snippet**: \`${item.snippet}\`\n\n`;
    });
  }

  if (recommendations.length > 0) {
    output += `## Recommendations\n\n`;
    recommendations.forEach((item, index) => {
      output += `${index + 1}. **${item.ruleId}**: ${item.message}\n`;
      output += `   Path: ${item.path.dom}\n\n`;
    });
  }

  if (manualChecks.length > 0) {
    output += `## Manual Checks Required\n\n`;
    manualChecks.forEach((item, index) => {
      output += `${index + 1}. **${item.ruleId}**: ${item.message}\n`;
    });
    output += `\n`;
  }

  return output;
}

// Convert ACE results to Axe-like JSON format for consistency
function aceToAxeViolationsFormat(report: ACEReport): any[] {
  const violations = report.results.filter(r => 
    r.level === "violation" || r.level === "potentialviolation"
  );
  
  // Group by ruleId
  const grouped = violations.reduce((acc, item) => {
    if (!acc[item.ruleId]) {
      acc[item.ruleId] = {
        id: item.ruleId,
        impact: item.level === "violation" ? "serious" : "moderate",
        tags: [`ibm-${item.category.toLowerCase().replace(/\s+/g, "-")}`],
        description: item.message,
        help: item.message,
        helpUrl: `https://able.ibm.com/rules/rule/${item.ruleId}`,
        nodes: []
      };
    }
    acc[item.ruleId].nodes.push({
      html: item.snippet,
      target: [item.path.dom],
      failureSummary: item.message
    });
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped);
}

// ACE analysis function
async function runACEAnalysis(content: string, label: string, policies?: string[]): Promise<ACEReport> {
  // Dynamic import for accessibility-checker (ESM compatibility)
  const aChecker = await import("accessibility-checker");
  
  // Use provided policies, or derive from WCAG_LEVEL config
  const effectivePolicies = policies || [getAcePolicy()];
  
  try {
    // Note: accessibility-checker uses .achecker.yml or defaults
    // We pass the content and let it use its configuration
    const result = await aChecker.getCompliance(content, label);
    return result.report as unknown as ACEReport;
  } finally {
    await aChecker.close();
  }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const configNote = `Engine: ${serverConfig.engine}, WCAG: ${serverConfig.wcagLevel}`;
  
  return {
    tools: [
      {
        name: "analyze_url",
        description: `Run accessibility tests on a URL and return detailed violation reports. [${configNote}]`,
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to test for accessibility issues (must include http:// or https://)",
            },
            engine: {
              type: "string",
              enum: ["axe", "ace"],
              description: "Testing engine: 'axe' (axe-core) or 'ace' (IBM Equal Access). Defaults to server config.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Override default tags/policies. For Axe: ['wcag2a', 'wcag2aa', 'best-practice']. For ACE: ['WCAG_2_1', 'WCAG_2_2']",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "analyze_url_json",
        description: `Run accessibility tests on a URL and return violations in raw JSON format. [${configNote}]`,
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to test for accessibility issues (must include http:// or https://)",
            },
            engine: {
              type: "string",
              enum: ["axe", "ace"],
              description: "Testing engine: 'axe' (axe-core) or 'ace' (IBM Equal Access). Defaults to server config.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Override default tags/policies. For Axe: ['wcag2a', 'wcag2aa', 'best-practice']. For ACE: ['WCAG_2_1', 'WCAG_2_2']",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "analyze_html",
        description: `Run accessibility tests on raw HTML content. [${configNote}]`,
        inputSchema: {
          type: "object",
          properties: {
            html: {
              type: "string",
              description: "The HTML content to test for accessibility issues",
            },
            engine: {
              type: "string",
              enum: ["axe", "ace"],
              description: "Testing engine: 'axe' (axe-core) or 'ace' (IBM Equal Access). Defaults to server config.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Override default tags/policies. For Axe: ['wcag2a', 'wcag2aa', 'best-practice']. For ACE: ['WCAG_2_1', 'WCAG_2_2']",
            },
          },
          required: ["html"],
        },
      },
      {
        name: "analyze_html_json",
        description: `Run accessibility tests on raw HTML content and return violations in raw JSON format. [${configNote}]`,
        inputSchema: {
          type: "object",
          properties: {
            html: {
              type: "string",
              description: "The HTML content to test for accessibility issues",
            },
            engine: {
              type: "string",
              enum: ["axe", "ace"],
              description: "Testing engine: 'axe' (axe-core) or 'ace' (IBM Equal Access). Defaults to server config.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Override default tags/policies. For Axe: ['wcag2a', 'wcag2aa', 'best-practice']. For ACE: ['WCAG_2_1', 'WCAG_2_2']",
            },
          },
          required: ["html"],
        },
      },
      {
        name: "get_rules",
        description: `Get information about available accessibility rules for the specified engine. [${configNote}]`,
        inputSchema: {
          type: "object",
          properties: {
            engine: {
              type: "string",
              enum: ["axe", "ace"],
              description: "Testing engine to get rules for. Defaults to server config.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Optional array of tags to filter rules (e.g., ['wcag2a', 'wcag2aa', 'wcag21aa'])",
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const engine = (args?.engine as Engine) || serverConfig.engine;

  if (name === "analyze_url") {
    const url = args?.url as string;
    const tags = args?.tags as string[] | undefined;

    if (!url) {
      throw new Error("URL is required");
    }

    if (engine === "ace") {
      // Use IBM Equal Access
      const report = await runACEAnalysis(url, `url-${Date.now()}`, tags);
      const formattedResults = formatACEResults(report);
      return {
        content: [{ type: "text", text: formattedResults }],
      };
    }

    // Use Axe-core
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(url, { 
        waitUntil: "domcontentloaded",
        timeout: NAVIGATION_TIMEOUT 
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));

      await page.addScriptTag({ path: AXE_CORE_PATH });

      const results = await page.evaluate((runTags) => {
        return new Promise((resolve) => {
          // @ts-ignore - axe is injected globally
          axe.run(runTags ? { runOnly: runTags } : {}).then(resolve);
        });
      }, tags);

      const formattedResults = formatAxeResults(results as AxeResults);

      return {
        content: [{ type: "text", text: formattedResults }],
      };
    } finally {
      await browser.close();
    }
  }

  if (name === "analyze_url_json") {
    const url = args?.url as string;
    const tags = args?.tags as string[] | undefined;

    if (!url) {
      throw new Error("URL is required");
    }

    if (engine === "ace") {
      const report = await runACEAnalysis(url, `url-json-${Date.now()}`, tags);
      const violations = aceToAxeViolationsFormat(report);
      return {
        content: [{ type: "text", text: JSON.stringify(violations, null, 2) }],
      };
    }

    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(url, { 
        waitUntil: "domcontentloaded",
        timeout: NAVIGATION_TIMEOUT 
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));

      await page.addScriptTag({ path: AXE_CORE_PATH });

      const axeOptions = buildAxeOptions(tags);
      const results = await page.evaluate((options) => {
        return new Promise((resolve) => {
          // @ts-ignore - axe is injected globally
          axe.run(options).then(resolve);
        });
      }, axeOptions);

      const axeResults = results as AxeResults;

      return {
        content: [{ type: "text", text: JSON.stringify(axeResults.violations, null, 2) }],
      };
    } finally {
      await browser.close();
    }
  }

  if (name === "analyze_html") {
    const html = args?.html as string;
    const tags = args?.tags as string[] | undefined;

    if (!html) {
      throw new Error("HTML content is required");
    }

    if (engine === "ace") {
      const report = await runACEAnalysis(html, `html-${Date.now()}`, tags);
      const formattedResults = formatACEResults(report);
      return {
        content: [{ type: "text", text: formattedResults }],
      };
    }

    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { 
        waitUntil: "networkidle0",
        timeout: NAVIGATION_TIMEOUT 
      });

      await page.addScriptTag({ path: AXE_CORE_PATH });

      const axeOptions = buildAxeOptions(tags);
      const results = await page.evaluate((options) => {
        return new Promise((resolve) => {
          // @ts-ignore - axe is injected globally
          axe.run(options).then(resolve);
        });
      }, axeOptions);

      const formattedResults = formatAxeResults(results as AxeResults);

      return {
        content: [{ type: "text", text: formattedResults }],
      };
    } finally {
      await browser.close();
    }
  }

  if (name === "analyze_html_json") {
    const html = args?.html as string;
    const tags = args?.tags as string[] | undefined;

    if (!html) {
      throw new Error("HTML content is required");
    }

    if (engine === "ace") {
      const report = await runACEAnalysis(html, `html-json-${Date.now()}`, tags);
      const violations = aceToAxeViolationsFormat(report);
      return {
        content: [{ type: "text", text: JSON.stringify(violations, null, 2) }],
      };
    }

    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { 
        waitUntil: "networkidle0",
        timeout: NAVIGATION_TIMEOUT 
      });

      await page.addScriptTag({ path: AXE_CORE_PATH });

      const axeOptions = buildAxeOptions(tags);
      const results = await page.evaluate((options) => {
        return new Promise((resolve) => {
          // @ts-ignore - axe is injected globally
          axe.run(options).then(resolve);
        });
      }, axeOptions);

      const axeResults = results as AxeResults;

      return {
        content: [{ type: "text", text: JSON.stringify(axeResults.violations, null, 2) }],
      };
    } finally {
      await browser.close();
    }
  }

  if (name === "get_rules") {
    const tags = args?.tags as string[] | undefined;

    if (engine === "ace") {
      // ACE doesn't have a simple getRules API, provide policy info instead
      let output = `# IBM Equal Access Accessibility Rules\n\n`;
      output += `## Current Configuration\n\n`;
      output += `- **WCAG Level**: ${serverConfig.wcagLevel}\n`;
      output += `- **Policy**: ${getAcePolicy()}\n`;
      output += `- **Report Levels**: ${serverConfig.aceReportLevels.join(", ")}\n\n`;
      output += `## Available Policies\n\n`;
      output += `- **WCAG_2_0**: WCAG 2.0 guidelines\n`;
      output += `- **WCAG_2_1**: WCAG 2.1 guidelines\n`;
      output += `- **WCAG_2_2**: WCAG 2.2 guidelines\n\n`;
      output += `## Report Levels\n\n`;
      output += `- **violation**: Accessibility failures\n`;
      output += `- **potentialviolation**: Needs review for accessibility failures\n`;
      output += `- **recommendation**: Suggested improvements\n`;
      output += `- **potentialrecommendation**: Possible improvements to review\n`;
      output += `- **manual**: Requires manual testing\n\n`;
      output += `For complete rule documentation, visit: https://www.ibm.com/able/requirements/checker-rule-sets\n`;

      return {
        content: [{ type: "text", text: output }],
      };
    }

    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent("<html><body></body></html>");

      await page.addScriptTag({ path: AXE_CORE_PATH });

      const rules = await page.evaluate((filterTags) => {
        // @ts-ignore - axe is injected globally
        const allRules = axe.getRules();
        if (filterTags && filterTags.length > 0) {
          return allRules.filter((rule: any) =>
            rule.tags.some((tag: string) => filterTags.includes(tag))
          );
        }
        return allRules;
      }, tags);

      let output = `# Axe-Core Accessibility Rules\n\n`;
      if (tags && tags.length > 0) {
        output += `**Filtered by tags**: ${tags.join(", ")}\n\n`;
      }
      output += `**Total rules**: ${rules.length}\n\n`;

      rules.forEach((rule: any, index: number) => {
        output += `## ${index + 1}. ${rule.ruleId}\n`;
        output += `**Description**: ${rule.description}\n`;
        output += `**Help**: ${rule.help}\n`;
        output += `**Tags**: ${rule.tags.join(", ")}\n`;
        output += `**Help URL**: ${rule.helpUrl}\n\n`;
      });

      return {
        content: [{ type: "text", text: output }],
      };
    } finally {
      await browser.close();
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "a11y://wcag-guidelines",
        name: "WCAG Guidelines Reference",
        description: "Information about WCAG accessibility guidelines and levels",
        mimeType: "text/plain",
      },
      {
        uri: "a11y://common-issues",
        name: "Common Accessibility Issues",
        description: "Most common accessibility issues found in web applications",
        mimeType: "text/plain",
      },
      {
        uri: "a11y://engine-comparison",
        name: "Engine Comparison",
        description: "Comparison of Axe-core and IBM Equal Access engines",
        mimeType: "text/plain",
      },
    ],
  };
});

// Read resource contents
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "a11y://wcag-guidelines") {
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: `# WCAG Guidelines Reference

## WCAG Levels

- **Level A**: The most basic web accessibility features
- **Level AA**: Deals with the biggest and most common barriers for disabled users (most commonly targeted)
- **Level AAA**: The highest and most complex level of web accessibility

## Common WCAG Tags in axe-core

- **wcag2a**: WCAG 2.0 Level A
- **wcag2aa**: WCAG 2.0 Level AA
- **wcag21a**: WCAG 2.1 Level A
- **wcag21aa**: WCAG 2.1 Level AA
- **wcag22aa**: WCAG 2.2 Level AA
- **best-practice**: Best practices beyond WCAG requirements

## IBM Equal Access (ACE) Policies

- **WCAG_2_0**: WCAG 2.0 guidelines
- **WCAG_2_1**: WCAG 2.1 guidelines (default)
- **WCAG_2_2**: WCAG 2.2 guidelines

## Four Principles of WCAG (POUR)

1. **Perceivable**: Information and UI components must be presentable to users in ways they can perceive
2. **Operable**: UI components and navigation must be operable
3. **Understandable**: Information and operation of UI must be understandable
4. **Robust**: Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies`,
        },
      ],
    };
  }

  if (uri === "a11y://common-issues") {
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: `# Common Accessibility Issues

## Most Frequent Violations

1. **Missing alternative text for images**
   - Images must have alt text for screen readers
   - Use empty alt="" for decorative images

2. **Insufficient color contrast**
   - Text must have sufficient contrast with background
   - Minimum ratio: 4.5:1 for normal text, 3:1 for large text

3. **Missing form labels**
   - All form inputs must have associated labels
   - Use <label> elements or aria-label

4. **Missing document language**
   - HTML must have lang attribute
   - Helps screen readers pronounce content correctly

5. **Keyboard accessibility**
   - All interactive elements must be keyboard accessible
   - Logical tab order and visible focus indicators

6. **Missing ARIA attributes**
   - Use ARIA when HTML5 semantics aren't sufficient
   - Ensure ARIA is used correctly (roles, states, properties)

7. **Heading structure**
   - Headings should be in logical order (h1, h2, h3...)
   - Don't skip heading levels

8. **Link text**
   - Link text should be descriptive
   - Avoid "click here" or "read more"`,
        },
      ],
    };
  }

  if (uri === "a11y://engine-comparison") {
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: `# Accessibility Testing Engine Comparison

## Axe-core (Deque)

**Strengths:**
- Industry standard, widely adopted
- Fast execution
- Zero false positives philosophy
- Extensive rule documentation
- Great browser extension support

**Best for:**
- Quick automated scans
- CI/CD integration
- Projects requiring zero false positives

## IBM Equal Access (ACE)

**Strengths:**
- Comprehensive IBM accessibility requirements
- Detailed remediation guidance
- Covers more edge cases
- Links to IBM accessibility documentation
- Includes potential violations for review

**Best for:**
- Enterprise accessibility compliance
- IBM product development
- Thorough accessibility audits
- Projects needing detailed guidance

## Unified Configuration

Both engines now use the same WCAG_LEVEL setting:

**WCAG_LEVEL values:**
- 2.0_A, 2.0_AA, 2.0_AAA
- 2.1_A, 2.1_AA, 2.1_AAA (default: 2.1_AA)
- 2.2_A, 2.2_AA, 2.2_AAA

**Other settings:**
- A11Y_ENGINE: axe (default) or ace
- BEST_PRACTICES: true/false (axe only)
- RUN_EXPERIMENTAL: true/false (axe only)
- ACE_REPORT_LEVELS: violation, potentialviolation, recommendation

## Choosing an Engine

Use **Axe-core** when you need:
- Fast, reliable automated testing
- Zero false positive philosophy
- Broad community support

Use **IBM Equal Access** when you need:
- More comprehensive rule coverage
- Detailed IBM compliance requirements
- Additional potential violation detection
- Enterprise-level accessibility auditing`,
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "accessibility_review",
        description: "Get guidance on performing an accessibility review",
        arguments: [
          {
            name: "wcag_level",
            description: "Target WCAG level (A, AA, or AAA)",
            required: false,
          },
          {
            name: "engine",
            description: "Testing engine preference (axe or ace)",
            required: false,
          },
        ],
      },
      {
        name: "fix_suggestion",
        description: "Get suggestions for fixing a specific accessibility issue",
        arguments: [
          {
            name: "issue_type",
            description: "Type of accessibility issue",
            required: true,
          },
        ],
      },
    ],
  };
});

// Get prompt by name
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "accessibility_review") {
    const wcagLevel = (args?.wcag_level as string) || "AA";
    const engine = (args?.engine as string) || serverConfig.engine;
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I need to perform a WCAG ${wcagLevel} accessibility review using ${engine === 'ace' ? 'IBM Equal Access' : 'axe-core'}. Please analyze the accessibility of my webpage and provide:

1. A summary of violations found
2. Priority ranking based on impact
3. Specific remediation steps for each issue
4. Code examples where applicable

Focus on ${wcagLevel} compliance and highlight any critical issues that could prevent users with disabilities from accessing the content.`,
          },
        },
      ],
    };
  }

  if (name === "fix_suggestion") {
    const issueType = args?.issue_type as string;
    if (!issueType) {
      throw new Error("issue_type is required");
    }
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I have an accessibility issue: "${issueType}". Please provide:

1. Why this is an accessibility problem
2. Which WCAG guidelines it violates
3. Step-by-step remediation instructions
4. Code examples showing the correct implementation
5. How to test that the fix works

Make the explanation clear and actionable.`,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error(`Accessibility Testing MCP Server v2.0.0 (Engine: ${serverConfig.engine}, WCAG: ${serverConfig.wcagLevel})`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
