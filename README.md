# Shape MCP Server

A powerful Model Context Protocol (MCP) server for Shape Network, built with [xmcp](https://xmcp.dev). This server provides AI assistants with comprehensive access to Shape's creator economy, NFT analytics, and blockchain data.

## 🚀 Features

- **Shape Creator Analytics** - Track gasback earnings and creator performance metrics
- **NFT Collection Analytics** - Floor prices, sales volume, and marketplace data
- **Shape Network Integration** - Native support for Shape mainnet and Sepolia testnet
- **Real-time Data** - Powered by Alchemy's robust blockchain APIs

## 🛠 Available Tools

### 1. **Shape Creator Analytics** (`getShapeCreatorAnalytics`)

Analyze Shape's unique creator economy including gasback earnings and contract performance.

**Parameters:**

- `contractAddress` - Contract address to analyze
- `creatorAddress` - Creator/owner address (optional)
- `fromBlock`/`toBlock` - Analysis time range
- `includeTxDetails` - Include detailed transaction data

**Returns:**

- Estimated gasback earnings (80% of gas fees)
- Transaction volume and unique user metrics
- Contract interaction analytics
- Revenue optimization insights

### 2. **NFT Collection Analytics** (`getCollectionAnalytics`)

Comprehensive NFT collection data including floor prices and sales analytics.

**Parameters:**

- `contractAddress` - NFT collection contract address
- `includeFloorPrice` - Include marketplace floor prices
- `includeSalesHistory` - Include recent sales data
- `salesHistoryLimit` - Number of sales to fetch (max 100)
- `marketplace` - Filter by specific marketplace

**Returns:**

- Multi-marketplace floor prices (OpenSea, LooksRare, etc.)
- Sales volume and average price metrics
- Recent transaction history
- Collection metadata and stats

### 3. **Shape NFT Lookup** (`getShapeNft`)

Get NFTs owned by an address on Shape network.

**Parameters:**

- `address` - Wallet address to query
- `pageSize` - Number of NFTs to return (max 100)
- `withMetadata` - Include NFT metadata

## 📋 Prerequisites

- Node.js 20+
- An [Alchemy API key](https://dashboard.alchemy.com/)
- MCP-compatible client (Cursor IDE or Claude Desktop)

## 🔧 Setup

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
# Required
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Optional - Network Configuration
CHAIN_ID=360  # Shape mainnet (default) or 360-1 for Sepolia testnet
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Development Server

```bash
npm run dev
```

This starts the MCP server on `http://localhost:3002/mcp`

## 🔌 Client Integration

### Cursor IDE Setup

Add to your MCP settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "shape-mcp": {
      "url": "http://localhost:3002/mcp"
    }
  }
}
```

### Claude Desktop Setup

Add to your config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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
Analyze gasback earnings for contract 0x1234... owned by creator 0xabcd...
```

### Get NFT Collection Floor Prices

```
Get floor price and sales analytics for NFT collection 0x5678...
```

### Track Creator Performance

```
Show me the top performing creators on Shape by gasback earnings this week
```

## 🏗 Building for Production

```bash
npm run build
```

### Deployment Options

**HTTP Server:**

```bash
npm run start
# or
node dist/http.js
```

**STDIO (Local):**

```bash
node dist/stdio.js
```

**Vercel Deployment:**

```bash
npm run build
vercel deploy --prod --prebuilt
```

## 📁 Project Structure

```
src/
├── tools/                    # MCP tools directory
│   ├── get-shape-creator-analytics.ts
│   ├── get-collection-analytics.ts
│   ├── get-shape-nft.ts
│   └── greet.ts             # Example tool
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

- [Shape Network Documentation](https://docs.shape.network/)
- [Alchemy API Documentation](https://docs.alchemy.com/)
- [XMCP Framework](https://xmcp.dev/docs)
- [Shape Gasback System](https://gasback.shape.network/)

## 📄 License

MIT License - see LICENSE file for details.

---

**Built for the Shape creator economy** 🫡
