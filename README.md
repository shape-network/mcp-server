# Shape MCP Server

Model Context Protocol (MCP) server for Shape, built with [xmcp](https://xmcp.dev). This server provides AI assistants with comprehensive access to Shape's [gasback distribution](https://docs.shape.network/gasback), NFT analytics, and blockchain data.

## 🚀 Features

- **🏗️ Modular Tool Categories** - Organized by functionality for easy extension
- **💰 Gasback Analytics** - Creator performance, top earners, and reward simulations
- **🖼️ NFT Ecosystem Analysis** - Collection metrics and ownership tracking
- **📊 Educational Simulations** - Model potential rewards without transactions
- **⚡ Network Monitoring** - Real-time Shape network health and gas price tracking
- **🔗 Event Analysis** - Decode and understand protocol mechanics
- **🤖 AI Framework Ready** - Built for agent chaining and workflow automation

## 🛠 Available Tools

### 🏗️ Network Tools (`/tools/stack/`)

#### `getChainStatus`

Monitor Shape network health, gas prices, latest block info, and average block times. Perfect for AI agents needing network context.

#### `decodeGasbackEvents`

Analyze Gasback contract events with detailed decoding and educational descriptions. Helps understand protocol mechanics through event logs.

### 🖼️ NFT Tools (`/tools/nft/`)

#### `getCollectionAnalytics`

Get comprehensive NFT collection analytics including name, symbol, total supply, owner count, token standard, sample NFTs, and **marketplace floor prices from OpenSea**. Optimized with parallel API calls for better performance.

#### `getShapeNft`

Get NFTs owned by a specific address on Shape network with detailed metadata.

### 💰 Gasback Tools (`/tools/gasback/`)

#### `getShapeCreatorAnalytics`

Deep dive into creator Gasback performance with earnings, token count, balance, withdrawals, and registered contracts.

#### `getTopShapeCreators`

Discover the **top creators** by Gasback earnings with comprehensive stats. Uses efficient multicall batching for 100x performance improvement. Limit is fixed at 25 for optimal performance.

#### `simulateGasbackRewards`

Educational simulation tool for modeling potential Gasback rewards based on contract usage patterns. Includes daily breakdowns, assumptions, and disclaimers.

### 🏗️ Stack Tools (`/tools/stack/`)

#### `getStackAchievements`

Get Stack achievement analytics for users including medal counts by tier (bronze, silver, gold, special), total achievements, and last medal claimed. Tracks dynamic NFT achievements for Shape contributions.

## 📋 Prerequisites

- An [Alchemy API key](https://dashboard.alchemy.com/)
- MCP-compatible client (Cursor IDE, Claude Desktop, or AI agent framework)

## 🔧 Setup

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
# Required
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Network Configuration
CHAIN_ID=360  # Shape Mainnet
# OR
# CHAIN_ID=11011  # Shape Sepolia Testnet
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Development Server

```bash
yarn dev
```

This starts the MCP server on `http://localhost:3002/mcp`

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

```
Analyze creator 0xabcd... performance and compare with top creators
```

### Network Monitoring

```
What's the current Shape network status and gas prices?
```

### Educational Simulation

```
Simulate potential Gasback rewards for contract 0x1234... with 50 transactions per day over 3 months
```

### Event Investigation

```
Show me recent Gasback distribution events and explain what they mean
```

### Comprehensive Workflow

```
Analyze NFT collection 0x5678..., check if the owner has Gasback NFTs, and simulate potential rewards
```

## 🏗 Building for Production

```bash
yarn build
```

## 📁 Project Structure

```
src/
├── tools/                   # Modular tool categories
│   ├── stack/              # Network & protocol tools
│   │   ├── get-chain-status.ts
│   │   └── decode-gasback-events.ts
│   ├── nft/                # NFT analysis tools
│   │   ├── get-collection-analytics.ts
│   │   └── get-shape-nft.ts
│   └── gasback/            # Gasback & creator tools
│       ├── get-shape-creator-analytics.ts
│       ├── get-top-shape-creators.ts
│       └── simulate-gasback-rewards.ts
├── abi/                    # Contract ABIs
│   └── gasback.ts         # Shape gasback contract ABI
│   └── stack.ts           # Shape stack contract ABI
├── addresses.ts            # Contract addresses
├── clients.ts              # Blockchain clients (RPC + Alchemy)
├── config.ts               # Configuration management
├── middleware.ts           # Request middleware
├── types.ts                # TypeScript type definitions
└── xmcp.config.ts         # XMCP configuration
```

## 🔧 Adding New Tools

1. Create a new `.ts` file in the appropriate category folder (`/tools/stack/`, `/tools/nft/`, `/tools/gasback/`)
2. Export a Zod `schema` for parameters
3. Export `metadata` with comprehensive annotations for AI frameworks
4. Export default function with tool logic

```typescript
import { z } from 'zod';
import { type InferSchema } from 'xmcp';

export const schema = {
  address: z.string().describe('Wallet address to analyze'),
};

export const metadata = {
  name: 'myTool',
  description: 'My custom tool for AI agents',
  annotations: {
    title: 'My Tool',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'myToolCategory',
    chainableWith: ['otherTool1', 'otherTool2'],
  },
};

export default async function myTool({ address }: InferSchema<typeof schema>) {
  // Tool implementation with structured output
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
```

## 🌐 Resources

- [Shape Docs](https://docs.shape.network/)
- [Shape Gasback](https://docs.shape.network/gasback)
- [XMCP Framework](https://xmcp.dev/docs)
- [Alchemy API Documentation](https://docs.alchemy.com/)

## ❓ Questions or Support

- Ping or DM [@williamhzo](https://x.com/williamhzo) on Twitter/X
- [Shape Discord](https://discord.com/invite/shape-l2)

---

## 📄 License

MIT License - see LICENSE file for details.
