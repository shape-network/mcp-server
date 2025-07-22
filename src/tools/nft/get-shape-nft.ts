import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { OwnedNftsResponse } from 'alchemy-sdk';
import { alchemy } from '../../clients';
import type { ShapeNftOutput, ToolErrorOutput } from '../../types';

export const schema = {
  address: z.string().describe('The wallet address to get NFTs for'),
};

export const metadata = {
  name: 'getShapeNft',
  description:
    'Get essential NFT ownership data for an address: token count and basic NFT information',
  annotations: {
    title: 'Get Shape NFTs',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getShapeNft({
  address,
}: InferSchema<typeof schema>) {
  try {
    const nftsResponse: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(
      address,
      {
        pageSize: 100,
        omitMetadata: false,
      }
    );

    const result: ShapeNftOutput = {
      ownerAddress: address,
      timestamp: new Date().toISOString(),
      totalNfts: nftsResponse.totalCount || nftsResponse.ownedNfts.length,
      nfts: nftsResponse.ownedNfts.map((nft) => ({
        tokenId: nft.tokenId,
        contractAddress: nft.contract.address,
        name: nft.name || null,
        imageUrl: nft.image?.originalUrl || nft.image?.thumbnailUrl || null,
      })),
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
