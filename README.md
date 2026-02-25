# mcp-planetscale

List databases, manage branches, and view deploy requests in PlanetScale.

## Tools

| Tool | Description |
|------|-------------|
| `list_databases` | List databases in the organization. |
| `get_database` | Get database details. |
| `list_branches` | List database branches. |
| `create_branch` | Create a new database branch. |
| `list_deploy_requests` | List deploy requests (schema migration PRs). |
| `get_schema` | Get branch schema. |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `PLANETSCALE_SERVICE_TOKEN_ID` | Yes | PlanetScale service token ID |
| `PLANETSCALE_SERVICE_TOKEN` | Yes | PlanetScale service token |
| `PLANETSCALE_ORG` | Yes | PlanetScale organization name |

## Installation

```bash
git clone https://github.com/PetrefiedThunder/mcp-planetscale.git
cd mcp-planetscale
npm install
npm run build
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "planetscale": {
      "command": "node",
      "args": ["/path/to/mcp-planetscale/dist/index.js"],
      "env": {
        "PLANETSCALE_SERVICE_TOKEN_ID": "your-planetscale-service-token-id",
        "PLANETSCALE_SERVICE_TOKEN": "your-planetscale-service-token",
        "PLANETSCALE_ORG": "your-planetscale-org"
      }
    }
  }
}
```

## Usage with npx

```bash
npx mcp-planetscale
```

## License

MIT
