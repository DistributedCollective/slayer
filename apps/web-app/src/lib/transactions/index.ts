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
    async (waitFor: () => Promise<SdkTransactionRequest<chain, account>[]>) => {
      setIsFetching(true);
      if (waitFor) {
        const txs = await waitFor();
        setItems(txs);
        setHandlers(handlers);
        return new Promise<boolean>((resolve) => {
          const originalOnClosed = handlers.onClosed;
          handlers.onClosed = (withSuccess: boolean) => {
            if (originalOnClosed) {
              originalOnClosed(withSuccess);
            }
            resolve(withSuccess);
          };
        });
      }

      return Promise.resolve(false);
    },
    [setIsFetching, setItems, setHandlers, handlers],
  );

  useEffect(() => {
    return () => reset();
  }, [reset]);

  return { begin, abort: reset };
};
