import type { SdkTransactionRequest } from '@sovryn/slayer-sdk';
import { useCallback, useEffect } from 'react';
import type { Account, Chain } from 'viem';
import { useStore } from 'zustand';
import { txStore, type TxHandlers } from './store';

export const useSlayerTx = <chain extends Chain, account extends Account>(
  handlers: TxHandlers = {},
) => {
  const { setItems, setIsFetching, reset, setHandlers } = useStore(txStore);

  const begin = useCallback(
    async (
      waitFor?: () => Promise<SdkTransactionRequest<chain, account>[]>,
    ) => {
      setIsFetching(true);
      if (waitFor) {
        const txs = await waitFor();
        setItems(txs);
        setHandlers(handlers);
      }
      // const result = await send();
      // return result;
    },
    [setIsFetching, setItems, setHandlers, handlers],
  );

  useEffect(() => {
    return () => reset();
  }, [reset]);

  return { begin, abort: reset };
};
