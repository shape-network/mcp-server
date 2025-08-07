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
      shapeSepolia: 'abc123abc123abc123abc123abc123abc1', // 32 char dummy key, needed for hardhat verify
    },
    customChains: [
      {
        network: 'shapeSepolia',
        chainId: 11011,
        urls: {
          apiURL: 'https://sepolia.shapescan.xyz/api',
          browserURL: 'https://sepolia.shapescan.xyz',
        },
      },
    ],
  },
};

export default config;
