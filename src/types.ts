import { Address } from 'viem';

export type ShapeCreatorAnalyticsOutput = CreatorAnalytics & {
  timestamp: string;
};

type CreatorAnalytics = {
  address: Address;
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
  ownerAddress: Address;
  timestamp: string;
  totalNfts: number;
  nfts: Array<{
    tokenId: string;
    contractAddress: Address;
    name: string | null;
    imageUrl: string | null;
  }>;
};

export type ToolErrorOutput = {
  error: true;
  message: string;
  contractAddress?: Address;
  creatorAddress?: Address;
  ownerAddress?: Address;
  timestamp: string;
  userAddress?: Address;
};

export type GasbackSimulationOutput = {
  timestamp: string;
  hypotheticalTxs: number;
  avgGasPerTx: number;
  currentGasPriceWei: number;
  estimatedEarningsETH: number;
};

export type StackAchievementsOutput = {
  userAddress: Address;
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
  mainnetRpcUrl: string;
  testnetRpcUrl: string;
  rpcHealthy: boolean;
  gasPrice: {
    gwei: string;
    eth: string;
  } | null;
  avgBlockTime: number | null;
  docs: string;
};

export type TrendingCollectionsOutput = {
  timestamp: string;
  timeWindow: string;
  trending: Array<{
    contractAddress: Address;
    volumeETH: number;
    mintCount: number;
  }>;
};

type TransactionData = {
  to: Address;
  data: string;
  value: string;
};

export type PrepareMintSVGNFTOutput = {
  success: boolean;
  transaction: TransactionData;
  metadata: {
    contractAddress: Address;
    functionName: string;
    recipientAddress: Address;
    tokenURI: string;
    nftMetadata: Record<string, unknown>;
    estimatedGas: string;
    chainId: number;
    explorerUrl: string;
  };
  instructions: {
    nextSteps: string[];
  };
};

export type NormalizedMarketStats = {
  floorPrice: number | null;
  totalVolume: number | null;
  totalItems: number | null;
  owners: number | null;
};

export type CollectionAnalyticsOutput = {
  contractAddress: Address;
  name: string | null;
  symbol: string | null;
  totalSupply: number | null;
  owners: number | null;
};

export type MarketStatsOutput = {
  collection: Address;
  floorPrice: number | null;
  totalVolume: number | null;
  totalItems: number | null;
  owners: number | null;
  note?: string;
};
