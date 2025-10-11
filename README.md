# Axecore MCP Server

A Model Context Protocol (MCP) server that provides accessibility testing tools using axe-core. This server enables AI assistants to analyze web pages and HTML for accessibility issues.

## Features

### 🛠️ Tools

- **`analyze_url`**: Run axe-core accessibility tests on any URL
  - Automatically launches a headless browser
  - Tests against WCAG guidelines
  - Returns detailed violation reports with remediation guidance
  - Optional filtering by WCAG level (A, AA, AAA)

- **`analyze_html`**: Test raw HTML content for accessibility issues
  - Perfect for testing components or HTML snippets
  - Same comprehensive reporting as URL analysis

- **`get_rules`**: Get information about all available axe-core rules
  - View all accessibility rules
  - Filter by tags (wcag2a, wcag2aa, wcag21aa, etc.)
  - See descriptions and help URLs

### 📚 Resources

- **WCAG Guidelines Reference**: Information about WCAG levels and principles
- **Common Accessibility Issues**: Most frequent violations and how to fix them

### 💬 Prompts

- **`accessibility_review`**: Get guidance on performing comprehensive accessibility reviews
- **`fix_suggestion`**: Get specific remediation steps for accessibility issues

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Development

Watch mode for automatic rebuilding:

```bash
npm run watch
```

## Usage Examples

### Analyzing a URL

```typescript
// The AI assistant can use this tool to test any website
{
  "name": "analyze_url",
  "arguments": {
    "url": "https://example.com",
    "tags": ["wcag2aa", "wcag21aa"]  // Optional: filter by WCAG level
  }
}
```

### Analyzing HTML Content

```typescript
{
  "name": "analyze_html",
  "arguments": {
    "html": "<button>Click me</button>",  // Missing accessible label
    "tags": ["wcag2a"]
  }
}
```

### Getting Rule Information

```typescript
{
  "name": "get_rules",
  "arguments": {
    "tags": ["wcag2aa"]  // Optional: filter by tag
  }
}
```

## Testing with Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "axecore": {
      "command": "node",
      "args": ["/Users/JWatkin70/Sites/axecore-mcp-server/build/index.js"]
    }
  }
}
```

After adding the configuration, restart Claude Desktop. You can then ask Claude to:

- "Test https://example.com for accessibility issues"
- "What are the WCAG 2.1 AA rules?"
- "Analyze this HTML for accessibility problems: `<img src='photo.jpg'>`"
- "Give me guidance on performing an accessibility review"

## Understanding Results

The server provides detailed reports including:

- **Violations**: Issues that definitely fail accessibility standards
  - Impact level (critical, serious, moderate, minor)
  - Affected HTML elements
  - WCAG criteria violated
  - Links to remediation guidance

- **Passes**: Rules that were checked and passed
- **Incomplete**: Issues that need manual verification
- **Inapplicable**: Rules that don't apply to the tested content

## WCAG Tags

Common tags you can use to filter tests:

- `wcag2a` - WCAG 2.0 Level A
- `wcag2aa` - WCAG 2.0 Level AA (most common target)
- `wcag2aaa` - WCAG 2.0 Level AAA
- `wcag21a` - WCAG 2.1 Level A
- `wcag21aa` - WCAG 2.1 Level AA
- `wcag22aa` - WCAG 2.2 Level AA
- `best-practice` - Best practices beyond WCAG
- `section508` - Section 508 compliance

## Running the Server

```bash
npm start
```

## Project Structure

```
├── src/
│   └── index.ts          # Main server with axe-core integration
├── build/                # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. The server uses Puppeteer to launch a headless browser
2. Navigates to the URL or loads the HTML content
3. Injects the axe-core accessibility testing engine
4. Runs the configured accessibility tests
5. Returns formatted results with violations, passes, and suggestions

## Dependencies

- **@modelcontextprotocol/sdk**: MCP server framework
- **axe-core**: Industry-standard accessibility testing engine
- **puppeteer**: Headless browser automation

## License

MIT
