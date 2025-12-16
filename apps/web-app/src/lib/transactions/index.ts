import type { SdkTransactionRequest } from '@sovryn/slayer-sdk';
import debug from 'debug';
import { useCallback, useEffect } from 'react';
import type { Account, Chain } from 'viem';
import { useStore } from 'zustand';
import { txStore, type TxHandlers } from './store';

const log = debug('slayer-app:useSlayerTx');

export const useSlayerTx = <chain extends Chain, account extends Account>(
  handlers: TxHandlers = {},
) => {
  const { setItems, setIsFetching, reset, setHandlers } = useStore(txStore);

  const begin = useCallback(
    async (waitFor: () => Promise<SdkTransactionRequest<chain, account>[]>) => {
      setIsFetching(true);
      log('Beginning transaction preparation...');
      if (waitFor) {
        const txs = await waitFor();
        log('Prepared transactions:', txs);
        setItems(txs);
        setHandlers(handlers);
        return new Promise<boolean>((resolve) => {
          const originalOnClosed = handlers.onClosed;
          handlers.onClosed = (withSuccess: boolean) => {
            log('Transaction modal closed with success:', withSuccess);
            if (originalOnClosed) {
              log('Calling onClosed handler with success:', withSuccess);
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
