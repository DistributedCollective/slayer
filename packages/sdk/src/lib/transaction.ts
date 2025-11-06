import type {
  Account,
  Chain,
  SignMessageParameters,
  SignTransactionParameters,
  SignTypedDataParameters,
} from 'viem';

export interface SdkTransactionRequest<
  chain extends Chain = Chain,
  account extends Account = Account,
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
  chain extends Chain = Chain,
  account extends Account = Account,
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
