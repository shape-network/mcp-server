# Shape MCP Server

Model Context Protocol (MCP) server for Shape, built with [xmcp](https://xmcp.dev). This server provides AI assistants access to Shape's onchain data: [gasback](https://docs.shape.network/gasback) distribution, collections analytics, stack users & more.

Contributions are welcome! Fork and add your own tools, feel free to submit a PR.

Check our docs about how to build AI on Shape: https://docs.shape.network/building-on-shape/ai

## Features

Organized by functionality for easy extension:

- **Gasback Analytics** - Track creator earnings, top performers, and simulate gasback earned
- **NFT Analysis** - Collections and ownership
- **Stack Achievements** - Monitor user progress in Shape's [Stack](https://stack.shape.network) ecosystem
- **Network Monitoring** - Chain health, metrics, RPC URLs, etc
- **AI Ready** - Tools are optimized for agent chaining and automation
- **Caching** - Optional Redis for snappier responses & less load on RPCs, no lock-in required

## Available Tools

### Network Tools (`/tools/network/`)

#### `getChainStatus`

Monitor Shape's network: RPC health, gas prices, block times, etc.

Example prompt: "current shape status? gas prices looking mint-friendly?"

### NFT Tools (`/tools/nft/`)

#### `getCollectionAnalytics`

Collection stats: supply, owners, sample NFTs, floors, etc.

Example prompt: "what's the vibe on collection 0x567...abc? floor price and top holders?"

#### `getShapeNft`

List NFTs for an address, with metadata.

Example prompt: "what NFTs does 0xabcd...123 hold on shape?"

### Gasback Tools (`/tools/gasback/`)

#### `getShapeCreatorAnalytics`

Shape builder/creator deep dive: earnings, tokens, withdrawals, etc.

Example prompt: "analyze creator 0xabcd...123's gasback and compare to top earners. any tips?"

#### `getTopShapeCreators`

Top creators by gasback earned & tx.

Example prompt: "who are shape's top 10 gasback earners?"

#### `simulateGasbackRewards`

Get gasback rough estimates.

Example prompt: "simulate 50 txs/day at 50k gas—earnings over 3 months? wen lambo?"

### 🏗️ Stack Tools (`/tools/stack/`)

#### `getStackAchievements`

User medals by tier, total count, etc.

Example prompt: "what's 0xghi...123's stack status? gold medals?"

## Quick Test (No Setup Required)

Want to try the MCP server without local setup? Point directly to our deployed instance:

```json
{
  "mcpServers": {
    "shape-mcp": {
      "url": "https://shape-mcp-server.vercel.app/mcp"
    }
  }
}
```

**Note:** This deployed version is rate limited and is intended for testing/sandbox use only. For production AI applications, we recommend self-hosting your own instance following the setup instructions above.

## Prerequisites

- Alchemy API key for NFT queries (get one [here](https://dashboard.alchemy.com/))
- MCP client like Cursor IDE, Claude Desktop or your AI client of choice
- Optional: Redis for caching (speeds up RPC-heavy tools)

## Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and fill in:

```bash
ALCHEMY_API_KEY=your_key_here
CHAIN_ID=360  # Mainnet; use 11011 for Sepolia
# Optional caching
REDIS_URL=redis://localhost:6379  # Local, or Upstash for prod
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Run Locally

```bash
yarn dev
```

Server is now running at http://localhost:3002/mcp

## 🔌 Client Integration

### MCP Settings

Add to your MCP settings in Cursor for eg:

```json
{
  "mcpServers": {
    "shape-mcp": {
      "url": "http://localhost:3002/mcp"
    }
  }
}
```

## Project Structure

```
src/
├── tools/                  # Modular tools
│   ├── gasback/
│   ├── network/
│   ├── nft/
│   └── stack/
├── abi/                    # Contract interfaces
├── utils/                  # Helpers like cache.ts
├── addresses.ts            # Key contracts addys
├── clients.ts              # RPC/Alchemy/Redis
├── config.ts               # Env-based setup
├── middleware.ts           # Auth/logging if needed
├── types.ts                # Shared outputs
└── xmcp.config.ts          # xmcp server config
```

Categories keep things modular. Add a tool to /tools/gasback/ and xmcp auto-picks it up. No monolith mess.

## Adding New Tools

1. Pick a category folder (e.g., /tools/gasback/)
2. New .ts file with schema, metadata, function
3. Example:

```ts
import { z } from 'zod';
import { type InferSchema } from 'xmcp';

export const schema = {
  address: z.string().describe('Wallet to analyze'),
};

export const metadata = {
  name: 'myTool',
  description: 'Custom tool for fun insights',
  annotations: {
    title: 'My Tool',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'gasback',
    chainableWith: ['getShapeCreatorAnalytics'],
  },
};

export default async function myTool({ address }: InferSchema<typeof schema>) {
  // Logic here
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}
```

## Caching (Optional)

Redis cuts RPC load for repeat calls. Set `REDIS_URL` to your instance (Vercel KV or Upstash). Skip it? Tools run direct, no sweat. See `cache.ts` for the simple get/set logic.

## Deploy Your Own

Fork this repo and deploy your personal MCP:

1. [Fork on GitHub](https://github.com/shape-network/mcp-server/fork)
2. Import to Vercel: [New Project](https://vercel.com/new)
3. Set env vars: `SHAPE_RPC_URL` (your node), `ALCHEMY_API_KEY`, `CHAIN_ID` (`360` for mainnet, or `11011` for testnet), optional `REDIS_URL`
4. Deploy—access at your-vercel-url/mcp!

## RPC Setup

Use your own Alchemy API key to avoid public RPC limits. Default falls back to Shape’s public node `https://mainnet.shape.network` and `https://sepolia.shape.network`.

## Resources

- [Shape Docs](https://docs.shape.network/)
- [xmcp Framework](https://xmcp.dev/docs)
- [Alchemy Docs](https://docs.alchemy.com/)

## Support

Contact [@williamhzo](https://x.com/williamhzo) or hop into [Shape Discord](https://discord.com/invite/shape-l2).

---

MIT LICENSE - [See LICENSE](./LICENSE)
