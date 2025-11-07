import type { SdkTransactionRequest } from '@sovryn/slayer-sdk';
import type { TransactionReceipt } from 'viem';
import { createStore } from 'zustand';
import { combine } from 'zustand/middleware';

export const TRANSACTION_STATE = {
  idle: 'idle',
  pending: 'pending',
  success: 'success',
  error: 'error',
} as const;

export type TxState =
  (typeof TRANSACTION_STATE)[keyof typeof TRANSACTION_STATE];

export type SlayerTx = SdkTransactionRequest & {
  state: TxState;
  res: Partial<TransactionReceipt> | undefined;
  error?: string;
};

type State = {
  isFetching: boolean;
  isReady: boolean;
  items: SlayerTx[];
};

type Actions = {
  setIsFetching: (isFetching: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItems: (items: SdkTransactionRequest<any, any>[]) => void;
  updateItemState: (id: string, state: TxState) => void;
  updateItem: (
    id: string,
    state: TxState,
    res: Partial<TransactionReceipt> | undefined,
  ) => void;
  setItemError: (id: string, error: string) => void;
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setItems: (items: SdkTransactionRequest<any, any>[]) =>
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
      setItemError: (id: string, error: string) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, state: TRANSACTION_STATE.error, error }
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
  state: TRANSACTION_STATE.idle,
  res: undefined,
});
