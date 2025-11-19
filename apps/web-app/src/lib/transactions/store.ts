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

export type TxHandlers = {
  // can be used to modify the tx request before signing/sending
  onBeforeSign?: (
    tx: SlayerTx,
    /** All transactions in the queue */
    items: SlayerTx[],
  ) => Promise<SlayerTx['request']['data']>;
  // can be used to handle the response after signing/sending of the particular tx
  onAfterSign?: (tx: SlayerTx, res: SlayerTx['res'], next: SlayerTx[]) => void;
  // called when a transaction is successfully processed
  onSuccess?: (tx: SlayerTx, res: SlayerTx['res']) => void;
  // called when an error occurs during processing of a tx
  onError?: (tx: SlayerTx, message: string, error: unknown) => void;
  // called when all transactions are completed
  onCompleted?: (count: number) => void;
  // called when tx modals are closed by user. Returns true if all transactions were successful, false when txes were aborted.
  onClosed?: (withSuccess: boolean) => void;
};

type State = {
  isCompleted: boolean;
  isFetching: boolean;
  isClosing: boolean;
  isReady: boolean;
  items: SlayerTx[];
  handlers: TxHandlers;
};

type Actions = {
  setIsFetching: (isFetching: boolean) => void;
  setIsCompleted: (isCompleted: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItems: (items: SdkTransactionRequest<any, any>[]) => void;
  updateItemState: (id: string, state: TxState) => void;
  updateItem: (
    id: string,
    state: TxState,
    res: Partial<TransactionReceipt> | undefined,
  ) => void;
  setItemError: (id: string, error: string) => void;
  setHandlers: (handlers: TxHandlers) => void;
  reset: () => void;
};

type Store = State & Actions;

export const txStore = createStore<Store>(
  combine(
    {
      isCompleted: false,
      isFetching: false,
      isClosing: false,
      isReady: false,
      items: [] as SlayerTx[],
      handlers: {},
    },
    (set) => ({
      setIsFetching: (isFetching: boolean) =>
        set({ isFetching, isClosing: false, isReady: false }),
      setIsCompleted: (isCompleted: boolean) => set({ isCompleted }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setItems: (items: SdkTransactionRequest<any, any>[]) =>
        set({
          items: items.map(toTx),
          isCompleted: false,
          isFetching: false,
          isReady: true,
          isClosing: false,
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
          ...state,
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, state: TRANSACTION_STATE.error, error }
              : item,
          ),
        })),
      reset: () =>
        set({
          isFetching: false,
          isClosing: true,
          items: [],
          handlers: {},
        }),
      setHandlers: (handlers: TxHandlers) =>
        set({
          handlers,
        }),
    }),
  ),
);

const toTx = (item: SdkTransactionRequest): SlayerTx => ({
  ...item,
  state: TRANSACTION_STATE.idle,
  res: undefined,
});
