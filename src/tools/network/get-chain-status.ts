import { formatEther, formatGwei } from 'viem';
import { rpcClient } from '../../clients';
import { config } from '../../config';
import type { ChainStatusOutput, ToolErrorOutput } from '../../types';

export const schema = {};

export const metadata = {
  name: 'getChainStatus',
  description:
    'Get Shape network status: RPC health, gas prices, latest block info, and network metrics for monitoring and educational purposes',
  annotations: {
    title: 'Shape Chain Status',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'monitoring',
    educationalHint: true,
  },
};

export default async function getChainStatus() {
  try {
    const client = rpcClient();

    const result: ChainStatusOutput = {
      timestamp: new Date().toISOString(),
      network: config.isMainnet ? 'shape-mainnet' : 'shape-sepolia',
      chainId: config.chainId,
      rpcHealthy: false,
      gasPrice: null,
      avgBlockTime: null,
    };

    try {
      const [latestBlock, gasPrice] = await Promise.allSettled([
        client.getBlock({ blockTag: 'latest' }),
        client.getGasPrice(),
        client.getBlockNumber(),
      ]);

      result.rpcHealthy = latestBlock.status === 'fulfilled';

      if (latestBlock.status === 'fulfilled') {
        const block = latestBlock.value;

        try {
          const recentBlocks = await Promise.allSettled([
            client.getBlock({ blockNumber: block.number - BigInt(1) }),
            client.getBlock({ blockNumber: block.number - BigInt(2) }),
            client.getBlock({ blockNumber: block.number - BigInt(3) }),
          ]);

          const validBlocks = recentBlocks
            .filter((b) => b.status === 'fulfilled')
            .map((b) => (b.status === 'fulfilled' ? b.value : null))
            .filter(Boolean);

          if (validBlocks.length >= 2) {
            const timeDiffs = [];
            for (let i = 0; i < validBlocks.length - 1; i++) {
              timeDiffs.push(
                Number(validBlocks[i]!.timestamp) - Number(validBlocks[i + 1]!.timestamp)
              );
            }
            result.avgBlockTime = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
          }
        } catch (error) {
          console.error(error);
        }
      }

      if (gasPrice.status === 'fulfilled') {
        const gasPriceWei = gasPrice.value;

        result.gasPrice = {
          gwei: formatGwei(gasPriceWei),
          eth: formatEther(gasPriceWei),
        };
      }
    } catch (error) {
      console.error(error);
      result.rpcHealthy = false;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
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
