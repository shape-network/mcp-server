import { getContract } from 'viem';
import { type InferSchema } from 'xmcp';
import { z } from 'zod';
import { abi as gasbackAbi } from '../../abi/gasback';
import { addresses } from '../../addresses';
import { rpcClient } from '../../clients';
import { config } from '../../config';
import type { ShapeCreatorAnalyticsOutput, ToolErrorOutput } from '../../types';

export const schema = {
  creatorAddress: z
    .string()
    .describe('The creator/owner address to analyze gasback data for'),
};

export const metadata = {
  name: 'getShapeCreatorAnalytics',
  description:
    'Get essential gasback analytics for a Shape creator: token count, earnings, balance, withdrawals, and registered contracts. Ideal for AI agents tracking creator performance.',
  annotations: {
    title: 'Shape Creator Gasback Analytics',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'gasback-analysis',
    educationalHint: true,
    chainableWith: ['getTopShapeCreators', 'simulateGasbackRewards'],
  },
};

export default async function getShapeCreatorAnalytics({
  creatorAddress,
}: InferSchema<typeof schema>) {
  try {
    const gasbackContract = getContract({
      address: addresses.gasback[config.chainId],
      abi: gasbackAbi,
      client: rpcClient(),
    });

    // Get all tokens owned by this creator
    const ownedTokens = (await gasbackContract.read.getOwnedTokens([
      creatorAddress as `0x${string}`,
    ])) as bigint[];

    const analytics: ShapeCreatorAnalyticsOutput = {
      creatorAddress,
      timestamp: new Date().toISOString(),
      hasTokens: ownedTokens.length > 0,
      totalTokens: ownedTokens.length,
      totalEarnedETH: 0,
      currentBalanceETH: 0,
      totalWithdrawnETH: 0,
      registeredContracts: 0,
    };

    if (ownedTokens.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analytics, null, 2),
          },
        ],
      };
    }

    // Calculate aggregate metrics
    let totalGasbackEarned = 0;
    let totalCurrentBalance = 0;
    let totalRegisteredContracts = 0;

    for (const tokenId of ownedTokens) {
      const [totalGasback, currentBalance, registeredContracts] =
        await Promise.all([
          gasbackContract.read.getTokenTotalGasback([
            tokenId,
          ]) as Promise<bigint>,
          gasbackContract.read.getTokenGasbackBalance([
            tokenId,
          ]) as Promise<bigint>,
          gasbackContract.read.getTokenRegisteredContracts([
            tokenId,
          ]) as Promise<string[]>,
        ]);

      totalGasbackEarned += Number(totalGasback);
      totalCurrentBalance += Number(currentBalance);
      totalRegisteredContracts += registeredContracts.length;
    }

    analytics.totalEarnedETH = parseFloat(
      (totalGasbackEarned / 1e18).toFixed(6)
    );
    analytics.currentBalanceETH = parseFloat(
      (totalCurrentBalance / 1e18).toFixed(6)
    );
    analytics.totalWithdrawnETH = parseFloat(
      ((totalGasbackEarned - totalCurrentBalance) / 1e18).toFixed(6)
    );
    analytics.registeredContracts = totalRegisteredContracts;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(analytics, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorOutput: ToolErrorOutput = {
      error: true,
      message: `Error analyzing creator gasback data: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }`,
      creatorAddress,
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
