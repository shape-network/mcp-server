import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { Alchemy, Network, OwnedNftsResponse } from 'alchemy-sdk';
import { config } from '../config';
import { shape } from 'viem/chains';

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
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;

  if (!alchemyApiKey) {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: ALCHEMY_API_KEY environment variable is not set. Please set your Alchemy API key.',
        },
      ],
    };
  }

  try {
    const alchemy = new Alchemy({
      apiKey: alchemyApiKey,
      network: config.isMainnet ? Network.SHAPE_MAINNET : Network.SHAPE_SEPOLIA,
    });

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
          text: `Error: ${
            error instanceof Error ? error.message : 'Unknown error occurred'
          }`,
        },
      ],
    };
  }
}
