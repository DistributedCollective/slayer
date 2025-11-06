import type { SdkTransactionRequest } from 'node_modules/@sovryn/slayer-sdk/src/lib/transaction';
import type { TransactionReceipt } from 'viem';
import { createStore } from 'zustand';
import { combine } from 'zustand/middleware';

export const txStates = {
  idle: 'idle',
  pending: 'pending',
  success: 'success',
  error: 'error',
} as const;

export type TxState = (typeof txStates)[keyof typeof txStates];

export type SlayerTx = SdkTransactionRequest & {
  state: TxState;
  res: Partial<TransactionReceipt> | undefined;
  error?: Error;
};

type State = {
  isFetching: boolean;
  isReady: boolean;
  items: SlayerTx[];
};

type Actions = {
  setIsFetching: (isFetching: boolean) => void;
  setItems: (items: SdkTransactionRequest<AnyValue, AnyValue>[]) => void;
  updateItemState: (id: string, state: TxState) => void;
  updateItem: (
    id: string,
    state: TxState,
    res: Partial<TransactionReceipt> | undefined,
  ) => void;
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
      updateItemState: (id: string, state: TxState) =>
        set((store) => ({
          items: store.items.map((item) =>
            item.id === id ? { ...item, state } : item,
          ),
        })),
      updateItem: (
        id: string,
        status: TxState,
        res: Partial<TransactionReceipt> | undefined,
      ) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, state: status, res, error: undefined }
              : item,
          ),
        })),
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
  state: txStates.idle,
  res: undefined,
});
