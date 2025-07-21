import { getContract } from 'viem';
import { type InferSchema } from 'xmcp';
import { z } from 'zod';
import { abi as gasbackAbi } from '../abi/gasback';
import { addresses } from '../addresses';
import { rpcClient } from '../clients';
import { config } from '../config';

export const schema = {
  creatorAddress: z
    .string()
    .describe('The creator/owner address to analyze gasback data for'),
};

export const metadata = {
  name: 'getShapeCreatorAnalytics',
  description:
    'Get comprehensive gasback analytics for a Shape creator including total earnings, token count, and registered contracts',
  annotations: {
    title: 'Shape Creator Gasback Analytics',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getShapeCreatorAnalytics({
  creatorAddress,
}: InferSchema<typeof schema>) {
  try {
    const gasbackContract = getContract({
      address: addresses.gasback[config.chainId],
      abi: gasbackAbi,
      client: rpcClient(),
    });

    // Get all tokens owned by this creator
    const ownedTokens = (await gasbackContract.read.getOwnedTokens([
      creatorAddress as `0x${string}`,
    ])) as bigint[];

    if (ownedTokens.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                creatorAddress,
                hasTokens: false,
                message: 'Creator has no gasback tokens',
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Get detailed data for each token
    const tokenDetails = [];
    let totalGasbackEarned = 0;
    let totalCurrentBalance = 0;
    let totalRegisteredContracts = 0;
    const allContracts = new Set<string>();

    for (const tokenId of ownedTokens) {
      const [tokenData, totalGasback, currentBalance, registeredContracts] =
        await Promise.all([
          gasbackContract.read.getTokenData([tokenId]) as Promise<{
            balance: bigint;
            registeredContracts: string[];
          }>,
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

      const tokenTotalEarned = Number(totalGasback);
      const tokenCurrentBalance = Number(currentBalance);

      totalGasbackEarned += tokenTotalEarned;
      totalCurrentBalance += tokenCurrentBalance;
      totalRegisteredContracts += registeredContracts.length;

      registeredContracts.forEach((contract) => allContracts.add(contract));

      tokenDetails.push({
        tokenId: tokenId.toString(),
        totalEarnedWei: totalGasback.toString(),
        totalEarnedETH: (tokenTotalEarned / 1e18).toFixed(6),
        currentBalanceWei: currentBalance.toString(),
        currentBalanceETH: (tokenCurrentBalance / 1e18).toFixed(6),
        registeredContractsCount: registeredContracts.length,
        registeredContracts: registeredContracts,
        withdrawnAmount: tokenTotalEarned - tokenCurrentBalance,
        withdrawnAmountETH: (
          (tokenTotalEarned - tokenCurrentBalance) /
          1e18
        ).toFixed(6),
      });
    }

    // Get contract-specific earnings for all registered contracts
    const contractEarnings = [];
    for (const contractAddress of allContracts) {
      try {
        const contractTotalEarned =
          (await gasbackContract.read.getContractTotalEarned([
            contractAddress as `0x${string}`,
          ])) as bigint;

        const contractData = (await gasbackContract.read.getContractData([
          contractAddress as `0x${string}`,
        ])) as {
          tokenId: bigint;
          balanceUpdatedBlock: bigint;
          totalEarned: bigint;
        };

        contractEarnings.push({
          contractAddress,
          tokenId: contractData.tokenId.toString(),
          totalEarnedWei: contractTotalEarned.toString(),
          totalEarnedETH: (Number(contractTotalEarned) / 1e18).toFixed(6),
          balanceUpdatedBlock: contractData.balanceUpdatedBlock.toString(),
        });
      } catch (error) {
        // Contract might not be properly registered, skip
        continue;
      }
    }

    const analytics = {
      creatorAddress,
      summary: {
        totalTokens: ownedTokens.length,
        totalRegisteredContracts,
        uniqueContracts: allContracts.size,
        totalGasbackEarnedWei: totalGasbackEarned.toString(),
        totalGasbackEarnedETH: (totalGasbackEarned / 1e18).toFixed(6),
        totalCurrentBalanceWei: totalCurrentBalance.toString(),
        totalCurrentBalanceETH: (totalCurrentBalance / 1e18).toFixed(6),
        totalWithdrawnWei: (
          totalGasbackEarned - totalCurrentBalance
        ).toString(),
        totalWithdrawnETH: (
          (totalGasbackEarned - totalCurrentBalance) /
          1e18
        ).toFixed(6),
        averageEarningsPerToken:
          ownedTokens.length > 0
            ? (totalGasbackEarned / ownedTokens.length / 1e18).toFixed(6)
            : '0',
        averageEarningsPerContract:
          allContracts.size > 0
            ? (totalGasbackEarned / allContracts.size / 1e18).toFixed(6)
            : '0',
      },
      tokens: tokenDetails.sort(
        (a, b) => Number(b.totalEarnedWei) - Number(a.totalEarnedWei)
      ),
      contractEarnings: contractEarnings.sort(
        (a, b) => Number(b.totalEarnedWei) - Number(a.totalEarnedWei)
      ),
      timestamp: new Date().toISOString(),
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
          text: JSON.stringify(
            {
              error: true,
              message: `Error analyzing creator gasback data: ${
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred'
              }`,
              creatorAddress,
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
