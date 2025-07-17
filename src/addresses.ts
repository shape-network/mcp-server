import { Address } from 'viem';
import { shape, shapeSepolia } from 'viem/chains';

export const addresses: Record<string, Record<number, Address>> = {
  gasback: {
    [shape.id]: '0xf5e602c87d675E978F097503aedE4A766285a08B',
    [shapeSepolia.id]: '0xdF329d59bC797907703F7c198dDA2d770fC45034',
  },
};
