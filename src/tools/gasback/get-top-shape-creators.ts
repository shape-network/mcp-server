import { Address, formatEther, getContract } from 'viem';
import { abi as gasbackAbi } from '../../abi/gasback';
import { addresses } from '../../addresses';
import { mainnetRpcClient, rpcClient } from '../../clients';
import { config } from '../../config';
import type { TopShapeCreatorsOutput, ToolErrorOutput } from '../../types';
import { getCached, setCached } from '../../utils/cache';

export const schema = {};

export const metadata = {
  name: 'getTopShapeCreators',
  description: 'Get Shape top creators by gasback earnings.',
  annotations: {
    title: 'Top 15 Shape Creators by Gasback',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'gasback-analysis',
    educationalHint: true,
    chainableWith: ['getShapeCreatorAnalytics', 'simulateGasbackRewards'],
    cacheTTL: 60 * 10, // 10 minutes
  },
};

export default async function getTopShapeCreators() {
  const cacheKey = `mcp:topShapeCreators:${config.chainId}`;
  const cached = await getCached(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

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
      const response = {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };

      await setCached(cacheKey, JSON.stringify(response), metadata.annotations.cacheTTL);

      return response;
    }

    const ownerCalls = [];
    for (let tokenId = 1; tokenId <= totalTokens; tokenId++) {
      ownerCalls.push({
        address: addresses.gasback[config.chainId],
        abi: gasbackAbi,
        functionName: 'ownerOf' as const,
        args: [BigInt(tokenId)],
      });
    }

    const batchSize = 100;
    const ownerResults = [];

    for (let i = 0; i < ownerCalls.length; i += batchSize) {
      const batch = ownerCalls.slice(i, i + batchSize);
      try {
        const batchResults = await rpcClient().multicall({
          contracts: batch,
          allowFailure: true,
        });
        ownerResults.push(...batchResults);
      } catch (error) {
        console.error(error);
        ownerResults.push(...new Array(batch.length).fill({ status: 'failure' }));
      }
    }

    const tokenOwners = new Map<number, Address>();
    ownerResults.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        tokenOwners.set(index + 1, result.result);
      }
    });

    if (tokenOwners.size === 0) {
      const response = {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };

      await setCached(cacheKey, JSON.stringify(response), metadata.annotations.cacheTTL);

      return response;
    }

    const analyticsCalls = [];
    for (const tokenId of tokenOwners.keys()) {
      analyticsCalls.push(
        {
          address: addresses.gasback[config.chainId],
          abi: gasbackAbi,
          functionName: 'getTokenTotalGasback' as const,
          args: [BigInt(tokenId)],
        },
        {
          address: addresses.gasback[config.chainId],
          abi: gasbackAbi,
          functionName: 'getTokenGasbackBalance' as const,
          args: [BigInt(tokenId)],
        },
        {
          address: addresses.gasback[config.chainId],
          abi: gasbackAbi,
          functionName: 'getTokenRegisteredContracts' as const,
          args: [BigInt(tokenId)],
        }
      );
    }

    const analyticsResults = [];
    for (let i = 0; i < analyticsCalls.length; i += batchSize) {
      const batch = analyticsCalls.slice(i, i + batchSize);
      try {
        const batchResults = await rpcClient().multicall({
          contracts: batch,
          allowFailure: true,
        });
        analyticsResults.push(...batchResults);
      } catch (error) {
        console.error(error);
        analyticsResults.push(...new Array(batch.length).fill({ status: 'failure' }));
      }
    }

    const creatorStats = new Map<
      string,
      {
        address: Address;
        ensName: string | null;
        totalGasbackEarnedWei: bigint;
        currentBalanceWei: bigint;
        registeredContracts: number;
      }
    >();

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
          const rpc = mainnetRpcClient();
          const ens = await rpc.getEnsName({ address: owner });
          creatorStats.set(owner, {
            address: owner,
            ensName: ens,
            totalGasbackEarnedWei: BigInt(0),
            currentBalanceWei: BigInt(0),
            registeredContracts: 0,
          });
        }

        const stats = creatorStats.get(owner)!;
        stats.totalGasbackEarnedWei += totalGasbackResult.result as bigint;
        stats.currentBalanceWei += currentBalanceResult.result as bigint;
        stats.registeredContracts += (registeredContractsResult.result as string[]).length;
      }
    }

    const topCreators = Array.from(creatorStats.values())
      .map((stats) => ({
        address: stats.address,
        ensName: stats.ensName,
        totalGasbackEarnedETH: Number(formatEther(stats.totalGasbackEarnedWei)),
        currentBalanceETH: Number(formatEther(stats.currentBalanceWei)),
        registeredContracts: stats.registeredContracts,
      }))
      .sort((a, b) => b.totalGasbackEarnedETH - a.totalGasbackEarnedETH)
      .slice(0, 15);

    result.totalCreatorsAnalyzed = creatorStats.size;
    result.topCreators = topCreators;

    const response = {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };

    await setCached(cacheKey, JSON.stringify(response), metadata.annotations.cacheTTL);

    return response;
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
