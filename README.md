# Shape MCP Server

Model Context Protocol (MCP) server for Shape, built with [xmcp](https://xmcp.dev). This server provides AI assistants with comprehensive access to Shape's [gasback distribution](https://docs.shape.network/gasback), NFT analytics, and blockchain data. It's extensible & composable.

## 🚀 Features

- **Shape Creator Analytics** - Track gasback earnings and creator performance metrics
- **NFT Collection Analytics** - Floor prices, sales volume, and marketplace data
- **Shape Network Integration** - Native support for Shape mainnet and Sepolia testnet
- **Real-time Data** - Powered by Alchemy's robust blockchain APIs

## 🛠 Available Tools

### `getShapeCreatorAnalytics`

Get comprehensive gasback analytics for a specific creator address including total earnings, token count, and registered contracts.

### `getTopShapeCreators`

List the top creators on Shape by gasback earnings with comprehensive stats including token counts and contract details.

### `getCollectionAnalytics`

Get onchain NFT collection analytics including name, symbol, total supply, owner count, token standard, and sample NFTs. Simple input (contract address only) with reliable onchain data that works on any network.

### `getShapeNft`

Get NFTs owned by an address on Shape network.

## 📋 Prerequisites

- Node.js 20+
- An [Alchemy API key](https://dashboard.alchemy.com/)
- MCP-compatible client (Cursor IDE, Claude Desktop or AI agent interface)

## 🔧 Setup

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
# Required
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Network Configuration
CHAIN_ID=360  # Shape Mainnet
or
CHAIN_ID=11011  # Shape Sepolia Testnet
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

### Example IDE Setup

Add to your MCP settings:

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

### Analyze Creator Gasback Earnings

```
Get gasback analytics for creator address 0xabcd...
```

### Top Creators by Gasback

```
Show me the top creators on Shape by gasback earnings
```

### Get NFT Collection Analytics

```
Analyze NFT collection for contract address 0x5678...
```

## 🏗 Building for Production

```bash
yarn build
```

## 📁 Project Structure

```
src/
├── tools/                    # MCP tools directory
│   ├── get-shape-creator-analytics.ts
│   ├── get-top-shape-creators.ts
│   ├── get-collection-analytics.ts
│   └── get-shape-nft.ts
├── abi/                     # Contract ABIs
│   └── gasback.ts          # Shape gasback contract ABI
├── addresses.ts             # Contract addresses
├── clients.ts               # Blockchain clients
├── config.ts                # Configuration management
├── middleware.ts            # Request middleware
└── xmcp.config.ts          # XMCP configuration
```

## 🔧 Adding New Tools

1. Create a new `.ts` file in `src/tools/`
2. Export a Zod `schema` for parameters
3. Export `metadata` with tool information
4. Export default function with tool logic

```typescript
import { z } from 'zod';
import { type InferSchema } from 'xmcp';

export const schema = {
  address: z.string().describe('Wallet address'),
};

export const metadata = {
  name: 'myTool',
  description: 'My custom tool',
  annotations: {
    title: 'My Tool',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function myTool({ address }: InferSchema<typeof schema>) {
  // Tool implementation
  return {
    content: [{ type: 'text', text: 'Result' }],
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
