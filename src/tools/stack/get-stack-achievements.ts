import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { getContract } from 'viem';
import { abi as stackAbi } from '../../abi/stack';
import { addresses } from '../../addresses';
import { rpcClient } from '../../clients';
import { config } from '../../config';
import type { StackAchievementsOutput, ToolErrorOutput } from '../../types';

export const schema = {
  userAddress: z
    .string()
    .describe('The user address to fetch Stack achievements for'),
};

export const metadata = {
  name: 'getStackAchievements',
  description:
    "Get a user's Stack achievements: total medals by tier (bronze, silver, gold, special), total count, and last medal claimed",
  annotations: {
    title: 'Stack Achievement Tracker',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'stack-analysis',
    educationalHint: true,
  },
};

export default async function getStackAchievements({
  userAddress,
}: InferSchema<typeof schema>) {
  try {
    const stackContract = getContract({
      address: addresses.stack[config.chainId],
      abi: stackAbi,
      client: rpcClient(),
    });

    // Get the stack ID for this user address
    const stackId = (await stackContract.read.addressToTokenId([
      userAddress as `0x${string}`,
    ])) as bigint;

    if (stackId === BigInt(0)) {
      // User doesn't have a Stack NFT
      const result: StackAchievementsOutput = {
        userAddress,
        timestamp: new Date().toISOString(),
        hasStack: false,
        totalMedals: 0,
        medalsByTier: {
          bronze: 0,
          silver: 0,
          gold: 0,
          special: 0,
        },
        lastMedalClaimed: null,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    // Get all medals for this stack
    const medals = (await stackContract.read.getStackMedals([
      stackId,
    ])) as Array<{
      stackOwner: string;
      stackId: bigint;
      medalUID: string;
      medalTier: number;
      medalData: string;
      timestamp: bigint;
    }>;

    // Count medals by tier (assuming tiers: 1=bronze, 2=silver, 3=gold, 4+=special)
    const medalsByTier = {
      bronze: 0,
      silver: 0,
      gold: 0,
      special: 0,
    };

    let lastMedalTimestamp = 0;
    let lastMedalUID = null;

    for (const medal of medals) {
      const tier = medal.medalTier;
      const timestamp = Number(medal.timestamp);

      // Count by tier
      if (tier === 1) {
        medalsByTier.bronze++;
      } else if (tier === 2) {
        medalsByTier.silver++;
      } else if (tier === 3) {
        medalsByTier.gold++;
      } else {
        medalsByTier.special++;
      }

      // Track most recent medal
      if (timestamp > lastMedalTimestamp) {
        lastMedalTimestamp = timestamp;
        lastMedalUID = medal.medalUID;
      }
    }

    const result: StackAchievementsOutput = {
      userAddress,
      timestamp: new Date().toISOString(),
      hasStack: true,
      totalMedals: medals.length,
      medalsByTier,
      lastMedalClaimed: lastMedalUID
        ? {
            medalUID: lastMedalUID,
            claimedAt: new Date(lastMedalTimestamp * 1000).toISOString(),
          }
        : null,
    };

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
      message: `Error fetching Stack achievements: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      userAddress,
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
