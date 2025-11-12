import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppForm } from '@/hooks/app-form';
import { sdk } from '@/lib/sdk';
import { useSlayerTx } from '@/lib/transactions';
import { validateDecimal } from '@/lib/validations';
import { BORROW_RATE_MODES } from '@sovryn/slayer-sdk';
import { useAccount } from 'wagmi';
import z from 'zod';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { borrowRequestStore } from '../../stores/borrow-request.store';

const schema = z.object({
  amount: validateDecimal({ min: 1n }),
});

const BorrowDialogForm = () => {
  const reserve = useStore(borrowRequestStore, (state) => state.reserve!);

  const { begin } = useSlayerTx({
    onClosed: (ok: boolean) => {
      console.log('borrow tx modal closed, success:', ok);
      if (ok) {
        // close borrowing dialog if tx was successful
        borrowRequestStore.getState().reset();
      }
    },
  });
  const { address } = useAccount();

  const form = useAppForm({
    defaultValues: {
      amount: '',
    },
    validators: {
      onMount: schema,
      onBlur: schema,
    },
    onSubmit: ({ value }) => {
      begin(() =>
        sdk.moneyMarket.borrow(
          reserve,
          value.amount,
          BORROW_RATE_MODES.variable,
          {
            account: address!,
          },
        ),
      );
    },
    onSubmitInvalid(props) {
      console.log('Borrow request submission invalid:', props);
    },
    onSubmitMeta() {
      console.log('Borrow request submission meta:', form);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const handleEscapes = (e: Event) => {
    borrowRequestStore.getState().reset();
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} id={form.formId()}>
      <DialogContent
        onInteractOutside={handleEscapes}
        onEscapeKeyDown={handleEscapes}
      >
        <DialogHeader>
          <DialogTitle>Borrow Asset</DialogTitle>
          <DialogDescription>
            Borrowing functionality is under development.
          </DialogDescription>
        </DialogHeader>
        <form.AppField name="amount">
          {(field) => <field.AmountField label="Amount to Borrow" />}
        </form.AppField>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" type="button">
              Close
            </Button>
          </DialogClose>
          <form.AppForm>
            <form.SubscribeButton label="Submit" />
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </form>
  );
};

export const BorrowDialog = () => {
  const isOpen = useStoreWithEqualityFn(
    borrowRequestStore,
    (state) => state.reserve !== null,
  );

  const handleClose = (open: boolean) => {
    if (!open) {
      borrowRequestStore.getState().reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {isOpen && <BorrowDialogForm />}
    </Dialog>
  );
};
