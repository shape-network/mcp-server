import { Alchemy, Network } from 'alchemy-sdk';
import { createPublicClient, http } from 'viem';
import { mainnet, shape, shapeSepolia } from 'viem/chains';
import { Redis } from 'ioredis';
import { config } from './config';

export const alchemy = new Alchemy({
  apiKey: config.alchemyApiKey,
  network: config.chainId === shape.id ? Network.SHAPE_MAINNET : Network.SHAPE_SEPOLIA,
});

export function rpcClient() {
  const chain = config.chainId === shape.id ? shape : shapeSepolia;
  const rootUrl = chain.id === shape.id ? 'shape-mainnet' : 'shape-sepolia';

  const rpcUrl = config.alchemyApiKey
    ? `https://${rootUrl}.g.alchemy.com/v2/${config.alchemyApiKey}`
    : config.defaultRpcUrl;

  return createPublicClient({
    chain,
    transport: http(rpcUrl),
    batch: {
      multicall: true,
    },
  });
}

export function mainnetRpcClient() {
  return createPublicClient({
    chain: mainnet,
    transport: http(),
  });
}

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 20,
  keepAlive: 3000,
  lazyConnect: true,
});
