# Axecore MCP Server

A basic Model Context Protocol (MCP) server scaffold.

## Features

- **Tools**: Example echo tool that demonstrates tool execution
- **Resources**: Example resource for serving static content
- **Prompts**: Example prompt template with arguments

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

## Running the Server

```bash
npm start
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

## Project Structure

```
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## Extending the Server

### Adding a New Tool

Edit `src/index.ts` and add your tool to the `ListToolsRequestSchema` handler:

```typescript
{
  name: "your_tool_name",
  description: "What your tool does",
  inputSchema: {
    type: "object",
    properties: {
      // Define your parameters
    },
    required: ["param1"]
  }
}
```

Then handle it in the `CallToolRequestSchema` handler.

### Adding a New Resource

Add resources in the `ListResourcesRequestSchema` handler and implement reading in `ReadResourceRequestSchema`.

### Adding a New Prompt

Add prompts in the `ListPromptsRequestSchema` handler and implement them in `GetPromptRequestSchema`.

## License

MIT
