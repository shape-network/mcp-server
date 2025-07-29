# Shape MCP Server

Model Context Protocol (MCP) server for Shape, built with [xmcp](https://xmcp.dev). This server provides AI assistants with comprehensive access to Shape's onchain data: [gasback](https://docs.shape.network/gasback) distribution, collections analytics, stack users & more.

Contributions are welcome! Fork and add your own tool, feel free to submit a PR.

## 🚀 Features

Organized by functionality for easy extension:

- **💰 Gasback Analytics** - Track creator earnings, top performers, and simulate rewards
- **🖼️ NFT Ecosystem Analysis** - Dive into collections and ownership patterns
- **🏗️ Stack Achievements** - Monitor user progress in Shape's ecosystem
- **⚡ Network Monitoring** - Keep tabs on chain health and metrics
- **🤖 AI Framework Ready** - Tools optimized for agent chaining and automation
- **⚡ Caching** - Optional Redis for snappier responses & less load on RPCs, no lock-in required

## 🛠 Available Tools

### 🏗️ Network Tools (`/tools/network/`)

#### `getChainStatus`

Monitor Shape's network: RPC health, gas prices, block times. Use case: Agents checking if the chain's ready for mints. Example prompt: "is shape up? what's the gas like?"

### 🖼️ NFT Tools (`/tools/nft/`)

#### `getCollectionAnalytics`

Collection stats: supply, owners, samples, even OpenSea floors. Use case: Spot hot drops. Example prompt: "what's the vibe on collection 0x567...abc? floor price and top holders?"

#### `getShapeNft`

List NFTs for an address with metadata. Example prompt: "what NFTs does 0xabcd...123 hold on shape?"

### 💰 Gasback Tools (`/tools/gasback/`)

#### `getShapeCreatorAnalytics`

Creator deep dive: earnings, tokens, withdrawals. Use case: Performance reviews. Example prompt: "how's creator 0xdef...766 doing on gasback?"

#### `getTopShapeCreators`

Top earners with stats (multicall-optimized for speed). Use case: Leaderboards. Example prompt: "who are shape's top 10 gasback earners?"

#### `simulateGasbackRewards`

Model rewards based on tx patterns. Use case: "What if" planning. Example prompt: "simulate 50 txs/day at 50k gas—earnings over 3 months?"

### 🏗️ Stack Tools (`/tools/stack/`)

#### `getStackAchievements`

User medals by tier, total count. Use case: Progress tracking. Example prompt: "what's 0xghi...123's stack status? gold medals?"

## 🧪 Quick Test (No Setup Required)

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

**Note:** This deployed version may have rate limits and is intended for testing/sandbox use only. For production AI applications, we recommend self-hosting your own instance following the setup instructions above.

## 📋 Prerequisites

- Alchemy API key for NFT queries (get one [here](https://dashboard.alchemy.com/))
- MCP client like Cursor IDE, Claude Desktop or your AI client of choice
- Optional: Redis for caching (speeds up RPC-heavy tools)

## 🔧 Setup

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

### 4. Deploy

- **Vercel**: `vercel deploy`. Enable KV in dashboard for caching (or your own Redis instance with a provider like Upstash).
- **Alternatives**: Docker build (`docker build -t shape-mcp .; docker run -p 3002:3002 shape-mcp`), or any Node host. Skip Vercel KV by setting `REDIS_URL` to your own instance.

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

## 💡 Usage Examples

### Basic Analysis

"analyze creator 0xabcd...123's Gasback and compare to top earners. any tips?"

### Network Check

"current shape status? gas prices looking mint-friendly?"

### Gasback Earning Simulation

"simulate gasback earnings for a contract with 100 txs/day for 6 months straight. wen lambo?"

### Full Chain

"grab NFTs from 0x567...abc, check owner's stack, simulate their gasback potential."

## 📁 Project Structure

```
src/
├── tools/                  # Modular tools
│   ├── gasback/            # Earnings and creator focus
│   ├── network/            # Chain health tools
│   ├── nft/                # Collection/ownership analysis
│   └── stack/              # Achievement tracking
├── abi/                    # Contract interfaces
├── utils/                  # Helpers like cache.ts
├── addresses.ts            # Key contracts addys
├── clients.ts              # RPC/Alchemy/Redis
├── config.ts               # Env-based setup
├── middleware.ts           # Auth/logging if needed
├── types.ts                # Shared outputs
└── xmcp.config.ts          # xmcp server config
```

Why this way? Categories keep things modular. Add a tool to /tools/gasback/ and xmcp auto-picks it up. No monolith mess.

## 🔧 Adding New Tools

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

## ⚡ Caching (Optional)

Redis cuts RPC load for repeat calls. Set `REDIS_URL` to your instance (Vercel KV or Upstash). Skip it? Tools run direct, no sweat. See `cache.ts` for the simple get/set logic.

## Deploy Your Own

Fork this repo and deploy your personal MCP:

1. [Fork on GitHub](https://github.com/shape-network/mcp-server/fork)
2. Import to Vercel: [New Project](https://vercel.com/new)
3. Set env vars: `SHAPE_RPC_URL` (your node), `ALCHEMY_API_KEY`, `CHAIN_ID` (`360` for mainnet, or `11011` for testnet), optional `REDIS_URL`
4. Deploy—access at your-vercel-url/mcp!

## RPC Setup

Use your own Alchemy API key to avoid public RPC limits. Default falls back to Shape’s public node `https://mainnet.shape.network` and `https://sepolia.shape.network`.

## Optional Rate Limiting

Add `middleware.ts` with express-rate-limit to cap usage (e.g., 100 reqs/min). Install: `npm i express-rate-limit`. Enable in `server.ts` if needed.

## 🌐 Resources

- [Shape Docs](https://docs.shape.network/)
- [xmcp Framework](https://xmcp.dev/docs)
- [Alchemy Docs](https://docs.alchemy.com/)

## ❓ Support

Contact [@williamhzo](https://x.com/williamhzo) or hop into [Shape Discord](https://discord.com/invite/shape-l2).

MIT License—see [LICENSE](./LICENSE).

![GitHub stars](https://img.shields.io/github/stars/shape-network/mcp-server) ![GitHub forks](https://img.shields.io/github/forks/shape-network/mcp-server)
