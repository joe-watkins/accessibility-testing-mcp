# Accessibility Testing MCP

An MCP server for accessibility testing using **axe-core** and **IBM Equal Access**. Choose your testing engine or use both for comprehensive coverage.

## Features

### 🔧 Dual Engine Support

- **Axe-core** (Deque) - Industry standard, zero false positives
- **IBM Equal Access** - Comprehensive IBM accessibility requirements

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

#### Engine Selection
| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `A11Y_ENGINE` | `axe`, `ace` | `axe` | Default testing engine |

#### Axe-core Settings
| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `AXE_WCAG_VERSION` | `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` | `wcag2aa` | WCAG version |
| `AXE_BEST_PRACTICES` | `true`, `false` | `true` | Include best practices |
| `AXE_RUN_EXPERIMENTAL` | `true`, `false` | `false` | Experimental rules |

#### IBM Equal Access Settings
| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `ACE_POLICIES` | Comma-separated | `IBM_Accessibility` | Policies to check |
| `ACE_REPORT_LEVELS` | Comma-separated | `violation,potentialviolation,recommendation` | Report levels |

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
        "AXE_WCAG_VERSION": "wcag21aa"
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
        "ACE_POLICIES": "IBM_Accessibility,WCAG_2_1"
      }
    }
  }
}
```

## Usage Examples

### Test a URL with default engine
```json
{
  "name": "analyze_url",
  "arguments": { "url": "https://example.com" }
}
```

### Test with specific engine
```json
{
  "name": "analyze_url",
  "arguments": {
    "url": "https://example.com",
    "engine": "ace"
  }
}
```

### Test HTML content
```json
{
  "name": "analyze_html",
  "arguments": {
    "html": "<img src='photo.jpg'>",
    "engine": "axe"
  }
}
```

### Filter by WCAG level (Axe)
```json
{
  "name": "analyze_url",
  "arguments": {
    "url": "https://example.com",
    "engine": "axe",
    "tags": ["wcag21aa", "best-practice"]
  }
}
```

### Filter by policy (ACE)
```json
{
  "name": "analyze_url",
  "arguments": {
    "url": "https://example.com",
    "engine": "ace",
    "tags": ["IBM_Accessibility", "WCAG_2_2"]
  }
}
```

## Choosing an Engine

| Use Case | Recommended Engine |
|----------|-------------------|
| CI/CD pipelines | Axe-core |
| Zero false positives needed | Axe-core |
| Comprehensive audits | IBM Equal Access |
| IBM product development | IBM Equal Access |
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

## WCAG Tags Reference

| Tag | Description |
|-----|-------------|
| `wcag2a` | WCAG 2.0 Level A |
| `wcag2aa` | WCAG 2.0 Level AA |
| `wcag21aa` | WCAG 2.1 Level AA |
| `wcag22aa` | WCAG 2.2 Level AA |
| `best-practice` | Beyond WCAG requirements |
| `section508` | Section 508 compliance |

## IBM Equal Access Policies

| Policy | Description |
|--------|-------------|
| `IBM_Accessibility` | IBM requirements (includes WCAG 2.1 AA) |
| `WCAG_2_0` | WCAG 2.0 guidelines |
| `WCAG_2_1` | WCAG 2.1 guidelines |
| `WCAG_2_2` | WCAG 2.2 guidelines |

## Dependencies

- **@modelcontextprotocol/sdk** - MCP server framework
- **axe-core** - Deque accessibility testing engine
- **accessibility-checker** - IBM Equal Access engine
- **puppeteer** - Headless browser automation

## License

MIT
