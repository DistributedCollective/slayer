import { txStore } from '@/lib/transactions/store';
import clsx from 'clsx';
import { Loader2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { TxList } from './TxList';

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
              <Loader2Icon className="mr-2 animate-spin" size={48} />
              <p className="text-sm">{t(($) => $.preparing)}</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
