# Accessibility Testing MCP

An MCP server for accessibility testing using **axe-core** and **IBM Equal Access**. Choose your testing engine or use both for comprehensive coverage.

## Features

### 🔧 Dual Engine Support

- **Axe-core** (Deque) - Industry standard, zero false positives
- **IBM Equal Access** - Comprehensive IBM accessibility requirements

### 📐 Multi-Screen Testing

Test at multiple viewport sizes to catch responsive accessibility issues.

### 🛠️ Tools

| Tool | Description |
|------|-------------|
| `analyze_url` | Test any URL for accessibility issues |
| `analyze_url_json` | URL test with raw JSON output |
| `analyze_html` | Test HTML content directly |
| `analyze_html_json` | HTML test with raw JSON output |
| `get_rules` | List available accessibility rules |

All tools accept an optional `engine` parameter (`"axe"` or `"ace"`).

### 📚 Resources

- **WCAG Guidelines Reference** - Levels, principles, and tags
- **Common Accessibility Issues** - Frequent violations and fixes
- **Engine Comparison** - When to use each engine

## Installation

```bash
npm install
npm run build
```

## Configuration

### Environment Variables

Configure via MCP config `env` section:

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `A11Y_ENGINE` | `axe`, `ace` | `axe` | Testing engine |
| `WCAG_LEVEL` | `2.0_A`, `2.0_AA`, `2.1_A`, `2.1_AA`, `2.2_AA`, etc. | `2.1_AA` | WCAG version & level |
| `BEST_PRACTICES` | `true`, `false` | `true` | Include best practices/recommendations |
| `SCREEN_SIZES` | Comma-separated `WIDTHxHEIGHT` | `1280x1024` | Viewport sizes to test |

The `WCAG_LEVEL` setting automatically configures both Axe-core tags and IBM Equal Access policies.

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
        "A11Y_ENGINE": "axe",
        "WCAG_LEVEL": "2.2_AA",
        "BEST_PRACTICES": "true",
        "SCREEN_SIZES": "1280x1024,320x640"
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
    "accessibility": {
      "command": "node",
      "args": ["/path/to/accessibility-testing-mcp/build/index.js"],
      "env": {
        "A11Y_ENGINE": "ace",
        "WCAG_LEVEL": "2.2_AA",
        "BEST_PRACTICES": "true"
      }
    }
  }
}
```

## Understanding Results

### Axe-core Output
- **Violations**: Definite accessibility failures
- **Incomplete**: Needs manual review
- **Passes**: Rules that passed
- **Inapplicable**: Rules that don't apply

### IBM Equal Access Output
- **Violations**: Accessibility failures
- **Potential Violations**: Needs review
- **Recommendations**: Suggested improvements (when BEST_PRACTICES=true)
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
- **playwright** - Headless browser automation

## License

MIT
