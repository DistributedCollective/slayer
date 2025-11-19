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
import { areAddressesEqual } from '@sovryn/slayer-shared';
import { useAccount, useBalance } from 'wagmi';
import z from 'zod';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { lendRequestStore } from '../../stores/lend-request.store';

const LendDialogForm = () => {
  const reserve = useStore(lendRequestStore, (state) => state.reserve!);

  const { begin } = useSlayerTx({
    onClosed: (ok: boolean) => {
      console.log('lend tx modal closed, success:', ok);
      if (ok) {
        // close lending dialog if tx was successful
        lendRequestStore.getState().reset();
      }
    },
  });
  const { address } = useAccount();

  const { data: balance } = useBalance({
    token: areAddressesEqual(reserve.token.address, reserve.pool.weth)
      ? undefined
      : reserve.token.address,
    address: address,
    // chainId: sdk.ctx.chainId,
  });

  const form = useAppForm({
    defaultValues: {
      amount: '',
    },
    validators: {
      onMount: z.object({
        amount: validateDecimal({ min: 1n }),
      }),
      onBlur: z.object({
        amount: validateDecimal({ min: 1n, max: balance?.value ?? undefined }),
      }),
    },
    onSubmit: ({ value }) => {
      begin(() =>
        sdk.moneyMarket.supply(reserve, value.amount, {
          account: address!,
        }),
      );
    },
    onSubmitInvalid(props) {
      console.log('Lend request submission invalid:', props);
    },
    onSubmitMeta() {
      console.log('Lend request submission meta:', form);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const handleEscapes = (e: Event) => {
    lendRequestStore.getState().reset();
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} id={form.formId()}>
      <DialogContent
        onInteractOutside={handleEscapes}
        onEscapeKeyDown={handleEscapes}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Lend Asset</DialogTitle>
          <DialogDescription>
            Lending functionality is under development.
          </DialogDescription>
        </DialogHeader>
        <form.AppField name="amount">
          {(field) => (
            <field.AmountField label="Amount to Lend" balance={balance} />
          )}
        </form.AppField>
        <p>
          {reserve.token.symbol} can be used as collateral:{' '}
          {reserve.usageAsCollateralEnabled ? 'Yes' : 'No'}
        </p>

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

export const LendDialog = () => {
  const isOpen = useStoreWithEqualityFn(
    lendRequestStore,
    (state) => state.reserve !== null,
  );

  const handleClose = (open: boolean) => {
    if (!open) {
      lendRequestStore.getState().reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {isOpen && <LendDialogForm />}
    </Dialog>
  );
};
