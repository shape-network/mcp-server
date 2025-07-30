import { formatEther, getContract, isAddress } from 'viem';
import { type InferSchema } from 'xmcp';
import { z } from 'zod';
import { abi as gasbackAbi } from '../../abi/gasback';
import { addresses } from '../../addresses';
import { mainnetRpcClient, rpcClient } from '../../clients';
import { config } from '../../config';
import type { ShapeCreatorAnalyticsOutput, ToolErrorOutput } from '../../types';
import { getCached, setCached } from '../../utils/cache';

export const schema = {
  creatorAddress: z
    .string()
    .refine((address) => isAddress(address), {
      message: 'Invalid address',
    })
    .describe('The creator/owner address to analyze gasback data for'),
};

export const metadata = {
  name: 'getShapeCreatorAnalytics',
  description:
    'Get Shape creator analytics: gasback earnings, balance, withdrawals, tx volume, and registered contracts.',
  annotations: {
    title: 'Shape Creator Gasback Analytics',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'gasback-analysis',
    educationalHint: true,
    chainableWith: ['getTopShapeCreators', 'simulateGasbackRewards'],
    cacheTTL: 60 * 5, // 5 minutes
  },
};

export default async function getShapeCreatorAnalytics({
  creatorAddress,
}: InferSchema<typeof schema>) {
  const cacheKey = `mcp:shapeCreatorAnalytics:${config.chainId}:${creatorAddress.toLowerCase()}`;
  const cached = await getCached(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const gasbackContract = getContract({
      address: addresses.gasback[config.chainId],
      abi: gasbackAbi,
      client: rpcClient(),
    });

    const ownedTokens = (await gasbackContract.read.getOwnedTokens([creatorAddress])) as bigint[];

    const rpc = mainnetRpcClient();
    const ensName = await rpc.getEnsName({ address: creatorAddress });

    const analytics: ShapeCreatorAnalyticsOutput = {
      address: creatorAddress,
      ensName,
      timestamp: new Date().toISOString(),
      totalGasbackEarnedETH: 0,
      currentBalanceETH: 0,
      registeredContracts: 0,
    };

    if (ownedTokens.length === 0) {
      const response = {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analytics, null, 2),
          },
        ],
      };

      await setCached(cacheKey, JSON.stringify(response), metadata.annotations.cacheTTL);

      return response;
    }

    let totalGasbackEarned = BigInt(0);
    let totalCurrentBalance = BigInt(0);
    let totalRegisteredContracts = 0;

    for (const tokenId of ownedTokens) {
      const [totalGasback, currentBalance, registeredContracts] = await Promise.all([
        gasbackContract.read.getTokenTotalGasback([tokenId]) as Promise<bigint>,
        gasbackContract.read.getTokenGasbackBalance([tokenId]) as Promise<bigint>,
        gasbackContract.read.getTokenRegisteredContracts([tokenId]) as Promise<string[]>,
      ]);

      totalGasbackEarned += totalGasback;
      totalCurrentBalance += currentBalance;
      totalRegisteredContracts += registeredContracts.length;
    }

    analytics.totalGasbackEarnedETH = Number(formatEther(totalGasbackEarned));
    analytics.currentBalanceETH = Number(formatEther(totalCurrentBalance));
    analytics.registeredContracts = totalRegisteredContracts;

    const response = {
      content: [
        {
          type: 'text',
          text: JSON.stringify(analytics, null, 2),
        },
      ],
    };

    await setCached(cacheKey, JSON.stringify(response), metadata.annotations.cacheTTL);

    return response;
  } catch (error) {
    const errorOutput: ToolErrorOutput = {
      error: true,
      message: `Error analyzing creator gasback data: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }`,
      creatorAddress: creatorAddress,
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
