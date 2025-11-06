import type { SdkTransactionRequest } from 'node_modules/@sovryn/slayer-sdk/src/lib/transaction';
import type { Account, Chain } from 'viem';
import { useStore } from 'zustand';
import { txStore } from './store';

export const useSlayerTx = <
  chain extends Chain = AnyValue,
  account extends Account = AnyValue,
>() => {
  const { setItems, setIsFetching, reset } = useStore(txStore);

  const begin = async (
    waitFor?: () => Promise<SdkTransactionRequest<chain, account>[]>,
  ) => {
    setIsFetching(true);
    if (waitFor) {
      const txs = await waitFor();
      setItems(txs);
    }
    // const result = await send();
    // return result;
  };

  return { begin, abort: reset };
};
