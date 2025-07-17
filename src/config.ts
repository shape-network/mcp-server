import { shape } from 'viem/chains';

export const config = {
  chainId: Number(process.env.CHAIN_ID),
  alchemyApiKey: process.env.ALCHEMY_API_KEY as string,
  isMainnet: Number(process.env.CHAIN_ID) === shape.id,
} as const;
