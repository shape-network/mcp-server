import { getContract } from 'viem';
import { type InferSchema } from 'xmcp';
import { abi as gasbackAbi } from '../../abi/gasback';
import { addresses } from '../../addresses';
import { rpcClient } from '../../clients';
import { config } from '../../config';
import type { TopShapeCreatorsOutput, ToolErrorOutput } from '../../types';

export const schema = {};

export const metadata = {
  name: 'getTopShapeCreators',
  description:
    'Get the top 25 creators on Shape by gasback earnings: token count, total earned, current balance, and registered contracts',
  annotations: {
    title: 'Top 25 Shape Creators by Gasback',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getTopShapeCreators({}: InferSchema<
  typeof schema
>) {
  try {
    const gasbackContract = getContract({
      address: addresses.gasback[config.chainId],
      abi: gasbackAbi,
      client: rpcClient(),
    });

    const totalSupply = (await gasbackContract.read.totalSupply()) as bigint;
    const totalTokens = Number(totalSupply);

    const result: TopShapeCreatorsOutput = {
      timestamp: new Date().toISOString(),
      totalCreatorsAnalyzed: 0,
      topCreators: [],
    };

    if (totalTokens === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    // Batch multicall for efficiency - get all token owners first
    const ownerCalls: any[] = [];
    for (let tokenId = 1; tokenId <= totalTokens; tokenId++) {
      ownerCalls.push({
        address: addresses.gasback[config.chainId] as `0x${string}`,
        abi: gasbackAbi,
        functionName: 'ownerOf' as const,
        args: [BigInt(tokenId)],
      });
    }

    // Execute owner calls in batches to avoid RPC limits
    const batchSize = 100;
    const ownerResults: any[] = [];

    for (let i = 0; i < ownerCalls.length; i += batchSize) {
      const batch = ownerCalls.slice(i, i + batchSize);
      try {
        const batchResults = await rpcClient().multicall({
          contracts: batch,
          allowFailure: true,
        });
        ownerResults.push(...batchResults);
      } catch (error) {
        // If batch fails, add null results for this batch
        ownerResults.push(
          ...new Array(batch.length).fill({ status: 'failure' })
        );
      }
    }

    // Build token owner map
    const tokenOwners = new Map<number, string>();
    ownerResults.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        tokenOwners.set(index + 1, result.result as string);
      }
    });

    if (tokenOwners.size === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    // Batch calls for token analytics
    const analyticsCalls: any[] = [];
    for (const tokenId of tokenOwners.keys()) {
      analyticsCalls.push(
        {
          address: addresses.gasback[config.chainId] as `0x${string}`,
          abi: gasbackAbi,
          functionName: 'getTokenTotalGasback' as const,
          args: [BigInt(tokenId)],
        },
        {
          address: addresses.gasback[config.chainId] as `0x${string}`,
          abi: gasbackAbi,
          functionName: 'getTokenGasbackBalance' as const,
          args: [BigInt(tokenId)],
        },
        {
          address: addresses.gasback[config.chainId] as `0x${string}`,
          abi: gasbackAbi,
          functionName: 'getTokenRegisteredContracts' as const,
          args: [BigInt(tokenId)],
        }
      );
    }

    // Execute analytics calls in batches
    const analyticsResults: any[] = [];
    for (let i = 0; i < analyticsCalls.length; i += batchSize) {
      const batch = analyticsCalls.slice(i, i + batchSize);
      try {
        const batchResults = await rpcClient().multicall({
          contracts: batch,
          allowFailure: true,
        });
        analyticsResults.push(...batchResults);
      } catch (error) {
        analyticsResults.push(
          ...new Array(batch.length).fill({ status: 'failure' })
        );
      }
    }

    // Map to aggregate creator stats
    const creatorStats = new Map<
      string,
      {
        address: string;
        totalTokens: number;
        totalEarnedWei: bigint;
        currentBalanceWei: bigint;
        registeredContracts: number;
      }
    >();

    // Process results
    let resultIndex = 0;
    for (const tokenId of tokenOwners.keys()) {
      const owner = tokenOwners.get(tokenId)!;

      const totalGasbackResult = analyticsResults[resultIndex];
      const currentBalanceResult = analyticsResults[resultIndex + 1];
      const registeredContractsResult = analyticsResults[resultIndex + 2];
      resultIndex += 3;

      if (
        totalGasbackResult.status === 'success' &&
        currentBalanceResult.status === 'success' &&
        registeredContractsResult.status === 'success'
      ) {
        if (!creatorStats.has(owner)) {
          creatorStats.set(owner, {
            address: owner,
            totalTokens: 0,
            totalEarnedWei: BigInt(0),
            currentBalanceWei: BigInt(0),
            registeredContracts: 0,
          });
        }

        const stats = creatorStats.get(owner)!;
        stats.totalTokens += 1;
        stats.totalEarnedWei += totalGasbackResult.result as bigint;
        stats.currentBalanceWei += currentBalanceResult.result as bigint;
        stats.registeredContracts += (
          registeredContractsResult.result as string[]
        ).length;
      }
    }

    // Convert to final format and sort, limit to top 25
    const topCreators = Array.from(creatorStats.values())
      .map((stats) => ({
        address: stats.address,
        totalTokens: stats.totalTokens,
        totalEarnedETH: parseFloat(
          (Number(stats.totalEarnedWei) / 1e18).toFixed(6)
        ),
        currentBalanceETH: parseFloat(
          (Number(stats.currentBalanceWei) / 1e18).toFixed(6)
        ),
        registeredContracts: stats.registeredContracts,
      }))
      .sort((a, b) => b.totalEarnedETH - a.totalEarnedETH)
      .slice(0, 25);

    result.totalCreatorsAnalyzed = creatorStats.size;
    result.topCreators = topCreators;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorOutput: ToolErrorOutput = {
      error: true,
      message: `Error fetching top Shape creators: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }`,
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
