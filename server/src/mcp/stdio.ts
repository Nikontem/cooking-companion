import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { server } from './server.js';

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Cooking Companion MCP server running on stdio');
}

main().catch(err => {
  console.error('MCP server failed to start:', err);
  process.exit(1);
});
