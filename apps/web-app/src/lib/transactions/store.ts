import type { SdkTransactionRequest } from 'node_modules/@sovryn/slayer-sdk/src/lib/transaction';
import { createStore } from 'zustand';
import { combine } from 'zustand/middleware';

export type SlayerTx = SdkTransactionRequest & { res: unknown };

type State = {
  isFetching: boolean;
  isReady: boolean;
  items: SlayerTx[];
};

type Actions = {
  setIsFetching: (isFetching: boolean) => void;
  setItems: (items: SdkTransactionRequest<AnyValue, AnyValue>[]) => void;
  reset: () => void;
};

type Store = State & Actions;

export const txStore = createStore<Store>(
  combine(
    {
      isFetching: false,
      isReady: false,
      items: [] as SlayerTx[],
    },
    (set) => ({
      setIsFetching: (isFetching: boolean) => set({ isFetching }),
      setItems: (items: SdkTransactionRequest<AnyValue, AnyValue>[]) =>
        set({
          items: items.map(toTx),
          isFetching: false,
          isReady: true,
        }),
      reset: () =>
        set({
          isFetching: false,
          isReady: false,
          items: [],
        }),
    }),
  ),
);

const toTx = (item: SdkTransactionRequest): SlayerTx => ({
  ...item,
  res: undefined,
});
