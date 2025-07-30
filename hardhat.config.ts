import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';
import { shapeSepolia } from 'viem/chains';

const privateKey = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.26',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    shapeSepolia: {
      chainId: shapeSepolia.id,
      url: 'https://sepolia.shape.network',
      accounts: privateKey ? [privateKey] : [],
    },
  },
};

export default config;
