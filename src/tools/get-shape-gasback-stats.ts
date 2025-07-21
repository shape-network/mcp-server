import { getContract } from 'viem';
import { type InferSchema } from 'xmcp';
import { z } from 'zod';
import { abi as gasbackAbi } from '../abi/gasback';
import { addresses } from '../addresses';
import { rpcClient } from '../clients';
import { config } from '../config';

export const schema = {
  includeSampleData: z
    .boolean()
    .optional()
    .default(true)
    .describe('Include sample data like top contracts and recent activity'),
};

export const metadata = {
  name: 'getShapeGasbackStats',
  description:
    'Get comprehensive Shape gasback ecosystem statistics including total earnings, token distribution, and network insights',
  annotations: {
    title: 'Shape Gasback Ecosystem Stats',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getShapeGasbackStats({
  includeSampleData = true,
}: InferSchema<typeof schema>) {
  try {
    const gasbackContract = getContract({
      address: addresses.gasback[config.chainId],
      abi: gasbackAbi,
      client: rpcClient(),
    });

    // Get basic stats
    const totalSupply = (await gasbackContract.read.totalSupply()) as bigint;
    const totalTokens = Number(totalSupply);

    if (totalTokens === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: 'Shape gasback system has not been initialized yet',
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

    // Sample a subset of tokens for performance (sample every Nth token)
    const sampleSize = Math.min(100, totalTokens);
    const sampleInterval = Math.max(1, Math.floor(totalTokens / sampleSize));

    let totalEarningsWei = 0;
    let totalCurrentBalanceWei = 0;
    let totalWithdrawnWei = 0;
    let totalRegisteredContracts = 0;
    let activeTokens = 0;
    const uniqueOwners = new Set<string>();
    const contractEarnings = new Map<string, number>();
    const tokenEarnings: Array<{
      tokenId: string;
      owner: string;
      earned: number;
    }> = [];

    // Process sample tokens
    for (let i = 0; i < totalTokens; i += sampleInterval) {
      try {
        const tokenId = (await gasbackContract.read.tokenByIndex([
          BigInt(i),
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

        const earned = Number(totalGasback);
        const balance = Number(currentBalance);
        const withdrawn = earned - balance;

        if (earned > 0) activeTokens++;

        totalEarningsWei += earned;
        totalCurrentBalanceWei += balance;
        totalWithdrawnWei += withdrawn;
        totalRegisteredContracts += registeredContracts.length;
        uniqueOwners.add(owner.toLowerCase());

        tokenEarnings.push({
          tokenId: tokenId.toString(),
          owner: owner.toLowerCase(),
          earned,
        });

        // Track contract earnings if including sample data
        if (includeSampleData) {
          for (const contractAddress of registeredContracts) {
            try {
              const contractEarned =
                (await gasbackContract.read.getContractTotalEarned([
                  contractAddress as `0x${string}`,
                ])) as bigint;

              const currentEarnings =
                contractEarnings.get(contractAddress) || 0;
              contractEarnings.set(
                contractAddress,
                currentEarnings + Number(contractEarned)
              );
            } catch (error) {
              // Skip problematic contracts
              continue;
            }
          }
        }
      } catch (error) {
        // Skip problematic tokens
        continue;
      }
    }

    // Scale up the sampled data to estimate total ecosystem stats
    const scaleFactor = totalTokens / sampleSize;
    const estimatedTotalEarnings = totalEarningsWei * scaleFactor;
    const estimatedTotalBalance = totalCurrentBalanceWei * scaleFactor;
    const estimatedTotalWithdrawn = totalWithdrawnWei * scaleFactor;
    const estimatedTotalContracts = totalRegisteredContracts * scaleFactor;

    // Calculate distributions
    tokenEarnings.sort((a, b) => b.earned - a.earned);
    const topTokens = tokenEarnings.slice(0, 10);

    const earningsDistribution = tokenEarnings
      .map((t) => t.earned)
      .sort((a, b) => b - a);
    const medianEarnings =
      earningsDistribution.length > 0
        ? earningsDistribution[Math.floor(earningsDistribution.length / 2)]
        : 0;
    const p90Earnings =
      earningsDistribution.length > 0
        ? earningsDistribution[Math.floor(earningsDistribution.length * 0.1)]
        : 0;
    const p95Earnings =
      earningsDistribution.length > 0
        ? earningsDistribution[Math.floor(earningsDistribution.length * 0.05)]
        : 0;

    // Top contracts by earnings
    const topContracts = includeSampleData
      ? Array.from(contractEarnings.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([address, earnings]) => ({
            contractAddress: address,
            totalEarnedWei: earnings.toString(),
            totalEarnedETH: (earnings / 1e18).toFixed(6),
          }))
      : [];

    const stats = {
      ecosystem: {
        totalTokens,
        sampledTokens: sampleSize,
        sampleCoverage: `${((sampleSize / totalTokens) * 100).toFixed(1)}%`,
        uniqueOwners: uniqueOwners.size,
        estimatedTotalOwners: Math.round(uniqueOwners.size * scaleFactor),
        activeTokens: Math.round(activeTokens * scaleFactor),
        activeTokenPercentage:
          totalTokens > 0
            ? ((activeTokens / sampleSize) * 100).toFixed(1) + '%'
            : '0%',
      },
      earnings: {
        estimatedTotalEarnedWei: Math.round(estimatedTotalEarnings).toString(),
        estimatedTotalEarnedETH: (estimatedTotalEarnings / 1e18).toFixed(6),
        estimatedCurrentBalanceWei: Math.round(
          estimatedTotalBalance
        ).toString(),
        estimatedCurrentBalanceETH: (estimatedTotalBalance / 1e18).toFixed(6),
        estimatedTotalWithdrawnWei: Math.round(
          estimatedTotalWithdrawn
        ).toString(),
        estimatedTotalWithdrawnETH: (estimatedTotalWithdrawn / 1e18).toFixed(6),
        withdrawalRate:
          estimatedTotalEarnings > 0
            ? (
                (estimatedTotalWithdrawn / estimatedTotalEarnings) *
                100
              ).toFixed(1) + '%'
            : '0%',
      },
      distribution: {
        medianEarningsWei: medianEarnings.toString(),
        medianEarningsETH: (medianEarnings / 1e18).toFixed(6),
        top10PercentileWei: p90Earnings.toString(),
        top10PercentileETH: (p90Earnings / 1e18).toFixed(6),
        top5PercentileWei: p95Earnings.toString(),
        top5PercentileETH: (p95Earnings / 1e18).toFixed(6),
        averageEarningsPerTokenWei:
          totalTokens > 0
            ? Math.round(estimatedTotalEarnings / totalTokens).toString()
            : '0',
        averageEarningsPerTokenETH:
          totalTokens > 0
            ? (estimatedTotalEarnings / totalTokens / 1e18).toFixed(6)
            : '0',
      },
      contracts: {
        estimatedTotalRegisteredContracts: Math.round(estimatedTotalContracts),
        averageContractsPerToken:
          sampleSize > 0
            ? (totalRegisteredContracts / sampleSize).toFixed(2)
            : '0',
        sampledUniqueContracts: contractEarnings.size,
      },
      ...(includeSampleData && {
        samples: {
          topTokensByEarnings: topTokens.map((t) => ({
            tokenId: t.tokenId,
            owner: t.owner,
            totalEarnedWei: t.earned.toString(),
            totalEarnedETH: (t.earned / 1e18).toFixed(6),
          })),
          topContractsByEarnings: topContracts,
        },
      }),
      metadata: {
        gasbackContractAddress: addresses.gasback[config.chainId],
        chainId: config.chainId,
        dataNote: 'Estimates based on statistical sampling of tokens',
        timestamp: new Date().toISOString(),
      },
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2),
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
              message: `Error fetching Shape gasback ecosystem stats: ${
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
