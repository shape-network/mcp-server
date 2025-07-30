import { formatEther, formatGwei } from 'viem';
import { rpcClient } from '../../clients';
import { config } from '../../config';
import type { ChainStatusOutput, ToolErrorOutput } from '../../types';
import { getCached, setCached } from '../../utils/cache';

export const schema = {};

export const metadata = {
  name: 'getChainStatus',
  description:
    'Get Shape network status: RPC health & URLs, gas prices, latest block info, network metrics, etc.',
  annotations: {
    title: 'Shape Chain Status',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'monitoring',
    educationalHint: true,
    cacheTTL: 60 * 1, // 1 minute
  },
};

export default async function getChainStatus() {
  const cacheKey = `mcp:chainStatus:${config.chainId}`;
  const cached = await getCached(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const client = rpcClient();

    const result: ChainStatusOutput = {
      timestamp: new Date().toISOString(),
      network: config.isMainnet ? 'shape-mainnet' : 'shape-sepolia',
      chainId: config.chainId,
      rpcHealthy: false,
      gasPrice: null,
      avgBlockTime: null,
      mainnetRpcUrl: 'https://mainnet.shape.network',
      testnetRpcUrl: 'https://sepolia.shape.network',
      docs: 'https://docs.shape.network/',
    };

    try {
      const [latestBlock, gasPrice] = await Promise.all([
        client.getBlock({ blockTag: 'latest' }),
        client.getGasPrice(),
      ]);

      result.rpcHealthy = !!latestBlock;

      if (latestBlock) {
        const recentBlocks = await Promise.all([
          client.getBlock({ blockNumber: latestBlock.number - BigInt(1) }),
          client.getBlock({ blockNumber: latestBlock.number - BigInt(2) }),
          client.getBlock({ blockNumber: latestBlock.number - BigInt(3) }),
        ]);

        const validBlocks = recentBlocks.filter(Boolean);
        if (validBlocks.length >= 2) {
          const timeDiffs = [];
          for (let i = 0; i < validBlocks.length - 1; i++) {
            timeDiffs.push(Number(validBlocks[i].timestamp) - Number(validBlocks[i + 1].timestamp));
          }
          result.avgBlockTime = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        }
      }

      if (gasPrice) {
        result.gasPrice = {
          gwei: formatGwei(gasPrice),
          eth: formatEther(gasPrice),
        };
      }
    } catch (error) {
      console.error('Chain status fetch error:', error);
      result.rpcHealthy = false;
    }

    const response = {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };

    await setCached(cacheKey, JSON.stringify(response), metadata.annotations.cacheTTL);

    return response;
  } catch (error) {
    const errorOutput: ToolErrorOutput = {
      error: true,
      message: `Error fetching chain status: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }`,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(errorOutput, null, 2),
        },
      ],
    };
  }
}
