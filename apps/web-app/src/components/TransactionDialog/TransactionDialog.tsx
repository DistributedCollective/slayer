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
  Loader2Icon,
} from 'lucide-react';
import { useMemo, useState, type FC } from 'react';
import { toast } from 'sonner';
import {
  useAccount,
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
        className={clsx(!isReady && 'w-62 h-62')}
        onInteractOutside={handleEscapes}
        onEscapeKeyDown={handleEscapes}
      >
        {isReady ? (
          <TxList />
        ) : (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Transaction in progress</DialogTitle>
              <DialogDescription>
                Please do not close this window.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col justify-center items-center gap-4">
              <Loader2Icon className="animate-spin mr-2" size={48} />
              <p className="text-sm">Preparing transaction...</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const TxList = () => {
  const [isPreparing, setIsPreparing] = useState(false);
  const { switchChain } = useSwitchChain();
  const { isConnected, chainId, connector } = useAccount();

  const items = useStoreWithEqualityFn(txStore, (state) => state.items);
  const updateItem = useStore(txStore, (state) => state.updateItem);
  const updateItemState = useStore(txStore, (state) => state.updateItemState);

  const currentTx = useMemo(() => items.find((t) => !t.res), [items]);

  const requiredChainId = useMemo(() => {
    if (currentTx && isTransactionRequest(currentTx)) {
      return currentTx.request.data.chain?.id;
    }

    if (currentTx && isTypedDataRequest(currentTx)) {
      return currentTx.request.data.domain?.chainId
        ? Number(currentTx.request.data.domain.chainId)
        : undefined;
    }

    return undefined;
  }, [currentTx]);

  const {
    sendTransactionAsync,
    data: pendingTxHash,
    error,
    isPending: isSending,
  } = useSendTransaction();

  const { signMessage, isPending: isSigning } = useSignMessage({
    mutation: {
      onError(error) {
        console.error('Message signing error', error);
        updateItem(currentTx?.id || '', txStates.error, undefined);
        toast.error(`Message signing failed: ${error.message}`);
      },
      onSuccess(data) {
        updateItem(currentTx?.id || '', txStates.success, {
          transactionHash: data,
        });
        console.log('Message signed successfully', data);
        toast.success('Message signed successfully');
      },
    },
  });

  const { signTypedData, isPending: isSigningTypedData } = useSignTypedData({
    mutation: {
      onError(error) {
        console.error('Typed Data signing error', error);
        updateItem(currentTx?.id || '', txStates.error, undefined);
        toast.error(`Typed Data signing failed: ${error.message}`);
      },
      onSuccess(data) {
        updateItem(currentTx?.id || '', txStates.success, {
          transactionHash: data,
        });
        console.log('Typed Data signed successfully', data);
        toast.success('Typed Data signed successfully');
      },
    },
  });

  const {
    data: receipt,
    isFetching,
    isPending: isReceiptPending,
  } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
    onReplaced: (tx) => {
      console.log('Transaction replaced', tx);
    },
  });

  const handleConfirm = async () => {
    const tx = items.find((t) => !t.res);
    if (!tx) return;
    try {
      console.log('Confirming tx', tx);
      setIsPreparing(true);
      updateItemState(tx.id, txStates.pending);

      if (isMessageRequest(tx)) {
        // Handle message request
        console.log('Signing message', tx.request.data);
        signMessage(tx.request.data);
      } else if (isTypedDataRequest(tx)) {
        // Handle typed data request
        console.log('Signing typed data', tx.request.data);
        signTypedData(tx.request.data);
      } else if (isTransactionRequest(tx)) {
        // Handle transaction request
        console.log('Sending transaction', tx.request.data);
      } else {
        throw new Error('Unknown transaction request type');
      }

      // const value = await prepareTransactionRequest(config.getClient(), {
      //   to: '0x2bD2201BFE156A71EB0D02837172ffc237218505'.toLowerCase() as `0x${string}`,
      //   value: 1n,
      //   //   chain: client?.chain,
      // });

      // console.log('Prepared transaction value:', value);

      // const hash = await sendTransactionAsync(value, {
      //   onSettled: (data, error) => {
      //     console.log('Transaction settled', { data, error });
      //   },
      //   onError: (error) => {
      //     console.error('Transaction error', error);
      //   },
      //   onSuccess: (data) => {
      //     console.log('Transaction success', data);
      //   },
      // });
      // console.log('Transaction hash:', hash);
    } catch (e) {
      console.error('Error confirming transaction', e);
      return;
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
        return 'Sign Message';
      } else if (isTransactionRequest(currentTx!)) {
        return 'Send Transaction';
      } else if (isTypedDataRequest(currentTx!)) {
        return 'Sign Typed Data';
      }
    }
    return 'Confirm';
  }, [currentTx]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>On-chain interaction required</DialogTitle>
        <DialogDescription>
          Confirm and submit your transactions
        </DialogDescription>
      </DialogHeader>
      {items.map((tx, index) => (
        <TransactionItem key={tx.id} item={tx} index={index} />
      ))}

      <p>chainId: {chainId}</p>

      {!isConnected && <p>Please connect your wallet.</p>}

      <p>data: {pendingTxHash}</p>
      <p>error: {error?.message}</p>

      <p>receipt: {JSON.stringify(receipt)}</p>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>

        {chainId &&
        requiredChainId !== undefined &&
        chainId !== requiredChainId ? (
          <Button
            onClick={() =>
              switchChain({
                chainId: requiredChainId as AnyValue,
              })
            }
          >
            Switch network
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
      </DialogFooter>
    </>
  );
};

const TransactionItem: FC<{ item: SlayerTx; index: number }> = ({
  item,
  index,
}) => {
  return (
    <div className="flex flex-row justify-start items-start gap-4 mb-3">
      <div className="w-8 shrink-0 grow-0 text-center">
        <div className="flex flex-col items-center gap-1">
          {item.state === txStates.idle && <CircleDashed size={24} />}
          {item.state === txStates.pending && (
            <Loader2Icon className="animate-spin" size={24} />
          )}
          {item.state === txStates.success && <CircleCheckBig size={24} />}
          {item.state === txStates.error && <CircleX size={24} />}
          <div className="text-xs">#{index + 1}</div>
        </div>
      </div>
      <div className="grow">
        <p>{item.title}</p>
        <p className="text-sm">{item.description}</p>
      </div>
    </div>
  );
};
