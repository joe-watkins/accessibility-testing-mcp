# Accessibility Testing MCP

An MCP server for accessibility testing using **axe-core**, **IBM Equal Access**, and **Playwright**. Choose your testing engine and enable automated keyboard accessibility testing for comprehensive coverage.

## Features

### Dual Engine Support

- **Axe-core** (Deque) - Industry standard, zero false positives
- **IBM Equal Access** - Comprehensive IBM accessibility requirements

### Automated Keyboard Testing (v3.0+)

- **Keyboard trap detection** - Identifies elements that trap keyboard focus
- **Focus order verification** - Tracks tab order through the page
- **Interactive element checks** - Finds clickable elements that aren't keyboard accessible

### Tools

| Tool | Description |
|------|-------------|
| `analyze_url` | Test any URL for accessibility issues |
| `analyze_url_json` | URL test with raw JSON output |
| `analyze_html` | Test HTML content directly |
| `analyze_html_json` | HTML test with raw JSON output |
| `get_rules` | List available accessibility rules |

All tools accept an optional `engine` parameter (`"axe"` or `"ace"`).

### Resources

- **WCAG Guidelines Reference** - Levels, principles, and tags
- **Common Accessibility Issues** - Frequent violations and fixes
- **Engine Comparison** - When to use each engine

## Installation

```bash
npm install
npm run build
```

> **Note**: Playwright will automatically download Chromium (~300MB) on first install via the `postinstall` script.

## Configuration

### Environment Variables

Configure via MCP config `env` section:

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `A11Y_ENGINE` | `axe`, `ace` | `axe` | Testing engine |
| `WCAG_LEVEL` | `2.0_A`, `2.0_AA`, `2.1_A`, `2.1_AA`, `2.2_AA`, etc. | `2.1_AA` | WCAG version & level |
| `BEST_PRACTICES` | `true`, `false` | `true` | Include best practices/recommendations |
| `RUN_EXPERIMENTAL` | `true`, `false` | `false` | Experimental rules (axe only) |
| `RUN_PLAYWRIGHT_TESTS` | `true`, `false` | `false` | Run automated keyboard accessibility tests |
| `PLAYWRIGHT_HEADLESS` | `true`, `false` | `true` | Run browser in headless mode |

### VS Code (GitHub Copilot)

Add to VS Code settings (JSON):

```jsonc
"mcp": {
  "servers": {
    "accessibility-testing-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/accessibility-testing-mcp/build/index.js"],
      "env": {
        "A11Y_ENGINE": "axe",           // "axe" or "ace" (default: "axe")
        "WCAG_LEVEL": "2.2_AA",         // WCAG version & level (default: "2.1_AA")
        "BEST_PRACTICES": "true",       // Include best practices (default: "true")
        "RUN_EXPERIMENTAL": "false",    // Experimental rules, axe only (default: "false")
        "RUN_PLAYWRIGHT_TESTS": "true", // Enable keyboard testing (default: "false")
        "PLAYWRIGHT_HEADLESS": "true"   // Run headless (default: "true")
      }
    }
  }
}
```

Example with IBM Equal Access:

```jsonc
"mcp": {
  "servers": {
    "accessibility-testing-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/accessibility-testing-mcp/build/index.js"],
      "env": {
        "A11Y_ENGINE": "ace",           // "axe" or "ace" (default: "axe")
        "WCAG_LEVEL": "2.2_AA",         // WCAG version & level (default: "2.1_AA")
        "BEST_PRACTICES": "true",       // Include best practices (default: "true")
        "RUN_PLAYWRIGHT_TESTS": "true"  // Enable keyboard testing (default: "false")
      }
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "accessibility-testing-mcp": {
      "command": "node",
      "args": ["/path/to/accessibility-testing-mcp/build/index.js"],
      "env": {
        "A11Y_ENGINE": "ace",
        "WCAG_LEVEL": "2.2_AA",
        "RUN_PLAYWRIGHT_TESTS": "true"
      }
    }
  }
}
```

## Keyboard Accessibility Testing

When `RUN_PLAYWRIGHT_TESTS` is enabled, the `analyze_url` and `analyze_url_json` tools will automatically perform keyboard accessibility tests in addition to standard accessibility scans.

### What It Tests

1. **Keyboard Traps (WCAG 2.1.2 - Level A)**
   - Detects elements where focus becomes trapped
   - Identifies when users cannot Tab away from an element

2. **Unfocusable Interactive Elements (WCAG 2.1.1 - Level A)**
   - Finds elements with `onclick`, `role="button"`, `role="link"`, etc.
   - Identifies interactive elements missing `tabindex` or proper semantic markup

3. **Focus Order**
   - Tracks the sequence of focusable elements
   - Helps verify logical tab order

### Output Format

Keyboard test results are appended to standard accessibility results:
- **Markdown format** (`analyze_url`): Human-readable report with WCAG references
- **JSON format** (`analyze_url_json`): Violations in axe-core compatible format

### Debugging with Visible Browser

Set `PLAYWRIGHT_HEADLESS=false` to watch the keyboard tests run in a visible browser window. This is useful for debugging or manual verification.

## Choosing an Engine

| Use Case | Recommended Engine |
|----------|-------------------|
| CI/CD pipelines | Axe-core |
| Zero false positives needed | Axe-core |
| Comprehensive audits | IBM Equal Access |
| Enterprise compliance | IBM Equal Access |
| Quick spot checks | Either |

## Understanding Results

### Axe-core Output
- **Violations**: Definite accessibility failures
- **Incomplete**: Needs manual review
- **Passes**: Rules that passed
- **Inapplicable**: Rules that don't apply

### IBM Equal Access Output
- **Violations**: Accessibility failures
- **Potential Violations**: Needs review
- **Recommendations**: Suggested improvements
- **Manual Checks**: Requires human testing

## WCAG_LEVEL Values

| Level | Description |
|-------|-------------|
| `2.0_A` | WCAG 2.0 Level A |
| `2.0_AA` | WCAG 2.0 Level AA |
| `2.1_A` | WCAG 2.1 Level A |
| `2.1_AA` | WCAG 2.1 Level AA (default) |
| `2.1_AAA` | WCAG 2.1 Level AAA |
| `2.2_A` | WCAG 2.2 Level A |
| `2.2_AA` | WCAG 2.2 Level AA |
| `2.2_AAA` | WCAG 2.2 Level AAA |

## Dependencies

- **@modelcontextprotocol/sdk** - MCP server framework
- **axe-core** - Deque accessibility testing engine
- **accessibility-checker** - IBM Equal Access engine
- **playwright** - Browser automation for keyboard testing

## Upgrading from v2.x to v3.0

Version 3.0 introduces several changes:

### Breaking Changes

1. **Puppeteer → Playwright**: The browser automation library has been replaced with Playwright for better performance and cross-browser capabilities.

2. **New Dependencies**: Run `npm install` after updating to download Playwright and its Chromium browser (~300MB).

### New Features

1. **Keyboard Accessibility Testing**: Enable with `RUN_PLAYWRIGHT_TESTS=true` to automatically test for keyboard traps and unfocusable interactive elements.

2. **Headless Mode Control**: Use `PLAYWRIGHT_HEADLESS=false` to watch tests run in a visible browser window.

### Migration Steps

```bash
# Pull latest changes
git pull

# Install new dependencies (downloads Chromium)
npm install

# Rebuild
npm run build
```

No configuration changes are required unless you want to enable the new keyboard testing features.

## License

MIT
