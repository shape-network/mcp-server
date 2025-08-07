import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-verify';
import 'dotenv/config';
import { HardhatUserConfig } from 'hardhat/config';

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
      chainId: 11011,
      url: 'https://sepolia.shape.network',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      shapeSepolia: '123', // Hardhat needs a key, even if not used
    },
    customChains: [
      {
        network: 'shapeSepolia',
        chainId: 11011,
        urls: {
          apiURL: 'https://explorer-sepolia.shape.network/api',
          browserURL: 'https://explorer-sepolia.shape.network',
        },
      },
    ],
  },
};

export default config;
