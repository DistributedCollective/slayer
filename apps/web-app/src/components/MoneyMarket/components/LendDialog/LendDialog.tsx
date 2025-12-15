import { AmountRenderer } from '@/components/ui/amount-renderer';
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
import { Item, ItemContent, ItemGroup } from '@/components/ui/item';
import { useAppForm } from '@/hooks/app-form';
import { sdk } from '@/lib/sdk';
import { useSlayerTx } from '@/lib/transactions';
import { validateDecimal } from '@/lib/validations';
import { areAddressesEqual } from '@sovryn/slayer-shared';
import { useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import z from 'zod';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { useMoneyMarketPositions } from '../../hooks/use-money-positions';
import { lendRequestStore } from '../../stores/lend-request.store';

const LendDialogForm = () => {
  const { address } = useAccount();

  const reserve = useStore(lendRequestStore, (state) => state.reserve!);

  const { data: items } = useMoneyMarketPositions({
    pool: reserve.pool.id || 'default',
    address: address!,
  });

  const data = useMemo(() => {
    const position = (items?.data?.positions || []).find(
      (item) => item.reserve.id === reserve.id,
    );
    if (position && items?.data) {
      return {
        position,
        summary: items.data.summary,
      };
    }
    return null;
  }, [items]);

  const { begin } = useSlayerTx({
    onClosed: (ok: boolean) => {
      if (ok) {
        // close lending dialog if tx was successful
        lendRequestStore.getState().reset();
      }
    },
  });

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
      onChange: z.object({
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
    <form onSubmit={handleSubmit} id={form.formId}>
      <DialogContent
        onInteractOutside={handleEscapes}
        onEscapeKeyDown={handleEscapes}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Lend Asset</DialogTitle>
          <DialogDescription className="sr-only">
            Supply assets to the money market to earn interest and use them as
            collateral for borrowing.
          </DialogDescription>
        </DialogHeader>
        <form.AppField name="amount">
          {(field) => (
            <field.AmountField
              label="Amount to Lend"
              placeholder="Amount"
              balance={balance}
              addonRight={reserve.token.symbol}
            />
          )}
        </form.AppField>

        <ItemGroup>
          <Item size="sm" className="py-1">
            <ItemContent>Lend APY:</ItemContent>
            <ItemContent>
              <AmountRenderer
                value={data?.position.reserve.supplyApy ?? '0'}
                suffix="%"
                showApproxSign
              />
            </ItemContent>
          </Item>
          <Item size="sm" className="py-1">
            <ItemContent>Collateralization:</ItemContent>
            <ItemContent>
              {reserve.canBeCollateral ? 'Enabled' : 'Disabled'}
            </ItemContent>
          </Item>
        </ItemGroup>

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
