import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { Address, getContract, isAddress } from 'viem';
import { abi as stackAbi } from '../../abi/stack';
import { addresses } from '../../addresses';
import { mainnetRpcClient, rpcClient } from '../../clients';
import { config } from '../../config';
import type { StackAchievementsOutput, ToolErrorOutput } from '../../types';
import { getCached, setCached } from '../../utils/cache';

export const schema = {
  userAddress: z
    .string()
    .refine((address) => isAddress(address), {
      message: 'Invalid address',
    })
    .describe('The user address or ENS name to fetch Stack achievements for'),
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
    cacheTTL: 60 * 5, // 5 minutes
  },
};

export default async function getStackAchievements({ userAddress }: InferSchema<typeof schema>) {
  const cacheKey = `mcp:stackAchievements:${config.chainId}:${userAddress.toLowerCase()}`;
  const cached = await getCached(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const stackContract = getContract({
      address: addresses.stack[config.chainId],
      abi: stackAbi,
      client: rpcClient(),
    });

    let resolvedAddress: Address;

    if (isAddress(userAddress)) {
      resolvedAddress = userAddress;
    } else {
      const rpc = mainnetRpcClient();
      const ensAddress = await rpc.getEnsAddress({ name: userAddress });
      if (!ensAddress) {
        const errorOutput: ToolErrorOutput = {
          error: true,
          message: `Unable to resolve ENS name: ${userAddress}`,
          userAddress: userAddress,
          timestamp: new Date().toISOString(),
        };

        const response = {
          content: [
            {
              type: 'text',
              text: JSON.stringify(errorOutput, null, 2),
            },
          ],
        };

        await setCached(cacheKey, JSON.stringify(response), metadata.annotations.cacheTTL);

        return response;
      }
      resolvedAddress = ensAddress;
    }

    const stackId = (await stackContract.read.addressToTokenId([resolvedAddress])) as bigint;

    if (stackId === BigInt(0)) {
      const result: StackAchievementsOutput = {
        userAddress: resolvedAddress,
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
    }

    const medals = (await stackContract.read.getStackMedals([stackId])) as Array<{
      stackOwner: string;
      stackId: bigint;
      medalUID: string;
      medalTier: number;
      medalData: string;
      timestamp: bigint;
    }>;

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

      if (tier === 1) {
        medalsByTier.bronze++;
      } else if (tier === 2) {
        medalsByTier.silver++;
      } else if (tier === 3) {
        medalsByTier.gold++;
      } else {
        medalsByTier.special++;
      }

      if (timestamp > lastMedalTimestamp) {
        lastMedalTimestamp = timestamp;
        lastMedalUID = medal.medalUID;
      }
    }

    const result: StackAchievementsOutput = {
      userAddress: resolvedAddress,
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
      message: `Error fetching Stack achievements: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      userAddress: userAddress,
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
