import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { alchemy } from '../clients';
import type { CollectionAnalyticsOutput, ToolErrorOutput } from '../types';

export const schema = {
  contractAddress: z
    .string()
    .describe('The NFT collection contract address to analyze'),
};

export const metadata = {
  name: 'getCollectionAnalytics',
  description:
    'Get essential NFT collection analytics: name, floor price, 7-day volume, sales count, average price, total supply, and market cap',
  annotations: {
    title: 'NFT Collection Analytics',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getCollectionAnalytics({
  contractAddress,
}: InferSchema<typeof schema>) {
  try {
    const analytics: CollectionAnalyticsOutput = {
      contractAddress,
      timestamp: new Date().toISOString(),
      name: null,
      floorPriceETH: null,
      sevenDayVolumeETH: null,
      sevenDaySalesCount: null,
      averageSalePriceETH: null,
      totalSupply: null,
      marketCapETH: null,
    };

    // Get basic collection info and total supply
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
        analytics.name = sampleNft.contract.name || null;
        analytics.totalSupply = sampleNft.contract.totalSupply
          ? parseInt(sampleNft.contract.totalSupply)
          : null;
      }
    } catch (error) {
      console.warn('Could not fetch collection info:', error);
    }

    // Get floor price
    try {
      const floorPriceData = await alchemy.nft.getFloorPrice(contractAddress);
      const data = floorPriceData as any;
      if (data?.looksRare?.floorPrice) {
        analytics.floorPriceETH = parseFloat(data.looksRare.floorPrice);
      } else if (data?.openSea?.floorPrice) {
        analytics.floorPriceETH = parseFloat(data.openSea.floorPrice);
      }
    } catch (error) {
      console.warn('Could not fetch floor price:', error);
    }

    // Get 7-day sales data
    try {
      const latestBlock = await alchemy.core.getBlockNumber();
      // Approximately 7 days of blocks (assuming ~2 second block times)
      const fromBlock = Math.max(0, latestBlock - 302400);

      const salesData = await alchemy.nft.getNftSales({
        fromBlock,
        toBlock: 'latest',
        contractAddress,
        limit: 100,
      });

      const sales = salesData.nftSales || [];
      analytics.sevenDaySalesCount = sales.length;

      if (sales.length > 0) {
        let totalVolumeWei = 0;
        sales.forEach((sale) => {
          if (sale.sellerFee?.amount) {
            totalVolumeWei += parseInt(sale.sellerFee.amount);
          }
        });

        analytics.sevenDayVolumeETH = parseFloat(
          (totalVolumeWei / 1e18).toFixed(4)
        );
        analytics.averageSalePriceETH = parseFloat(
          (totalVolumeWei / sales.length / 1e18).toFixed(4)
        );
      } else {
        analytics.sevenDayVolumeETH = 0;
        analytics.averageSalePriceETH = 0;
      }
    } catch (error) {
      console.warn('Could not fetch sales data:', error);
    }

    // Calculate market cap (floor price × total supply)
    if (analytics.floorPriceETH && analytics.totalSupply) {
      analytics.marketCapETH = parseFloat(
        (analytics.floorPriceETH * analytics.totalSupply).toFixed(4)
      );
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
    const errorOutput: ToolErrorOutput = {
      error: true,
      message: `Error fetching collection analytics: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }`,
      contractAddress,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(errorOutput, null, 2),
        },
      ],
    };
  }
}
