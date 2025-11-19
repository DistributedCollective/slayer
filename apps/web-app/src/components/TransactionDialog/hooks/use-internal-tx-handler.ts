import {
  TRANSACTION_STATE,
  txStore,
  type TxHandlers,
} from '@/lib/transactions/store';
import {
  isMessageRequest,
  isTransactionRequest,
  isTypedDataRequest,
} from '@sovryn/slayer-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { prepareTransactionRequest } from 'viem/actions';
import {
  useConfig,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { handleErrorMessage } from '../utils';

export function useInternalTxHandler(
  props: Pick<TxHandlers, 'onError' | 'onCompleted'> = {},
) {
  const [isPreparing, setIsPreparing] = useState(false);

  const currentTx = useStoreWithEqualityFn(txStore, (state) =>
    state.items.find((t) => t.state !== TRANSACTION_STATE.success),
  );
  const pendingTxs = useStoreWithEqualityFn(txStore, (state) =>
    state.items.filter((t) => t.state !== TRANSACTION_STATE.success).slice(1),
  );

  const updateItem = useStore(txStore, (state) => state.updateItem);
  const setItemError = useStore(txStore, (state) => state.setItemError);
  const updateItemState = useStore(txStore, (state) => state.updateItemState);
  const handlers = useStore(txStore, (state) => state.handlers);

  const config = useConfig();

  const { signMessage, isPending: isSigning } = useSignMessage({
    mutation: {
      onError(error) {
        if (!currentTx) return;
        const msg = handleErrorMessage(error);
        setItemError(currentTx.id, msg);
        props.onError?.(currentTx!, msg, error);
        handlers.onError?.(currentTx!, msg, error);
      },
      onSuccess(data) {
        if (!currentTx) return;
        updateItem(currentTx.id, TRANSACTION_STATE.success, {
          transactionHash: data,
        });
        handlers.onAfterSign?.(
          currentTx,
          { transactionHash: data },
          pendingTxs,
        );
        handlers.onSuccess?.(currentTx, { transactionHash: data });
      },
    },
  });

  const { signTypedData, isPending: isSigningTypedData } = useSignTypedData({
    mutation: {
      onError(error) {
        if (!currentTx) return;
        const msg = handleErrorMessage(error);
        setItemError(currentTx?.id || '', msg);
        props.onError?.(currentTx!, msg, error);
        handlers.onError?.(currentTx!, msg, error);
      },
      onSuccess(data) {
        if (!currentTx) return;
        updateItem(currentTx?.id || '', TRANSACTION_STATE.success, {
          transactionHash: data,
        });
        handlers.onAfterSign?.(
          currentTx,
          { transactionHash: data },
          pendingTxs,
        );
        handlers.onSuccess?.(currentTx, { transactionHash: data });
      },
    },
  });

  const {
    sendTransaction,
    data: pendingTxHash,
    isPending: isSending,
  } = useSendTransaction({
    mutation: {
      onSettled(data, error) {
        if (!currentTx) return;
        if (data) {
          updateItem(currentTx.id, TRANSACTION_STATE.pending, {
            transactionHash: data,
          });
          handlers.onAfterSign?.(
            currentTx,
            { transactionHash: data },
            pendingTxs,
          );
        } else if (error) {
          const msg = handleErrorMessage(error);
          setItemError(currentTx.id, msg);
          props.onError?.(currentTx, msg, error);
          handlers.onError?.(currentTx, msg, error);
        }
      },
    },
  });

  const {
    data: receipt,
    status: receiptStatus,
    isLoading: isReceiptPending,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    chainId:
      currentTx && isTransactionRequest(currentTx)
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (currentTx.request.data.chain?.id as any)
        : undefined,
    hash:
      currentTx && isTransactionRequest(currentTx)
        ? currentTx.res?.transactionHash
        : undefined,
    onReplaced: (tx) => {
      if (!currentTx) return;
      if (tx.reason === 'cancelled') {
        updateItemState(currentTx.id, TRANSACTION_STATE.idle);
        props.onError?.(
          currentTx,
          'Transaction was cancelled',
          new Error('Transaction was cancelled'),
        );
        handlers.onError?.(
          currentTx,
          'Transaction was cancelled',
          new Error('Transaction was cancelled'),
        );
        return;
      }
      updateItem(
        currentTx.id,
        tx.transactionReceipt.status === 'success'
          ? TRANSACTION_STATE.success
          : TRANSACTION_STATE.error,
        tx.transactionReceipt,
      );
    },
  });

  useEffect(() => {
    if (!currentTx || !receipt) return;
    if (receiptStatus === 'success') {
      updateItem(currentTx.id, TRANSACTION_STATE.success, receipt);
      handlers.onSuccess?.(currentTx, receipt);
    } else if (receiptStatus === 'error') {
      updateItem(currentTx.id, TRANSACTION_STATE.error, receipt);
      setItemError(
        currentTx.id,
        `Transaction failed with status: ${receipt.status}`,
      );
      props.onError?.(
        currentTx,
        `Transaction failed with status: ${receipt.status}`,
        receiptError,
      );
      handlers.onError?.(
        currentTx,
        `Transaction failed with status: ${receipt.status}`,
        receiptError,
      );
    }
  }, [currentTx, receipt, receiptStatus, receiptError]);

  const handleConfirm = useCallback(async () => {
    if (!currentTx) return;
    try {
      setIsPreparing(true);
      updateItemState(currentTx.id, TRANSACTION_STATE.pending);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modifiedData: any =
        (await handlers.onBeforeSign?.(currentTx, txStore.getState().items)) ??
        currentTx.request.data;

      if (isMessageRequest(currentTx)) {
        signMessage(modifiedData);
      } else if (isTypedDataRequest(currentTx)) {
        signTypedData(modifiedData);
      } else if (isTransactionRequest(currentTx)) {
        const prepared = await prepareTransactionRequest(
          config.getClient(),
          modifiedData,
        );
        sendTransaction(prepared);
      } else {
        throw new Error('Unknown transaction request type');
      }
    } catch (e) {
      const msg = handleErrorMessage(e);
      setItemError(currentTx.id, msg);
      props.onError?.(currentTx, msg, e);
      handlers.onError?.(currentTx, msg, e);
    } finally {
      setIsPreparing(false);
    }
  }, [
    currentTx,
    config,
    sendTransaction,
    setItemError,
    signMessage,
    signTypedData,
    updateItemState,
  ]);

  const isPending =
    isPreparing ||
    isSending ||
    isSigning ||
    isSigningTypedData ||
    (pendingTxHash && isReceiptPending) ||
    currentTx?.state === TRANSACTION_STATE.pending;

  const marketAsCompleted$ = useRef(false);

  useEffect(() => {
    if (marketAsCompleted$.current) return;
    const count = txStore.getState().items.length;
    if (!isPending && !currentTx && count > 0) {
      marketAsCompleted$.current = true;
      txStore.getState().setIsCompleted(true);
      props.onCompleted?.(count);
      handlers.onCompleted?.(count);
    }
  }, [isPending, currentTx, props]);

  return {
    currentTx,
    pendingTxs,
    isPending,
    confirm: handleConfirm,
  };
}
