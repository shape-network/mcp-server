import { getContract } from 'viem';
import { type InferSchema } from 'xmcp';
import { z } from 'zod';
import { abi as gasbackAbi } from '../abi/gasback';
import { addresses } from '../addresses';
import { rpcClient } from '../clients';
import { config } from '../config';

export const schema = {
  limit: z
    .number()
    .optional()
    .default(50)
    .describe('Number of top creators to return (default: 50, max: 100)'),
  includeContractDetails: z
    .boolean()
    .optional()
    .default(false)
    .describe('Include detailed contract information for each creator'),
};

export const metadata = {
  name: 'getTopShapeCreators',
  description:
    'Get the top creators on Shape by gasback earnings, with comprehensive stats including token counts and contract details',
  annotations: {
    title: 'Top Shape Creators by Gasback',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

type CreatorStats = {
  address: string;
  totalTokens: number;
  totalEarnedWei: string;
  totalEarnedETH: string;
  currentBalanceWei: string;
  currentBalanceETH: string;
  totalWithdrawnWei: string;
  totalWithdrawnETH: string;
  totalRegisteredContracts: number;
  averagePerToken: string;
  averagePerContract: string;
  contractDetails?: Array<{
    contractAddress: string;
    tokenId: string;
    totalEarnedWei: string;
    totalEarnedETH: string;
  }>;
};

export default async function getTopShapeCreators({
  limit = 50,
  includeContractDetails = false,
}: InferSchema<typeof schema>) {
  try {
    const gasbackContract = getContract({
      address: addresses.gasback[config.chainId],
      abi: gasbackAbi,
      client: rpcClient(),
    });

    // Ensure limit is reasonable
    const finalLimit = Math.min(Math.max(1, limit), 100);

    // Get total number of tokens to enumerate
    const totalSupply = (await gasbackContract.read.totalSupply()) as bigint;
    const totalTokens = Number(totalSupply);

    if (totalTokens === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: 'No gasback tokens exist yet',
                totalTokens: 0,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Map to aggregate creator stats
    const creatorStats = new Map<string, CreatorStats>();

    // Process tokens in batches to avoid overwhelming the RPC
    const batchSize = 50;
    for (let i = 0; i < totalTokens; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, totalTokens);
      const tokenPromises = [];

      for (let tokenIndex = i; tokenIndex < batchEnd; tokenIndex++) {
        tokenPromises.push(
          (async () => {
            try {
              const tokenId = (await gasbackContract.read.tokenByIndex([
                BigInt(tokenIndex),
              ])) as bigint;

              const [owner, totalGasback, currentBalance, registeredContracts] =
                await Promise.all([
                  gasbackContract.read.ownerOf([tokenId]) as Promise<string>,
                  gasbackContract.read.getTokenTotalGasback([
                    tokenId,
                  ]) as Promise<bigint>,
                  gasbackContract.read.getTokenGasbackBalance([
                    tokenId,
                  ]) as Promise<bigint>,
                  gasbackContract.read.getTokenRegisteredContracts([
                    tokenId,
                  ]) as Promise<string[]>,
                ]);

              return {
                tokenId,
                owner: owner.toLowerCase(),
                totalGasback: Number(totalGasback),
                currentBalance: Number(currentBalance),
                registeredContracts,
              };
            } catch (error) {
              // Skip tokens that might have issues
              return null;
            }
          })()
        );
      }

      const batchResults = await Promise.all(tokenPromises);

      // Process batch results
      for (const result of batchResults) {
        if (!result) continue;

        const {
          tokenId,
          owner,
          totalGasback,
          currentBalance,
          registeredContracts,
        } = result;
        const withdrawn = totalGasback - currentBalance;

        if (!creatorStats.has(owner)) {
          creatorStats.set(owner, {
            address: owner,
            totalTokens: 0,
            totalEarnedWei: '0',
            totalEarnedETH: '0',
            currentBalanceWei: '0',
            currentBalanceETH: '0',
            totalWithdrawnWei: '0',
            totalWithdrawnETH: '0',
            totalRegisteredContracts: 0,
            averagePerToken: '0',
            averagePerContract: '0',
            ...(includeContractDetails && { contractDetails: [] }),
          });
        }

        const stats = creatorStats.get(owner)!;
        const prevTotalEarned = Number(stats.totalEarnedWei);
        const prevCurrentBalance = Number(stats.currentBalanceWei);
        const prevWithdrawn = Number(stats.totalWithdrawnWei);

        stats.totalTokens += 1;
        stats.totalEarnedWei = (prevTotalEarned + totalGasback).toString();
        stats.totalEarnedETH = (
          (prevTotalEarned + totalGasback) /
          1e18
        ).toFixed(6);
        stats.currentBalanceWei = (
          prevCurrentBalance + currentBalance
        ).toString();
        stats.currentBalanceETH = (
          (prevCurrentBalance + currentBalance) /
          1e18
        ).toFixed(6);
        stats.totalWithdrawnWei = (prevWithdrawn + withdrawn).toString();
        stats.totalWithdrawnETH = ((prevWithdrawn + withdrawn) / 1e18).toFixed(
          6
        );
        stats.totalRegisteredContracts += registeredContracts.length;

        // Calculate averages
        const newTotalEarned = prevTotalEarned + totalGasback;
        stats.averagePerToken = (
          newTotalEarned /
          stats.totalTokens /
          1e18
        ).toFixed(6);
        stats.averagePerContract =
          stats.totalRegisteredContracts > 0
            ? (newTotalEarned / stats.totalRegisteredContracts / 1e18).toFixed(
                6
              )
            : '0';

        // Add contract details if requested
        if (includeContractDetails && registeredContracts.length > 0) {
          for (const contractAddress of registeredContracts) {
            try {
              const contractTotalEarned =
                (await gasbackContract.read.getContractTotalEarned([
                  contractAddress as `0x${string}`,
                ])) as bigint;

              stats.contractDetails!.push({
                contractAddress,
                tokenId: tokenId.toString(),
                totalEarnedWei: contractTotalEarned.toString(),
                totalEarnedETH: (Number(contractTotalEarned) / 1e18).toFixed(6),
              });
            } catch (error) {
              // Skip contracts that might have issues
              continue;
            }
          }
        }
      }
    }

    // Sort creators by total earnings and take top N
    const sortedCreators = Array.from(creatorStats.values())
      .sort((a, b) => Number(b.totalEarnedWei) - Number(a.totalEarnedWei))
      .slice(0, finalLimit);

    // Calculate some global stats
    const allCreators = Array.from(creatorStats.values());
    const totalCreators = allCreators.length;
    const totalEarningsAllCreators = allCreators.reduce(
      (sum, creator) => sum + Number(creator.totalEarnedWei),
      0
    );
    const totalContractsAllCreators = allCreators.reduce(
      (sum, creator) => sum + creator.totalRegisteredContracts,
      0
    );

    // Sort contract details within each creator if included
    if (includeContractDetails) {
      sortedCreators.forEach((creator) => {
        if (creator.contractDetails) {
          creator.contractDetails.sort(
            (a, b) => Number(b.totalEarnedWei) - Number(a.totalEarnedWei)
          );
        }
      });
    }

    const result = {
      summary: {
        totalCreators,
        totalTokensScanned: totalTokens,
        totalEarningsWei: totalEarningsAllCreators.toString(),
        totalEarningsETH: (totalEarningsAllCreators / 1e18).toFixed(6),
        totalRegisteredContracts: totalContractsAllCreators,
        averageEarningsPerCreator:
          totalCreators > 0
            ? (totalEarningsAllCreators / totalCreators / 1e18).toFixed(6)
            : '0',
        topCreatorsShown: sortedCreators.length,
      },
      topCreators: sortedCreators,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: true,
              message: `Error fetching top Shape creators: ${
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred'
              }`,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
