import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { alchemy } from '../../clients';
import type { CollectionAnalyticsOutput, ToolErrorOutput } from '../../types';

export const schema = {
  contractAddress: z
    .string()
    .describe('The NFT collection contract address to analyze'),
};

export const metadata = {
  name: 'getCollectionAnalytics',
  description:
    'Get onchain NFT collection analytics: name, symbol, total supply, owner count, token standard, and sample NFTs. Perfect for AI agents analyzing NFT ecosystems.',
  annotations: {
    title: 'NFT Collection Analytics',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'nft-analysis',
    educationalHint: true,
    chainableWith: ['getShapeNft', 'simulateGasbackRewards'],
  },
};

export default async function getCollectionAnalytics({
  contractAddress,
}: InferSchema<typeof schema>) {
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
    };

    // Parallelize API calls for better performance
    const [collectionResult, ownersResult] = await Promise.allSettled([
      alchemy.nft.getNftsForContract(contractAddress, {
        pageSize: 10,
        omitMetadata: false,
      }),
      alchemy.nft.getOwnersForContract(contractAddress),
    ]);

    // Process collection info
    if (
      collectionResult.status === 'fulfilled' &&
      collectionResult.value.nfts.length > 0
    ) {
      const sampleNft = collectionResult.value.nfts[0];
      analytics.name = sampleNft.contract.name || null;
      analytics.symbol = sampleNft.contract.symbol || null;
      analytics.totalSupply = sampleNft.contract.totalSupply
        ? parseInt(sampleNft.contract.totalSupply)
        : null;
      analytics.contractType = sampleNft.contract.tokenType || null;

      // Get sample NFTs (up to 5)
      analytics.sampleNfts = collectionResult.value.nfts
        .slice(0, 5)
        .map((nft) => ({
          tokenId: nft.tokenId,
          name: nft.name || null,
          imageUrl: nft.image?.originalUrl || nft.image?.thumbnailUrl || null,
        }));
    }

    // Process owner count
    if (ownersResult.status === 'fulfilled') {
      analytics.ownerCount = ownersResult.value.owners.length;
    }

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
