import type {
  Account,
  Chain,
  SignMessageParameters,
  SignTransactionParameters,
  SignTypedDataParameters,
} from 'viem';

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
      data: SignMessageParameters;
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
    data: SignMessageParameters;
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
