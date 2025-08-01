# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `yarn dev` - Start development server (runs at http://localhost:3002/mcp)
- `yarn build` - Build the project using xmcp
- `yarn start` - Start production server from dist/

### Code Quality

- `yarn lint` - Run ESLint on src/ directory
- `yarn lint:fix` - Auto-fix ESLint issues
- `yarn lint:check` - Run lint with max warnings = 0 (strict mode)
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check if code is properly formatted

## Architecture Overview

This is MCP server based on xmcp (https://xmcp.dev/docs) that provides AI assistants with access to Shape blockchain data. The architecture follows a modular tool-based design:

### Core Components

**Configuration & Clients (`src/`)**

- `config.ts` - Environment-based configuration (chain ID, API keys, RPC URLs)
- `clients.ts` - Viem RPC clients for Shape mainnet/testnet and Ethereum mainnet, plus Alchemy SDK and Redis
- `addresses.ts` - Contract addresses for gasback and stack contracts on both networks
- `types.ts` - TypeScript types for all tool outputs and error responses

**Tool Architecture (`src/tools/`)**
The server uses a category-based tool organization:

- `gasback/` - Creator earnings analysis and reward simulation
- `network/` - Chain status monitoring
- `nft/` - Collection analytics and ownership data
- `stack/` - Achievement tracking system

**Infrastructure**

- `utils/cache.ts` - Redis caching layer with fallback for when Redis is unavailable
- `abi/` - Contract ABIs for gasback and stack contracts
- `middleware.ts` - Express middleware (currently minimal)

### Tool Pattern

Each tool follows this structure:

```typescript
export const schema = {
  /* Zod validation schema */
};
export const metadata = {
  name: string,
  description: string,
  annotations: {
    /* Tool metadata including cache TTL, categories, etc */
  },
};
export default async function toolName(params) {
  /* Implementation */
}
```

Key patterns:

- All tools return standardized JSON responses in `{ content: [{ type: 'text', text: JSON.stringify(data) }] }` format
- Error handling returns `ToolErrorOutput` type with consistent structure
- Caching is implemented at the tool level with configurable TTLs
- Tools use Viem for blockchain interactions and multicall optimization where possible

### Environment Configuration

Required environment variables:

- `CHAIN_ID` - 360 for mainnet, 11011 for testnet
- `ALCHEMY_API_KEY` - For NFT data and RPC access
- `REDIS_URL` - Optional for caching (gracefully degrades without it)
- Server runs on port 3002 by default

The system defaults to public Shape RPC endpoints if no Alchemy key is provided.

### Development Patterns

- Uses TypeScript with strict mode enabled
- ESLint + Prettier for code quality
- XMCP framework handles server setup and tool registration automatically
- Tools are auto-discovered from the tools directory structure
- Redis caching is optional and fails gracefully
- Contract interactions use Viem with batch/multicall optimization
- ENS resolution is done against Ethereum mainnet regardless of Shape network
- Only add meaningful comments when necessary, when clarification is needed - do not state the obvious

### Useful Docs

When interacting with the following libraries, always make sure you use them according to their official docs:

- viem: https://viem.sh/docs/getting-started
- xmcp: https://xmcp.dev/docs
- Open Zeppelin: https://docs.openzeppelin.com/

### Links

- shape sepolia explorer: https://sepolia.shapescan.xyz/
- shape mainnet explorer: https://shapescan.xyz/
