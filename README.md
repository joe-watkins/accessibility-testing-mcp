# Axecore MCP Server

An Accessibility Sub-agent / Model Context Protocol (MCP) server that provides accessibility testing tools using axe-core. This server enables AI assistants to analyze web pages and HTML for accessibility issues.

## Features

### 🛠️ Tools

- **`analyze_url`**: Run axe-core accessibility tests on any URL
  - Automatically launches a headless browser
  - Tests against WCAG guidelines
  - Returns detailed violation reports with remediation guidance
  - Optional filtering by WCAG level (A, AA, AAA)

- **`analyze_url_json`**: Run axe-core accessibility tests on any URL with JSON output
  - Same functionality as `analyze_url`
  - Returns only violations in raw JSON format
  - Perfect for machine processing or integration with other tools

- **`analyze_html`**: Test raw HTML content for accessibility issues
  - Perfect for testing components or HTML snippets
  - Same comprehensive reporting as URL analysis

- **`analyze_html_json`**: Test raw HTML content with JSON output
  - Same functionality as `analyze_html`
  - Returns only violations in raw JSON format
  - Perfect for machine processing or integration with other tools

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

### Analyzing a URL (Markdown Output)

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

### Analyzing a URL (JSON Output)

```typescript
// Returns raw JSON violations for machine processing
{
  "name": "analyze_url_json",
  "arguments": {
    "url": "https://example.com",
    "tags": ["wcag2aa", "wcag21aa"]  // Optional: filter by WCAG level
  }
}
```

### Analyzing HTML Content (Markdown Output)

```typescript
{
  "name": "analyze_html",
  "arguments": {
    "html": "<button>Click me</button>",  // Missing accessible label
    "tags": ["wcag2a"]
  }
}
```

### Analyzing HTML Content (JSON Output)

```typescript
{
  "name": "analyze_html_json",
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

## Installation & Configuration

### Environment Variables

The server supports configuration via environment variables with the following defaults:

- **`AXE_WCAG_VERSION`**: WCAG version to test against (default: `"wcag2aa"`)
  - Options: `"wcag2a"`, `"wcag2aa"`, `"wcag2aaa"`, `"wcag21a"`, `"wcag21aa"`, `"wcag22aa"`
- **`AXE_RUN_EXPERIMENTAL`**: Enable experimental axe-core rules (default: `false`)
  - Set to `"true"` to enable
- **`AXE_BEST_PRACTICES`**: Include best practice rules (default: `true`)
  - Set to `"false"` to disable

These settings apply to all tests unless overridden by the `tags` parameter in tool calls.

### VS Code (GitHub Copilot)

1. **Install the server** (if not already done):
   ```bash
   git clone https://github.com/joe-watkins/axecore-mcp-server.git
   cd axecore-mcp-server
   npm install
   npm run build
   ```

2. **Configure VS Code settings**:
   - Open VS Code Settings (JSON) by pressing `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Select "Preferences: Open User Settings (JSON)"
   - Add the MCP server configuration:

   ```jsonc
   "AxeCore - MCP": {
     "type": "stdio",
     "command": "node",
     "args": ["<path to install folder>/build/index.js"],
     "env": {
       "AXE_WCAG_VERSION": "wcag2aa",
       "AXE_RUN_EXPERIMENTAL": "false",
       "AXE_BEST_PRACTICES": "true"
     }
   }
   ```
   
   Replace `<ABSOLUTE_PATH_TO_PROJECT>` with the full path to where you cloned this repository.  
   For example: `/Users/username/projects/axecore-mcp-server/build/index.js`

3. **Restart VS Code** to load the MCP server

4. **Use in Copilot Chat**:
   - Open GitHub Copilot Chat
   - The axecore tools will be available automatically
   - Try: "@workspace test https://example.com for accessibility issues"

### Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "axecore": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH_TO_PROJECT>/build/index.js"],
      "env": {
        "AXE_WCAG_VERSION": "wcag2aa",
        "AXE_RUN_EXPERIMENTAL": "false",
        "AXE_BEST_PRACTICES": "true"
      }
    }
  }
}
```

Replace `<ABSOLUTE_PATH_TO_PROJECT>` with the full path to where you cloned this repository.

### Configuration Notes

- **Environment variables are optional** - the server uses sensible defaults if not specified
- **Tool call `tags` parameter overrides environment configuration** - if you pass specific tags in a tool call, they take precedence over the environment settings
- **WCAG version**: Most organizations target WCAG 2.1 Level AA (`"wcag21aa"`) or WCAG 2.2 AA (`"wcag22aa"`)
- **Experimental rules**: Include rules still being tested by the axe-core team (e.g., `css-orientation-lock`, `focus-order-semantics`)
- **Best practices**: Include additional recommendations beyond WCAG compliance

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
