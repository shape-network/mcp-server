import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { OwnedNftsResponse } from 'alchemy-sdk';
import { alchemy } from '../clients';

export const schema = {
  address: z.string().describe('The wallet address to get NFTs for'),
  pageSize: z
    .number()
    .optional()
    .describe('Number of NFTs to return (default: 100, max: 100)'),
  pageKey: z.string().optional().describe('Page key for pagination'),
  withMetadata: z
    .boolean()
    .optional()
    .describe('Whether to include NFT metadata (default: true)'),
};

export const metadata = {
  name: 'getShapeNft',
  description:
    'Get NFTs owned by an address on Shape network using Alchemy SDK',
  annotations: {
    title: 'Get Shape NFTs',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getShapeNft({
  address,
  pageSize = 100,
  pageKey,
  withMetadata = true,
}: InferSchema<typeof schema>) {
  try {
    const nftsResponse: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(
      address,
      {
        pageSize,
        pageKey,
        omitMetadata: !withMetadata,
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(nftsResponse, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: true,
              message: `Error fetching NFTs: ${
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred'
              }`,
              address,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
