import { txStates, txStore, type SlayerTx } from '@/lib/transactions/store';
import {
  isMessageRequest,
  isTransactionRequest,
  isTypedDataRequest,
} from '@sovryn/slayer-sdk';
import clsx from 'clsx';
import {
  CircleCheckBig,
  CircleDashed,
  CircleX,
  ExternalLink,
  Loader2Icon,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { prepareTransactionRequest } from 'viem/actions';
import {
  useAccount,
  useChains,
  useConfig,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export const TransactionDialogProvider = () => {
  const { t } = useTranslation('tx');

  const [isOpen, isReady] = useStoreWithEqualityFn(
    txStore,
    (state) => [state.isFetching || state.isReady, state.isReady] as const,
  );

  const onClose = (open: boolean) => {
    if (!open) {
      txStore.getState().reset();
    }
  };

  const handleEscapes = (e: Event) => {
    if (!isReady) {
      txStore.getState().reset();
      return;
    }
    e.preventDefault();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={clsx(!isReady && 'w-64 h-64')}
        onInteractOutside={handleEscapes}
        onEscapeKeyDown={handleEscapes}
      >
        {isReady ? (
          <TxList />
        ) : (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{t(($) => $.title)}</DialogTitle>
              <DialogDescription>{t(($) => $.description)}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col justify-center items-center gap-4">
              <Loader2Icon className="animate-spin mr-2" size={48} />
              <p className="text-sm">{t(($) => $.preparing)}</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const TxList = () => {
  const { t } = useTranslation(['tx', 'common']);
  const [isPreparing, setIsPreparing] = useState(false);
  const { switchChain } = useSwitchChain();
  const config = useConfig();
  const { isConnected, chainId } = useAccount();

  const items = useStoreWithEqualityFn(txStore, (state) => state.items);
  const updateItem = useStore(txStore, (state) => state.updateItem);
  const updateItemState = useStore(txStore, (state) => state.updateItemState);
  const setItemError = useStore(txStore, (state) => state.setItemError);

  const currentTx = useMemo(
    () => items.find((t) => t.state !== txStates.success),
    [items],
  );

  const currentChain = useMemo(
    () => config.chains.find((c) => c.id === chainId),
    [chainId, config.chains],
  );
  const requiredChain = useMemo(() => {
    let id: number | undefined = undefined;
    if (currentTx && isTransactionRequest(currentTx)) {
      id = currentTx.request.data.chain?.id;
    }

    if (currentTx && isTypedDataRequest(currentTx)) {
      id = currentTx.request.data.domain?.chainId
        ? Number(currentTx.request.data.domain.chainId)
        : undefined;
    }

    return id !== undefined
      ? config.chains.find((c) => c.id === id)
      : undefined;
  }, [currentTx]);

  const { signMessage, isPending: isSigning } = useSignMessage({
    mutation: {
      onError(error) {
        const msg = handleErrorMessage(error);
        toast.error(msg);
        console.error('Message signing error', error);
        if (!currentTx) return;
        setItemError(currentTx.id, msg);
      },
      onSuccess(data) {
        if (!currentTx) return;
        updateItem(currentTx.id, txStates.success, {
          transactionHash: data,
        });
        toast.success('Message signed successfully');
      },
    },
  });

  const { signTypedData, isPending: isSigningTypedData } = useSignTypedData({
    mutation: {
      onError(error) {
        const msg = handleErrorMessage(error);
        console.error('Typed Data signing error', error);
        toast.error(msg);
        if (!currentTx) return;
        setItemError(currentTx?.id || '', msg);
      },
      onSuccess(data) {
        if (!currentTx) return;
        updateItem(currentTx?.id || '', txStates.success, {
          transactionHash: data,
        });
        toast.success('Typed Data signed successfully');
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
          updateItem(currentTx.id, txStates.pending, {
            transactionHash: data,
          });
          toast.success('Transaction is broadcasted');
        } else if (error) {
          console.log({
            msg: error.message,
            cause: error.cause,
            name: error.name,
            stack: error.stack,
          });
          const msg = handleErrorMessage(error);
          console.error('Transaction sending error', error);
          setItemError(currentTx.id, msg);
          toast.error(msg);
        }
      },
    },
  });

  const {
    data: receipt,
    status: receiptStatus,
    isLoading: isReceiptPending,
  } = useWaitForTransactionReceipt({
    chainId:
      currentTx && isTransactionRequest(currentTx)
        ? (currentTx.request.data.chain?.id as any)
        : undefined,
    hash:
      currentTx && isTransactionRequest(currentTx)
        ? currentTx.res?.transactionHash
        : undefined,
    onReplaced: (tx) => {
      if (!currentTx) return;
      if (tx.reason === 'cancelled') {
        updateItemState(currentTx.id, txStates.idle);
        toast.error('Transaction was cancelled');
        return;
      }
      updateItem(
        currentTx.id,
        tx.transactionReceipt.status === 'success'
          ? txStates.success
          : txStates.error,
        tx.transactionReceipt,
      );
    },
  });

  useEffect(() => {
    if (!currentTx || !receipt) return;
    if (receiptStatus === 'success') {
      updateItem(currentTx.id, txStates.success, receipt);
    } else if (receiptStatus === 'error') {
      updateItem(currentTx.id, txStates.error, receipt);
      setItemError(
        currentTx.id,
        `Transaction failed with status: ${receipt.status}`,
      );
    }
  }, [currentTx, receipt, receiptStatus]);

  const handleConfirm = async () => {
    const tx = items.find((t) => !t.res);
    if (!tx) return;
    try {
      setIsPreparing(true);
      updateItemState(tx.id, txStates.pending);

      if (isMessageRequest(tx)) {
        signMessage(tx.request.data);
      } else if (isTypedDataRequest(tx)) {
        signTypedData(tx.request.data);
      } else if (isTransactionRequest(tx)) {
        const prepared = await prepareTransactionRequest(
          config.getClient(),
          tx.request.data,
        );
        sendTransaction<any>(prepared);
      } else {
        throw new Error('Unknown transaction request type');
      }
    } catch (e) {
      setItemError(tx.id, handleErrorMessage(e));
      toast.error(handleErrorMessage(e));
      console.error('Error confirming transaction', e);
    } finally {
      setIsPreparing(false);
    }
  };

  const isPending =
    isPreparing ||
    isSending ||
    isSigning ||
    isSigningTypedData ||
    (pendingTxHash && isReceiptPending) ||
    currentTx?.state === txStates.pending;

  const confirmLabel = useMemo(() => {
    if (currentTx) {
      if (isMessageRequest(currentTx!)) {
        return t(($) => $.signMessage, { ns: 'tx' });
      } else if (isTransactionRequest(currentTx!)) {
        return t(($) => $.sendTransaction, { ns: 'tx' });
      } else if (isTypedDataRequest(currentTx!)) {
        return t(($) => $.signTypedData, { ns: 'tx' });
      }
    }
    return t(($) => $.confirm, { ns: 'common' });
  }, [currentTx]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t(($) => $.title, { ns: 'tx' })}</DialogTitle>
        <DialogDescription>
          {t(($) => $.description, { ns: 'tx' })}
        </DialogDescription>
      </DialogHeader>
      {items.map((tx, index) => (
        <TransactionItem key={tx.id} item={tx} index={index} />
      ))}

      {!isConnected && <p>{t(($) => $.connectWallet)}</p>}

      <DialogFooter>
        <DialogClose asChild>
          <Button variant={currentTx ? 'outline' : 'default'}>
            {t(($) => (currentTx ? $.abort : $.continue), { ns: 'common' })}
          </Button>
        </DialogClose>

        {currentTx && (
          <>
            {chainId &&
            requiredChain !== undefined &&
            currentChain?.id !== requiredChain?.id ? (
              <Button
                onClick={() =>
                  switchChain({
                    chainId: requiredChain.id,
                    addEthereumChainParameter: {
                      nativeCurrency: requiredChain.nativeCurrency,
                      rpcUrls: requiredChain.rpcUrls.default.http,
                      chainName: requiredChain.name,
                    },
                  })
                }
              >
                {t(($) => $.switchNetwork, {
                  ns: 'tx',
                  name: requiredChain.name,
                })}
              </Button>
            ) : (
              <Button onClick={handleConfirm} disabled={isPending}>
                <Loader2Icon
                  className={clsx(isPending ? 'animate-spin' : 'hidden')}
                  size={16}
                />
                {confirmLabel}
              </Button>
            )}
          </>
        )}
      </DialogFooter>
    </>
  );
};

const TransactionItem: FC<{ item: SlayerTx; index: number }> = ({
  item,
  index,
}) => {
  const isTx = isTransactionRequest(item);
  const chains = useChains();
  const chain = useMemo(() => {
    if (isTx) {
      const chainId = item.request.data.chain?.id;
      return chains.find((c) => c.id === chainId);
    }
    return undefined;
  }, [chains, isTx, item.request.data]);

  return (
    <div className="flex flex-row justify-start items-start gap-4 mb-3">
      <div className="w-8 shrink-0 grow-0 text-center">
        <div className="flex flex-col items-center gap-1">
          {item.state === txStates.idle && <CircleDashed size={24} />}
          {item.state === txStates.pending && (
            <Loader2Icon className="animate-spin" size={24} />
          )}
          {item.state === txStates.success && (
            <CircleCheckBig size={24} className="text-green-500" />
          )}
          {item.state === txStates.error && (
            <CircleX size={24} className="text-red-500" />
          )}
          <div className="text-xs">#{index + 1}</div>
        </div>
      </div>
      <div className="grow">
        <p>{item.title}</p>
        <p className="text-sm">{item.description}</p>
        {isTx && chain && item.res?.transactionHash && (
          <p className="text-sm">
            <a
              target="_blank"
              href={`${chain?.blockExplorers?.default?.url}/tx/${item.res.transactionHash}`}
              rel="noopener noreferrer"
              className="flex flex-row justify-start gap-2 items-center mt-2"
            >
              <ExternalLink size={16} /> {item.res.transactionHash.slice(0, 6)}
              ...{item.res.transactionHash.slice(-4)}
            </a>
          </p>
        )}

        {item.error && (
          <p className="mt-2 text-xs text-red-500">{item.error}</p>
        )}
      </div>
    </div>
  );
};

function handleErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.cause) {
      const cause: any = error.cause;
      return (
        cause.details?.detail ??
        cause.details ??
        cause.shortMessage ??
        error.message ??
        'An unknown error occurred'
      );
    }
    return error.message || 'An unknown error occurred';
  }
  return 'An unknown error occurred';
}
