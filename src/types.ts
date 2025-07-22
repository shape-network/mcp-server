export type CollectionAnalyticsOutput = {
  contractAddress: string;
  timestamp: string;
  name: string | null;
  floorPriceETH: number | null;
  sevenDayVolumeETH: number | null;
  sevenDaySalesCount: number | null;
  averageSalePriceETH: number | null;
  totalSupply: number | null;
  marketCapETH: number | null;
};

export type ShapeCreatorAnalyticsOutput = {
  creatorAddress: string;
  timestamp: string;
  hasTokens: boolean;
  totalTokens: number;
  totalEarnedETH: number;
  currentBalanceETH: number;
  totalWithdrawnETH: number;
  registeredContracts: number;
};

export type TopShapeCreatorsOutput = {
  timestamp: string;
  totalCreatorsAnalyzed: number;
  topCreators: Array<{
    address: string;
    totalTokens: number;
    totalEarnedETH: number;
    currentBalanceETH: number;
    registeredContracts: number;
  }>;
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
};
