import type { SdkTransactionRequest } from '@sovryn/slayer-sdk';
import type { Account, Chain } from 'viem';
import { useStore } from 'zustand';
import { txStore } from './store';

export const useSlayerTx = <chain extends Chain, account extends Account>() => {
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
