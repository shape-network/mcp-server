import { GetFloorPriceResponse } from 'alchemy-sdk';

export type CollectionAnalyticsOutput = {
  contractAddress: string;
  timestamp: string;
  name: string | null;
  symbol: string | null;
  totalSupply: number | null;
  ownerCount: number | null;
  contractType: string | null;
  sampleNfts: Array<{
    tokenId: string;
    name: string | null;
    imageUrl: string | null;
  }>;
  floorPrice: GetFloorPriceResponse | null;
};

export type ShapeCreatorAnalyticsOutput = CreatorAnalytics & {
  timestamp: string;
};

type CreatorAnalytics = {
  address: string;
  ensName: string | null;
  totalGasbackEarnedETH: number;
  currentBalanceETH: number;
  registeredContracts: number;
};

export type TopShapeCreatorsOutput = {
  timestamp: string;
  totalCreatorsAnalyzed: number;
  topCreators: CreatorAnalytics[];
};

export type ShapeNftOutput = {
  ownerAddress: string;
  timestamp: string;
  totalNfts: number;
  nfts: Array<{
    tokenId: string;
    contractAddress: string;
    name: string | null;
    imageUrl: string | null;
  }>;
};

export type ToolErrorOutput = {
  error: true;
  message: string;
  contractAddress?: string;
  creatorAddress?: string;
  ownerAddress?: string;
  timestamp: string;
  userAddress?: string;
};

export type GasbackSimulationOutput = {
  contractAddress: string;
  timestamp: string;
  hypotheticalTxs: number;
  avgGasPerTx: number;
  currentGasPriceWei: number;
  estimatedEarningsETH: number;
};

export type StackAchievementsOutput = {
  userAddress: string;
  timestamp: string;
  hasStack: boolean;
  totalMedals: number;
  medalsByTier: {
    bronze: number;
    silver: number;
    gold: number;
    special: number;
  };
  lastMedalClaimed: {
    medalUID: string;
    claimedAt: string;
  } | null;
};

export type ChainStatusOutput = {
  timestamp: string;
  network: string;
  chainId: number;
  rpcHealthy: boolean;
  gasPrice: {
    gwei: string;
    eth: string;
  } | null;
  avgBlockTime: number | null;
};

export type TrendingCollectionsOutput = {
  timestamp: string;
  timeWindow: string;
  trending: Array<{
    contractAddress: string;
    volumeETH: number;
    mintCount: number;
  }>;
};
