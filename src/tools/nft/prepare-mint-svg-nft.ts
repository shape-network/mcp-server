import { encodeFunctionData, isAddress, zeroAddress } from 'viem';
import { addresses } from '../../addresses';
import { abi as nftMinterAbi } from '../../abi/nftMinter';
import type { ToolErrorOutput, PrepareMintSVGNFTOutput } from '../../types';
import { shapeSepolia } from 'viem/chains';
import { InferSchema } from 'xmcp';
import { z } from 'zod';

// Chain is hard-coded to Shape Sepolia for testing purposes
const chainId = shapeSepolia.id;

export const schema = {
  recipientAddress: z
    .string()
    .refine((address) => isAddress(address), {
      message: 'Invalid address',
    })
    .describe('The wallet address to mint the NFT to'),
  svgContent: z.string().describe('SVG content for the NFT'),
  name: z.string().describe('NFT name'),
  description: z.string().optional().describe('NFT description (optional)'),
};

export const metadata = {
  name: 'prepareMintSVGNFT',
  description: 'Prepare transaction data for minting an SVG NFT on Shape Sepolia testnet',
  annotations: {
    category: 'NFT',
    requiresAuth: false,
    network: 'shape-sepolia',
    cacheTTL: 0,
  },
};

export default async function prepareMintSVGNFT(params: InferSchema<typeof schema>) {
  try {
    const {
      recipientAddress,
      svgContent,
      name,
      description = 'SVG NFT created via Shape MCP Server',
    } = params;

    const contractAddress = addresses.nftMinter[chainId];

    if (!contractAddress || contractAddress === zeroAddress) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'NFT_CONTRACT_NOT_DEPLOYED',
              message: `NFT minter contract not available on chain ${chainId}`,
            }),
          },
        ],
      };
    }

    // Create metadata JSON with base64-encoded SVG
    const metadata = {
      name,
      description,
      image: `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`,
      attributes: [
        { trait_type: 'Format', value: 'SVG' },
        { trait_type: 'Created Via', value: 'Shape MCP Server' },
        { trait_type: 'Chain', value: 'Shape Sepolia' },
      ],
    };

    const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;

    const transactionData = {
      to: contractAddress,
      data: encodeFunctionData({
        abi: nftMinterAbi,
        functionName: 'mintNFT',
        args: [recipientAddress, tokenURI],
      }),
      value: '0x0', // No ETH value needed
    };

    const result: PrepareMintSVGNFTOutput = {
      success: true,
      transaction: transactionData,
      metadata: {
        contractAddress,
        functionName: 'mintNFT',
        recipientAddress,
        tokenURI,
        nftMetadata: metadata,
        estimatedGas: '100000', // TODO: Get actual gas estimate to prevent failed transactions
        chainId,
        explorerUrl: `https://sepolia.shapescan.xyz/address/${contractAddress}`,
      },
      instructions: {
        nextSteps: [
          'Use your wallet to execute this transaction',
          'The NFT will be minted to the specified recipient address',
          'Check the transaction on Shape Sepolia explorer',
        ],
      },
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
      message: `Error preparing mint transaction: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }`,
      ownerAddress: params.recipientAddress,
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
