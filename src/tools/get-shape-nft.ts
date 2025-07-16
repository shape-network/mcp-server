import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { Alchemy, Network } from 'alchemy-sdk';

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
      network: Network.SHAPE_SEPOLIA,
    });

    const nftsResponse = await alchemy.nft.getNftsForOwner(address, {
      pageSize,
      pageKey,
      omitMetadata: !withMetadata,
    });

    const nftCount = nftsResponse.totalCount;
    const nfts = nftsResponse.ownedNfts;

    let resultText = `Found ${nftCount} NFTs for address ${address} on Shape network:\n\n`;

    if (nfts.length === 0) {
      resultText += 'No NFTs found for this address.';
    } else {
      nfts.forEach((nft, index) => {
        resultText += `${index + 1}. ${nft.name || 'Untitled'}\n`;
        resultText += `   Contract: ${nft.contract.address}\n`;
        resultText += `   Token ID: ${nft.tokenId}\n`;

        if (nft.description) {
          resultText += `   Description: ${nft.description.substring(0, 100)}${
            nft.description.length > 100 ? '...' : ''
          }\n`;
        }

        if (nft.image?.originalUrl) {
          resultText += `   Image: ${nft.image.originalUrl}\n`;
        }

        if (nft.contract.name) {
          resultText += `   Collection: ${nft.contract.name}\n`;
        }

        if (nft.contract.symbol) {
          resultText += `   Symbol: ${nft.contract.symbol}\n`;
        }

        if (nft.tokenType) {
          resultText += `   Type: ${nft.tokenType}\n`;
        }

        resultText += '\n';
      });

      if (nftsResponse.pageKey) {
        resultText += `\nPagination available. Use pageKey: ${nftsResponse.pageKey} to get next page.`;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: resultText,
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
