import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { rpcClient } from '../../clients';
import type { GasbackSimulationOutput, ToolErrorOutput } from '../../types';

export const schema = {
  contractAddress: z
    .string()
    .describe('The contract address to simulate Gasback for'),
  hypotheticalTxs: z
    .number()
    .default(100)
    .describe('Number of hypothetical user transactions'),
  avgGasPerTx: z
    .number()
    .default(100000)
    .describe('Average gas used per transaction'),
};

export const metadata = {
  name: 'simulateGasbackEarnings',
  description:
    'Simulate potential Gasback earnings for a creator based on hypothetical user interactions (80% rebate model)',
  annotations: {
    title: 'Gasback Earnings Simulator',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    simulation: true,
  },
};

export default async function simulateGasbackEarnings({
  contractAddress,
  hypotheticalTxs,
  avgGasPerTx,
}: InferSchema<typeof schema>) {
  try {
    const rpc = rpcClient();
    const currentGasPrice = await rpc.getGasPrice();

    const totalGasSpent =
      BigInt(hypotheticalTxs) * BigInt(avgGasPerTx) * currentGasPrice;
    const rebateRate = 0.8;
    const estimatedEarningsWei =
      (totalGasSpent * BigInt(Math.floor(rebateRate * 1e18))) / BigInt(1e18);
    const estimatedEarningsETH = Number(estimatedEarningsWei) / 1e18;

    const result: GasbackSimulationOutput = {
      contractAddress,
      timestamp: new Date().toISOString(),
      hypotheticalTxs,
      avgGasPerTx,
      currentGasPriceWei: Number(currentGasPrice),
      estimatedEarningsETH: parseFloat(estimatedEarningsETH.toFixed(6)),
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
    const errorOutput: ToolErrorOutput = {
      error: true,
      message: `Error simulating Gasback: ${
        error instanceof Error ? error.message : 'Unknown error'
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
