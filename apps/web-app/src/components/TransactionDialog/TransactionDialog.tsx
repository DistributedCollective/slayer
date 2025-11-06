import { txStore } from '@/lib/transactions/store';
import clsx from 'clsx';
import { Loader2Icon } from 'lucide-react';
import type { SdkTransactionRequest } from 'node_modules/@sovryn/slayer-sdk/src/lib/transaction';
import { useState, type FC } from 'react';
import { prepareTransactionRequest } from 'viem/actions';
import {
  useAccount,
  useConfig,
  useSendTransaction,
  useSignMessage,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi';
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

  const nextTx = items.find((t) => !t.res);

  //   const hasPending = items.some(tx => tx.res?.)

  const {
    sendTransactionAsync,
    data: pendingTxHash,
    error,
    isPending: isSending,
  } = useSendTransaction();
  const { signMessageAsync } = useSignMessage();

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

  const config = useConfig();

  const handleConfirm = async () => {
    const tx = items.find((t) => !t.res);
    if (!tx) return;
    setIsPreparing(true);
    try {
      console.log('Confirming tx', tx);
      setIsPreparing(true);

      const client = await connector?.getClient?.();
      const value = await prepareTransactionRequest(config.getClient(), {
        to: '0x2bD2201BFE156A71EB0D02837172ffc237218505'.toLowerCase() as `0x${string}`,
        value: 1n,
        //   chain: client?.chain,
      });

      console.log('Prepared transaction value:', value);

      const hash = await sendTransactionAsync(value, {
        onSettled: (data, error) => {
          console.log('Transaction settled', { data, error });
        },
        onError: (error) => {
          console.error('Transaction error', error);
        },
        onSuccess: (data) => {
          console.log('Transaction success', data);
        },
      });
      console.log('Transaction hash:', hash);
    } catch (e) {
      console.error('Error confirming transaction', e);
      return;
    } finally {
      setIsPreparing(false);
    }
  };

  const isPending = isPreparing || isSending || isReceiptPending;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Transaction Dialog</DialogTitle>
        <DialogDescription>
          Confirm and submit your transactions
        </DialogDescription>
      </DialogHeader>
      {items.map((tx) => (
        <TransactionItem key={tx.id} item={tx} />
      ))}

      <p>chainId: {chainId}</p>
      <p>next chainId: {nextTx?.req.chainId}</p>

      {!isConnected && <p>Please connect your wallet.</p>}

      <p>data: {pendingTxHash}</p>
      <p>error: {error?.message}</p>

      <p>receipt: {JSON.stringify(receipt)}</p>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>

        {chainId && nextTx?.req?.chainId && chainId !== nextTx?.req.chainId ? (
          <Button
            onClick={() =>
              switchChain({ chainId: nextTx!.req.chainId! as AnyValue })
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
            Confirm
          </Button>
        )}
      </DialogFooter>
    </>
  );
};

const TransactionItem: FC<{ item: SdkTransactionRequest }> = ({ item }) => {
  return (
    <div>
      <p>{item.title}</p>
      <p>{item.description}</p>
      {/* <pre>{JSON.stringify(item.req)}</pre> */}
      {/* <pre>{JSON.stringify(item.res)}</pre> */}
    </div>
  );
};
