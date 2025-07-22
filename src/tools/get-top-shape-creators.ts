import { getContract } from 'viem';
import { type InferSchema } from 'xmcp';
import { z } from 'zod';
import { abi as gasbackAbi } from '../abi/gasback';
import { addresses } from '../addresses';
import { rpcClient } from '../clients';
import { config } from '../config';
import type { TopShapeCreatorsOutput, ToolErrorOutput } from '../types';

export const schema = {
  limit: z
    .number()
    .optional()
    .default(50)
    .describe('Number of top creators to return (default: 50, max: 100)'),
};

export const metadata = {
  name: 'getTopShapeCreators',
  description:
    'Get the top creators on Shape by gasback earnings: token count, total earned, current balance, and registered contracts',
  annotations: {
    title: 'Top Shape Creators by Gasback',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getTopShapeCreators({
  limit = 50,
}: InferSchema<typeof schema>) {
  try {
    const gasbackContract = getContract({
      address: addresses.gasback[config.chainId],
      abi: gasbackAbi,
      client: rpcClient(),
    });

    const finalLimit = Math.min(Math.max(1, limit), 100);
    const totalSupply = (await gasbackContract.read.totalSupply()) as bigint;
    const totalTokens = Number(totalSupply);

    const result: TopShapeCreatorsOutput = {
      timestamp: new Date().toISOString(),
      totalCreatorsAnalyzed: 0,
      topCreators: [],
    };

    if (totalTokens === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    // Map to aggregate creator stats
    const creatorStats = new Map<
      string,
      {
        address: string;
        totalTokens: number;
        totalEarnedWei: bigint;
        currentBalanceWei: bigint;
        registeredContracts: number;
      }
    >();

    // Process all tokens
    for (let tokenId = 1; tokenId <= totalTokens; tokenId++) {
      try {
        const tokenOwner = (await gasbackContract.read.ownerOf([
          BigInt(tokenId),
        ])) as `0x${string}`;

        const [totalGasback, currentBalance, registeredContracts] =
          await Promise.all([
            gasbackContract.read.getTokenTotalGasback([
              BigInt(tokenId),
            ]) as Promise<bigint>,
            gasbackContract.read.getTokenGasbackBalance([
              BigInt(tokenId),
            ]) as Promise<bigint>,
            gasbackContract.read.getTokenRegisteredContracts([
              BigInt(tokenId),
            ]) as Promise<string[]>,
          ]);

        if (!creatorStats.has(tokenOwner)) {
          creatorStats.set(tokenOwner, {
            address: tokenOwner,
            totalTokens: 0,
            totalEarnedWei: BigInt(0),
            currentBalanceWei: BigInt(0),
            registeredContracts: 0,
          });
        }

        const stats = creatorStats.get(tokenOwner)!;
        stats.totalTokens += 1;
        stats.totalEarnedWei += totalGasback;
        stats.currentBalanceWei += currentBalance;
        stats.registeredContracts += registeredContracts.length;
      } catch (error) {
        // Token might not exist, skip
        continue;
      }
    }

    // Convert to final format and sort
    const allCreators = Array.from(creatorStats.values())
      .map((stats) => ({
        address: stats.address,
        totalTokens: stats.totalTokens,
        totalEarnedETH: parseFloat(
          (Number(stats.totalEarnedWei) / 1e18).toFixed(6)
        ),
        currentBalanceETH: parseFloat(
          (Number(stats.currentBalanceWei) / 1e18).toFixed(6)
        ),
        registeredContracts: stats.registeredContracts,
      }))
      .sort((a, b) => b.totalEarnedETH - a.totalEarnedETH)
      .slice(0, finalLimit);

    result.totalCreatorsAnalyzed = creatorStats.size;
    result.topCreators = allCreators;

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
      message: `Error fetching top Shape creators: ${
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
