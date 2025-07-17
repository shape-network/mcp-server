import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { Alchemy, Network, NftSaleMarketplace } from 'alchemy-sdk';
import { config } from '../config';

export const schema = {
  contractAddress: z
    .string()
    .describe('The NFT collection contract address to analyze'),
  includeFloorPrice: z
    .boolean()
    .optional()
    .describe('Include floor price data (default: true)'),
  includeSalesHistory: z
    .boolean()
    .optional()
    .describe('Include recent sales history (default: true)'),
  salesHistoryLimit: z
    .number()
    .optional()
    .describe('Number of recent sales to fetch (default: 20, max: 100)'),
  fromBlock: z
    .string()
    .optional()
    .describe('Start block for sales history (default: last 7 days)'),
  marketplace: z
    .enum(['seaport', 'wyvern', 'looksrare', 'x2y2', 'blur', 'cryptopunks'])
    .optional()
    .describe('Filter sales by specific marketplace'),
};

export const metadata = {
  name: 'getCollectionAnalytics',
  description:
    'Get comprehensive NFT collection analytics including floor prices, sales volume, and marketplace data using Alchemy API',
  annotations: {
    title: 'NFT Collection Analytics',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getCollectionAnalytics({
  contractAddress,
  includeFloorPrice = true,
  includeSalesHistory = true,
  salesHistoryLimit = 20,
  fromBlock,
  marketplace,
}: InferSchema<typeof schema>) {
  try {
    const alchemy = new Alchemy({
      apiKey: config.alchemyApiKey,
      network: config.isMainnet ? Network.SHAPE_MAINNET : Network.SHAPE_SEPOLIA,
    });

    const analytics: any = {
      contractAddress,
      timestamp: new Date().toISOString(),
    };

    // Get floor price data
    if (includeFloorPrice) {
      try {
        const floorPriceData = await alchemy.nft.getFloorPrice(contractAddress);
        analytics.floorPrices = floorPriceData;
      } catch (error) {
        analytics.floorPrices = {
          error: 'Floor price data not available for this collection',
        };
      }
    }

    // Get sales history
    if (includeSalesHistory) {
      try {
        // If no fromBlock specified, get approximately last 7 days of blocks
        if (!fromBlock) {
          const latestBlock = await alchemy.core.getBlockNumber();
          // Assuming ~2 second block times, 7 days = ~302,400 blocks
          fromBlock = Math.max(0, latestBlock - 302400).toString();
        }

        const salesParams: any = {
          fromBlock,
          toBlock: 'latest',
          contractAddress,
          limit: Math.min(salesHistoryLimit, 100),
          order: 'desc',
        };

        if (marketplace) {
          salesParams.marketplace = marketplace as NftSaleMarketplace;
        }

        const salesData = await alchemy.nft.getNftSales(salesParams);

        // Calculate sales analytics
        const sales = salesData.nftSales || [];
        const totalSales = sales.length;

        if (totalSales > 0) {
          // Calculate volume and average price
          let totalVolumeWei = 0;
          const marketplaceBreakdown: Record<string, number> = {};

          sales.forEach((sale) => {
            // Add to marketplace breakdown
            marketplaceBreakdown[sale.marketplace] =
              (marketplaceBreakdown[sale.marketplace] || 0) + 1;

            // Calculate volume (sum of sellerFee which represents sale price)
            if (sale.sellerFee?.amount) {
              totalVolumeWei += parseInt(sale.sellerFee.amount);
            }
          });

          const averagePriceWei = totalVolumeWei / totalSales;

          analytics.salesAnalytics = {
            totalSales,
            totalVolumeWei: totalVolumeWei.toString(),
            totalVolumeETH: (totalVolumeWei / 1e18).toFixed(4),
            averagePriceWei: averagePriceWei.toString(),
            averagePriceETH: (averagePriceWei / 1e18).toFixed(4),
            marketplaceBreakdown,
            blockRange: {
              fromBlock,
              toBlock: 'latest',
            },
          };

          // Recent sales summary
          analytics.recentSales = sales.slice(0, 10).map((sale) => ({
            marketplace: sale.marketplace,
            tokenId: sale.tokenId,
            buyer: sale.buyerAddress,
            seller: sale.sellerAddress,
            priceWei: sale.sellerFee?.amount || '0',
            priceETH: sale.sellerFee?.amount
              ? (parseInt(sale.sellerFee.amount) / 1e18).toFixed(4)
              : '0',
            currency: sale.sellerFee?.symbol || 'ETH',
            blockNumber: sale.blockNumber,
            transactionHash: sale.transactionHash,
          }));

          // Full sales data for detailed analysis
          analytics.fullSalesHistory = sales;
        } else {
          analytics.salesAnalytics = {
            totalSales: 0,
            message: 'No sales found in the specified time period',
          };
        }
      } catch (error) {
        analytics.salesHistory = {
          error: `Sales history not available: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        };
      }
    }

    // Get basic collection info
    try {
      const collectionNfts = await alchemy.nft.getNftsForContract(
        contractAddress,
        {
          pageSize: 1,
          omitMetadata: false,
        }
      );

      if (collectionNfts.nfts.length > 0) {
        const sampleNft = collectionNfts.nfts[0];
        analytics.collectionInfo = {
          name: sampleNft.contract.name,
          symbol: sampleNft.contract.symbol,
          contractType: sampleNft.contract.tokenType,
          totalSupply: sampleNft.contract.totalSupply,
        };
      }
    } catch (error) {
      analytics.collectionInfo = { error: 'Collection info not available' };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(analytics, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching collection analytics: ${
            error instanceof Error ? error.message : 'Unknown error occurred'
          }`,
        },
      ],
    };
  }
}
