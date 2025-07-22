import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { alchemy } from '../clients';
import type { CollectionAnalyticsOutput, ToolErrorOutput } from '../types';

export const schema = {
  contractAddress: z
    .string()
    .describe('The NFT collection contract address to analyze'),
};

export const metadata = {
  name: 'getCollectionAnalytics',
  description:
    'Get onchain NFT collection analytics: name, symbol, total supply, owner count, token standard, and sample NFTs',
  annotations: {
    title: 'NFT Collection Analytics',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
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

    // Get basic collection info, sample NFTs, and metadata
    try {
      const collectionNfts = await alchemy.nft.getNftsForContract(
        contractAddress,
        {
          pageSize: 10,
          omitMetadata: false,
        }
      );

      if (collectionNfts.nfts.length > 0) {
        const sampleNft = collectionNfts.nfts[0];
        analytics.name = sampleNft.contract.name || null;
        analytics.symbol = sampleNft.contract.symbol || null;
        analytics.totalSupply = sampleNft.contract.totalSupply
          ? parseInt(sampleNft.contract.totalSupply)
          : null;
        analytics.contractType = sampleNft.contract.tokenType || null;

        // Get sample NFTs (up to 5)
        analytics.sampleNfts = collectionNfts.nfts.slice(0, 5).map((nft) => ({
          tokenId: nft.tokenId,
          name: nft.name || null,
          imageUrl: nft.image?.originalUrl || nft.image?.thumbnailUrl || null,
        }));
      }
    } catch (error) {
      console.warn('Could not fetch collection info:', error);
    }

    // Get owner count
    try {
      const owners = await alchemy.nft.getOwnersForContract(contractAddress);
      analytics.ownerCount = owners.owners.length;
    } catch (error) {
      console.warn('Could not fetch owner count:', error);
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
