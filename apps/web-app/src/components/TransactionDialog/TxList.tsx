import { txStore } from '@/lib/transactions/store';
import {
  isMessageRequest,
  isTransactionRequest,
  isTypedDataRequest,
} from '@sovryn/slayer-sdk';
import clsx from 'clsx';
import { Loader2Icon } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAccount, useConfig, useSwitchChain } from 'wagmi';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { Button } from '../ui/button';
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useInternalTxHandler } from './hooks/use-internal-tx-handler';
import { TransactionItem } from './TransactionItem';

export const TxList = () => {
  const { t } = useTranslation(['tx', 'common']);
  const { switchChain } = useSwitchChain();
  const config = useConfig();
  const { isConnected, chainId } = useAccount();

  const items = useStoreWithEqualityFn(txStore, (state) => state.items);
  const handlers = useStore(txStore, (state) => state.handlers);

  const { confirm, currentTx, isPending } = useInternalTxHandler({
    // Default handlers with toasts
    onError: (_, message) => {
      if (!handlers.onError) {
        toast.error(message);
      }
    },
    onCompleted: (count) => {
      if (!handlers.onCompleted) {
        toast.success(
          count > 1
            ? `${count} transactions completed`
            : `Transaction completed`,
        );
      }
    },
  });

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
  }, [currentTx, config.chains]);

  const confirmLabel = useMemo(() => {
    if (currentTx) {
      if (isMessageRequest(currentTx)) {
        return t(($) => $.signMessage, { ns: 'tx' });
      } else if (isTransactionRequest(currentTx)) {
        return t(($) => $.sendTransaction, { ns: 'tx' });
      } else if (isTypedDataRequest(currentTx)) {
        return t(($) => $.signTypedData, { ns: 'tx' });
      }
    }
    return t(($) => $.confirm, { ns: 'common' });
  }, [currentTx]);

  const handleSwitchChain = useCallback(() => {
    if (!requiredChain) return;
    switchChain({
      chainId: requiredChain.id,
      addEthereumChainParameter: {
        nativeCurrency: requiredChain.nativeCurrency,
        rpcUrls: requiredChain.rpcUrls.default.http,
        chainName: requiredChain.name,
      },
    });
  }, [requiredChain, switchChain]);

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
              <Button onClick={handleSwitchChain}>
                {t(($) => $.switchNetwork, {
                  ns: 'tx',
                  name: requiredChain.name,
                })}
              </Button>
            ) : (
              <Button onClick={confirm} disabled={isPending}>
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
