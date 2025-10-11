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
import puppeteer from "puppeteer";
import type { AxeResults } from "axe-core";

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

// Create server instance
const server = new Server(
  {
    name: "axecore-mcp-server",
    version: "1.0.0",
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
  
  let output = `# Accessibility Test Results\n\n`;
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

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_url",
        description: "Run axe-core accessibility tests on a given URL and return detailed violation reports",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to test for accessibility issues (must include http:// or https://)",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Optional array of tags to filter rules (e.g., ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "analyze_html",
        description: "Run axe-core accessibility tests on raw HTML content",
        inputSchema: {
          type: "object",
          properties: {
            html: {
              type: "string",
              description: "The HTML content to test for accessibility issues",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Optional array of tags to filter rules (e.g., ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])",
            },
          },
          required: ["html"],
        },
      },
      {
        name: "get_rules",
        description: "Get information about all available axe-core accessibility rules",
        inputSchema: {
          type: "object",
          properties: {
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

  if (name === "analyze_url") {
    const url = args?.url as string;
    const tags = args?.tags as string[] | undefined;

    if (!url) {
      throw new Error("URL is required");
    }

    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle0" });

      // Inject axe-core
      await page.addScriptTag({
        path: "./node_modules/axe-core/axe.min.js",
      });

      // Run axe
      const results = await page.evaluate((runTags) => {
        return new Promise((resolve) => {
          // @ts-ignore - axe is injected globally
          axe.run(runTags ? { runOnly: runTags } : {}).then(resolve);
        });
      }, tags);

      const formattedResults = formatAxeResults(results as AxeResults);

      return {
        content: [
          {
            type: "text",
            text: formattedResults,
          },
        ],
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

    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      // Inject axe-core
      await page.addScriptTag({
        path: "./node_modules/axe-core/axe.min.js",
      });

      // Run axe
      const results = await page.evaluate((runTags) => {
        return new Promise((resolve) => {
          // @ts-ignore - axe is injected globally
          axe.run(runTags ? { runOnly: runTags } : {}).then(resolve);
        });
      }, tags);

      const formattedResults = formatAxeResults(results as AxeResults);

      return {
        content: [
          {
            type: "text",
            text: formattedResults,
          },
        ],
      };
    } finally {
      await browser.close();
    }
  }

  if (name === "get_rules") {
    const tags = args?.tags as string[] | undefined;

    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent("<html><body></body></html>");

      // Inject axe-core
      await page.addScriptTag({
        path: "./node_modules/axe-core/axe.min.js",
      });

      // Get rules
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
        content: [
          {
            type: "text",
            text: output,
          },
        ],
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
        uri: "axe://wcag-guidelines",
        name: "WCAG Guidelines Reference",
        description: "Information about WCAG accessibility guidelines and levels",
        mimeType: "text/plain",
      },
      {
        uri: "axe://common-issues",
        name: "Common Accessibility Issues",
        description: "Most common accessibility issues found in web applications",
        mimeType: "text/plain",
      },
    ],
  };
});

// Read resource contents
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "axe://wcag-guidelines") {
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

## Four Principles of WCAG (POUR)

1. **Perceivable**: Information and UI components must be presentable to users in ways they can perceive
2. **Operable**: UI components and navigation must be operable
3. **Understandable**: Information and operation of UI must be understandable
4. **Robust**: Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies`,
        },
      ],
    };
  }

  if (uri === "axe://common-issues") {
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
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I need to perform a WCAG ${wcagLevel} accessibility review. Please analyze the accessibility of my webpage and provide:

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
  
  console.error("Axecore MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
