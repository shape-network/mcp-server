import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { formatEther } from 'viem';
import { rpcClient } from '../../clients';
import { config } from '../../config';
import type { GasbackSimulationOutput, ToolErrorOutput } from '../../types';
import { getCached, setCached } from '../../utils/cache';

export const schema = {
  hypotheticalTxs: z.number().default(100).describe('Number of hypothetical user transactions'),
  avgGasPerTx: z
    .number()
    .default(150000)
    .describe('Average gas used per transaction (150k=NFT mint/transfer, 250k=complex DeFi)'),
};

export const metadata = {
  name: 'simulateGasbackEarnings',
  description:
    'Simulate potential Gasback earnings for a creator based on hypothetical number of transactions and average gas used per transaction.',
  annotations: {
    title: 'Gasback Simulation',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    requiresWallet: false,
    category: 'gasback-analysis',
    educationalHint: true,
    chainableWith: ['getShapeCreatorAnalytics', 'getTopShapeCreators'],
    cacheTTL: 60 * 2, // 2 minutes
  },
};

export default async function simulateGasbackEarnings({
  hypotheticalTxs,
  avgGasPerTx,
}: InferSchema<typeof schema>) {
  const cacheKey = `mcp:gasbackSimulation:${config.chainId}:${hypotheticalTxs}:${avgGasPerTx}`;
  const cached = await getCached(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const rpc = rpcClient();
    const currentGasPrice = await rpc.getGasPrice();

    const totalGasSpent = BigInt(hypotheticalTxs) * BigInt(avgGasPerTx) * currentGasPrice;
    const rebateRate = 0.8; // 80% rebate rate (dimensionless)
    const estimatedEarningsWei =
      (totalGasSpent * BigInt(Math.floor(rebateRate * 1000))) / BigInt(1000);
    const estimatedEarningsETH = parseFloat(formatEther(estimatedEarningsWei));

    const result: GasbackSimulationOutput = {
      timestamp: new Date().toISOString(),
      hypotheticalTxs,
      avgGasPerTx,
      currentGasPriceWei: Number(currentGasPrice),
      estimatedEarningsETH: parseFloat(estimatedEarningsETH.toFixed(6)),
    };

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
      message: `Error simulating Gasback: ${
        error instanceof Error ? error.message : 'Unknown error'
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
