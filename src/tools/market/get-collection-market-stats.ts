import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { RaribleProtocolMcp } from '@rarible/protocol-mcp';
import { ToolErrorOutput, NormalizedMarketStats, MarketStatsOutput } from '../../types';

const amountSchema = z
  .object({
    value: z.number().optional().nullable(),
    valueUsd: z.number().optional().nullable(),
    currency: z.string().optional(),
  })
  .partial();

const statsLikeSchema = z
  .object({
    id: z.string().optional().nullable(),
    listed: z.number().optional(),
    items: z.number().optional(),
    owners: z.number().optional(),
    floor: amountSchema.optional().nullable(),
    volume: amountSchema.optional().nullable(),
  })
  .strip();

function normalizeRaribleCollectionStats(input: unknown): NormalizedMarketStats | null {
  const parsed = statsLikeSchema.safeParse(input);
  if (!parsed.success) return null;
  const s = parsed.data;
  return {
    floorPrice: s.floor?.value ?? null,
    totalVolume: s.volume?.value ?? null,
    totalItems: s.items ?? null,
    owners: s.owners ?? null,
  };
}

function extractRawValueFromSdkError(error: unknown): unknown | null {
  if (!error || typeof error !== 'object') return null;
  return 'rawValue' in (error as Record<string, unknown>)
    ? ((error as { rawValue?: unknown }).rawValue ?? null)
    : null;
}
import { getCached, setCached } from '../../utils/cache';
import { isAddress } from 'viem';

export const schema = {
  collection: z
    .string()
    .refine((value) => isAddress(value), {
      message: 'Invalid collection address',
    })
    .describe('The collection contract address'),
};

export const metadata = {
  name: 'getCollectionMarketStats',
  description: 'Get market statistics from Rarible: floor price, volume, and trading activity',
  annotations: {
    title: 'Rarible Market Statistics',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'market-analysis',
    educationalHint: true,
    chainableWith: ['getCollectionAnalytics'],
    cacheTTL: 60 * 5, // 5 minutes
  },
};

export default async function getCollectionMarketStats({ collection }: InferSchema<typeof schema>) {
  const cacheKey = `mcp:collectionMarketStats:${collection.toLowerCase()}`;
  const cached = await getCached(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const raribleApiKey = process.env.RARIBLE_API_KEY;
    if (!raribleApiKey) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              error: true,
              message:
                'Please set RARIBLE_API_KEY environment variable to access Rarible market data',
              timestamp: new Date().toISOString(),
            } satisfies ToolErrorOutput),
          },
        ],
      };
    }

    const rarible = new RaribleProtocolMcp({
      apiKeyAuth: raribleApiKey,
    });

    const statsResponse = await rarible.collectionStatistics.getGlobalCollectionStatistics({
      id: `SHAPE:${collection}`,
    });

    if (!statsResponse) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                collection,
                floorPrice: null,
                totalVolume: null,
                totalItems: null,
                owners: null,
                note: 'No market data found for this collection on Rarible',
              },
              null,
              2
            ),
          },
        ],
      };
    }

    const normalized = normalizeRaribleCollectionStats(statsResponse);
    const marketStats: MarketStatsOutput = {
      collection,
      floorPrice: normalized?.floorPrice ?? null,
      totalVolume: normalized?.totalVolume ?? null,
      totalItems: normalized?.totalItems ?? null,
      owners: normalized?.owners ?? null,
    };

    const response = {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(marketStats, null, 2),
        },
      ],
    };

    await setCached(cacheKey, JSON.stringify(response), metadata.annotations.cacheTTL);

    return response;
  } catch (error) {
    const rawValue = extractRawValueFromSdkError(error);
    const normalizedFromError = normalizeRaribleCollectionStats(rawValue);
    if (normalizedFromError) {
      const marketStats: MarketStatsOutput = {
        collection,
        floorPrice: normalizedFromError.floorPrice,
        totalVolume: normalizedFromError.totalVolume,
        totalItems: normalizedFromError.totalItems,
        owners: normalizedFromError.owners,
      };

      const response = {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(marketStats, null, 2),
          },
        ],
      };

      await setCached(cacheKey, JSON.stringify(response), metadata.annotations.cacheTTL);
      return response;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Market stats error for collection ${collection}:`, error);

    const errorOutput: ToolErrorOutput = {
      error: true,
      message: `Failed to fetch market statistics: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(errorOutput, null, 2),
        },
      ],
    };
  }
}
