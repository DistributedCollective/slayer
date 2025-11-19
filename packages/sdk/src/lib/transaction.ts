import {
  encodeFunctionData,
  PublicClient,
  Transport,
  type Account,
  type Address,
  type Chain,
  type SignMessageParameters,
  type SignTransactionParameters,
  type SignTypedDataParameters,
} from 'viem';
import { toAddress } from './helpers.js';

export interface SdkTransactionRequest<
  chain extends Chain = any,
  account extends Account = any,
> {
  // A unique identifier for the transaction request
  id: string;
  // A human-readable title for the transaction request
  title: string;
  // A detailed description of the transaction request
  description: string;
  // The actual request data, which can be a message, typed data, or transaction
  request: SdkRequest<chain, account>;
}

export type SdkRequest<
  chain extends Chain = any,
  account extends Account = any,
> =
  | {
      type: 'message';
      data: SignMessageParameters<account>;
    }
  | {
      type: 'typed_data';
      data: SignTypedDataParameters;
    }
  | {
      type: 'transaction';
      data: SignTransactionParameters<chain, account>;
    };

export function isTransactionRequest<
  chain extends Chain = any,
  account extends Account = any,
>(
  tx: SdkTransactionRequest<chain, account>,
): tx is SdkTransactionRequest<chain, account> & {
  request: {
    type: 'transaction';
    data: SignTransactionParameters<chain, account>;
  };
} {
  return tx.request.type === 'transaction';
}

export function isMessageRequest<
  chain extends Chain = any,
  account extends Account = any,
>(
  tx: SdkTransactionRequest<chain, account>,
): tx is SdkTransactionRequest<chain, account> & {
  request: {
    type: 'message';
    data: SignMessageParameters<account>;
  };
} {
  return tx.request.type === 'message';
}

export function isTypedDataRequest<
  chain extends Chain = any,
  account extends Account = any,
>(
  tx: SdkTransactionRequest<chain, account>,
): tx is SdkTransactionRequest<chain, account> & {
  request: {
    type: 'typed_data';
    data: SignTypedDataParameters;
  };
} {
  return tx.request.type === 'typed_data';
}

export function makeTransactionRequest<
  chain extends Chain = any,
  account extends Account = any,
>(tx: SignTransactionParameters<chain, account>): SdkRequest<chain, account> {
  return {
    type: 'transaction',
    data: tx,
  };
}

export function makeMessageRequest<
  chain extends Chain = any,
  account extends Account = any,
>(msg: SignMessageParameters): SdkRequest<chain, account> {
  return {
    type: 'message',
    data: msg,
  };
}

export function makeTypedDataRequest<
  chain extends Chain = any,
  account extends Account = any,
>(typedData: SignTypedDataParameters): SdkRequest<chain, account> {
  return {
    type: 'typed_data',
    data: typedData,
  };
}

type ApprovalTransaction<chain extends Chain> = {
  token: Address;
  spender: Address;
  amount: bigint;
  account: Address;
  client: PublicClient<Transport, chain>;
};

export async function makeApprovalTransaction<
  chain extends Chain = any,
  account extends Account = any,
>(opt: ApprovalTransaction<chain>): Promise<SdkRequest<chain, account> | null> {
  const approvedAmount = await opt.client.readContract({
    address: opt.token,
    abi: [
      {
        type: 'function',
        name: 'allowance',
        stateMutability: 'view',
        inputs: [
          { type: 'address', name: 'owner' },
          { type: 'address', name: 'spender' },
        ],
        outputs: [{ type: 'uint256' }],
      },
    ],
    functionName: 'allowance',
    args: [opt.account, opt.spender],
    account: toAddress(opt.account),
  });

  if (approvedAmount >= opt.amount) {
    return null;
  }

  return {
    type: 'transaction',
    data: {
      to: opt.token as Address,
      value: 0n,
      chain: opt.client.chain,
      account: toAddress(opt.account),
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'approve',
            stateMutability: 'nonpayable',
            inputs: [
              { type: 'address', name: 'spender' },
              { type: 'uint256', name: 'amount' },
            ],
            outputs: [{ type: 'bool' }],
          },
        ],
        functionName: 'approve',
        args: [opt.spender, opt.amount],
      }),
    },
  };
}
