import { createPublicClient, http } from 'viem';
import { shape, shapeSepolia } from 'viem/chains';
import { config } from '@/config';
import { Alchemy, Network } from 'alchemy-sdk';

export const alchemyClient = new Alchemy({
  apiKey: config.alchemyApiKey,
  network: config.isMainnet ? Network.SHAPE_MAINNET : Network.SHAPE_SEPOLIA,
});

export const publicClient = createPublicClient({
  chain: config.isMainnet ? shape : shapeSepolia,
  transport: http(),
  batch: {
    multicall: true,
  },
});
