import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { Address, isAddress } from 'viem';
import { NftFilters, NftOrdering, OwnedNftsResponse } from 'alchemy-sdk';
import { alchemy } from '../../clients';
import { config } from '../../config';
import type { ShapeNftOutput, ToolErrorOutput } from '../../types';
import { getCached, setCached } from '../../utils/cache';

export const schema = {
  address: z
    .string()
    .refine((address) => isAddress(address), {
      message: 'Invalid address',
    })
    .describe('The wallet address to get NFTs for'),
};

export const metadata = {
  name: 'getShapeNft',
  description: 'Get NFT ownership data for a given address.',
  annotations: {
    title: 'Get Shape NFTs',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'nft-analysis',
    educationalHint: true,
    chainableWith: ['getCollectionAnalytics'],
    cacheTTL: 60 * 10, // 10 minutes
  },
};

export default async function getShapeNft({ address }: InferSchema<typeof schema>) {
  const cacheKey = `mcp:shapeNft:${config.chainId}:${address.toLowerCase()}`;
  const cached = await getCached(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const nftsResponse: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(address, {
      pageSize: 25,
      omitMetadata: false,
      orderBy: NftOrdering.TRANSFERTIME,
      excludeFilters: [NftFilters.SPAM, NftFilters.AIRDROPS],
    });

    const result: ShapeNftOutput = {
      ownerAddress: address,
      timestamp: new Date().toISOString(),
      totalNfts: nftsResponse.totalCount || nftsResponse.ownedNfts.length,
      nfts: nftsResponse.ownedNfts.map((nft) => ({
        tokenId: nft.tokenId,
        contractAddress: nft.contract.address as Address,
        name: nft.name || null,
        imageUrl: nft.image?.originalUrl || nft.image?.thumbnailUrl || null,
      })),
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
      message: `Error fetching NFTs: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }`,
      ownerAddress: address,
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
