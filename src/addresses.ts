import { Address, zeroAddress } from 'viem';
import { shape, shapeSepolia } from 'viem/chains';

export const addresses: Record<string, Record<number, Address>> = {
  gasback: {
    [shape.id]: '0xf5e602c87d675E978F097503aedE4A766285a08B',
    [shapeSepolia.id]: '0xdF329d59bC797907703F7c198dDA2d770fC45034',
  },
  stack: {
    [shape.id]: '0x76d6aC90A62Ca547d51D7AcAeD014167F81B9931',
    [shapeSepolia.id]: '0xaF94F7b7Dd601967E3ebdba052F5Ed6d215220b3',
  },
  nftMinter: {
    [shapeSepolia.id]: '0xf8C93f671e24A60f4c11612b2DFAC3DD83F41340',
    [shape.id]: zeroAddress, // Replace with actual address when deployed to mainnet
  },
};
