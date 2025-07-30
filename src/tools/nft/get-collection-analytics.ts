import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { isAddress } from 'viem';
import { alchemy } from '../../clients';
import { config } from '../../config';
import type { CollectionAnalyticsOutput, ToolErrorOutput } from '../../types';
import { getCached, setCached } from '../../utils/cache';

export const schema = {
  contractAddress: z
    .string()
    .refine((address) => isAddress(address), {
      message: 'Invalid address',
    })
    .describe('The NFT collection contract address to analyze'),
};

export const metadata = {
  name: 'getCollectionAnalytics',
  description:
    'Get NFT collection analytics: name, symbol, total supply, owner count, sample NFTs, marketplace floor prices, etc.',
  annotations: {
    title: 'NFT Collection Analytics',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'nft-analysis',
    educationalHint: true,
    chainableWith: ['getShapeNft', 'simulateGasbackRewards'],
    cacheTTL: 60 * 15, // 15 minutes
  },
};

export default async function getCollectionAnalytics({
  contractAddress,
}: InferSchema<typeof schema>) {
  const cacheKey = `mcp:collectionAnalytics:${config.chainId}:${contractAddress.toLowerCase()}`;
  const cached = await getCached(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const analytics: CollectionAnalyticsOutput = {
      contractAddress,
      timestamp: new Date().toISOString(),
      name: null,
      symbol: null,
      totalSupply: null,
      ownerCount: null,
      contractType: null,
      sampleNfts: [],
      floorPrice: null,
    };

    const [collectionResult, ownersResult, floorPriceResult] = await Promise.allSettled([
      alchemy.nft.getNftsForContract(contractAddress, {
        pageSize: 10,
        omitMetadata: false,
      }),
      alchemy.nft.getOwnersForContract(contractAddress),
      alchemy.nft.getFloorPrice(contractAddress),
    ]);

    if (collectionResult.status === 'fulfilled' && collectionResult.value.nfts.length > 0) {
      const sampleNft = collectionResult.value.nfts[0];
      analytics.name = sampleNft.contract.name || null;
      analytics.symbol = sampleNft.contract.symbol || null;
      analytics.totalSupply = sampleNft.contract.totalSupply
        ? parseInt(sampleNft.contract.totalSupply)
        : null;
      analytics.contractType = sampleNft.contract.tokenType || null;

      analytics.sampleNfts = collectionResult.value.nfts.slice(0, 5).map((nft) => ({
        tokenId: nft.tokenId,
        name: nft.name || null,
        imageUrl: nft.image?.originalUrl || nft.image?.thumbnailUrl || null,
      }));
    }

    if (ownersResult.status === 'fulfilled') {
      analytics.ownerCount = ownersResult.value.owners.length;
    }

    if (floorPriceResult.status === 'fulfilled') {
      analytics.floorPrice = floorPriceResult.value;
    }

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
      message: `Error fetching collection analytics: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }`,
      contractAddress,
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
