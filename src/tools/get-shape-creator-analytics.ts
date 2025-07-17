import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { AssetTransfersCategory } from 'alchemy-sdk';
import { getContract } from 'viem';
import { config } from '../config';
import { addresses } from '../addresses';
import { alchemyClient, publicClient } from '../clients';
import { abi as gasbackAbi } from '../abi/gasback';

export const schema = {
  contractAddress: z
    .string()
    .describe('The contract address to analyze creator metrics for'),
  creatorAddress: z
    .string()
    .optional()
    .describe('The creator/owner address of the contract'),
  fromBlock: z
    .string()
    .optional()
    .describe('Start block for analysis (default: last 1000 blocks)'),
  toBlock: z
    .string()
    .optional()
    .describe('End block for analysis (default: latest)'),
  includeTxDetails: z
    .boolean()
    .optional()
    .describe('Include detailed transaction data (default: true)'),
};

export const metadata = {
  name: 'getShapeCreatorAnalytics',
  description:
    'Analyze Shape creator economics including gasback earnings, contract interactions, and creator performance metrics',
  annotations: {
    title: 'Shape Creator Analytics',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getShapeCreatorAnalytics({
  contractAddress,
  creatorAddress,
  fromBlock,
  toBlock = 'latest',
  includeTxDetails = true,
}: InferSchema<typeof schema>) {
  try {
    const gasbackContract = getContract({
      address: addresses.gasback[config.chainId],
      abi: gasbackAbi,
      client: publicClient,
    });

    // Get real gasback data from Shape's gasback contract
    let gasbackData = null;
    let isRegistered = false;

    try {
      isRegistered = (await gasbackContract.read.isRegistered([
        contractAddress as `0x${string}`,
      ])) as boolean;

      if (isRegistered) {
        const contractData = (await gasbackContract.read.getContractData([
          contractAddress as `0x${string}`,
        ])) as {
          tokenId: bigint;
          balanceUpdatedBlock: bigint;
          totalEarned: bigint;
        };
        const tokenId = contractData.tokenId;

        const [totalEarned, currentBalance] = await Promise.all([
          gasbackContract.read.getContractTotalEarned([
            contractAddress as `0x${string}`,
          ]) as Promise<bigint>,
          gasbackContract.read.getTokenGasbackBalance([
            tokenId,
          ]) as Promise<bigint>,
        ]);

        gasbackData = {
          isRegistered: true,
          tokenId: tokenId.toString(),
          totalEarnedWei: totalEarned.toString(),
          totalEarnedETH: (Number(totalEarned) / 1e18).toFixed(6),
          currentBalanceWei: currentBalance.toString(),
          currentBalanceETH: (Number(currentBalance) / 1e18).toFixed(6),
          balanceUpdatedBlock: contractData.balanceUpdatedBlock.toString(),
        };
      } else {
        gasbackData = {
          isRegistered: false,
          message: 'Contract is not registered for gasback on Shape',
        };
      }
    } catch (error) {
      gasbackData = {
        isRegistered: false,
        error: `Failed to fetch gasback data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }

    // If no fromBlock specified, get last 1000 blocks
    if (!fromBlock) {
      const latestBlock = await alchemyClient.core.getBlockNumber();
      fromBlock = Math.max(0, latestBlock - 1000).toString();
    }

    // Get transaction history for the contract
    const transfers = await alchemyClient.core.getAssetTransfers({
      fromAddress: creatorAddress,
      toAddress: contractAddress,
      fromBlock,
      toBlock,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155,
      ],
      withMetadata: true,
    });

    // Get contract creation info if creator address provided
    let contractInfo = null;
    if (creatorAddress) {
      try {
        const code = await alchemyClient.core.getCode(contractAddress);
        contractInfo = {
          hasCode: code !== '0x',
          creator: creatorAddress,
        };
      } catch (error) {
        contractInfo = { hasCode: false, creator: creatorAddress };
      }
    }

    // Calculate transaction analytics
    const totalTransactions = transfers.transfers.length;
    const uniqueUsers = new Set(transfers.transfers.map((tx) => tx.from)).size;

    let totalGasUsed = 0;
    const transactionDetails = [];

    if (includeTxDetails) {
      for (const transfer of transfers.transfers) {
        if (transfer.hash) {
          try {
            const receipt = await alchemyClient.core.getTransactionReceipt(
              transfer.hash
            );
            if (!receipt) continue;

            const gasUsed = parseInt(receipt.gasUsed.toString());
            const effectiveGasPrice = parseInt(
              receipt.effectiveGasPrice?.toString() || '0'
            );
            totalGasUsed += gasUsed;

            transactionDetails.push({
              hash: transfer.hash,
              from: transfer.from,
              to: transfer.to,
              value: transfer.value,
              gasUsed,
              effectiveGasPrice,
              gasFee: (gasUsed * effectiveGasPrice).toString(),
              blockNumber: transfer.blockNum,
            });
          } catch (error) {
            continue;
          }
        }
      }
    }

    const analytics = {
      contractAddress,
      creatorAddress,
      blockRange: {
        fromBlock,
        toBlock,
      },
      contractInfo,
      gasbackInfo: gasbackData,
      creatorMetrics: {
        totalTransactions,
        uniqueUsers,
        totalGasUsed,
        averageGasPerTx:
          totalTransactions > 0
            ? Math.round(totalGasUsed / totalTransactions)
            : 0,
      },
      recentActivity: transfers.transfers.slice(-10).map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        asset: tx.asset,
        category: tx.category,
        blockNumber: tx.blockNum,
      })),
      ...(includeTxDetails && {
        detailedTransactions: transactionDetails.slice(-20),
        note: "Gasback earnings are now sourced directly from Shape's gasback contract for accuracy",
      }),
    };

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
          text: `Error analyzing Shape creator metrics: ${
            error instanceof Error ? error.message : 'Unknown error occurred'
          }`,
        },
      ],
    };
  }
}
