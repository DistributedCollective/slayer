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
import { HealthFactorBar } from '@/components/ui/health-factor-bar';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
} from '@/components/ui/item';
import { useAppForm } from '@/hooks/app-form';
import { sdk } from '@/lib/sdk';
import { useSlayerTx } from '@/lib/transactions';
import { validateDecimal } from '@/lib/validations';
import { BORROW_RATE_MODES } from '@sovryn/slayer-sdk';
import { Decimal } from '@sovryn/slayer-shared';
import { useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import z from 'zod';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { useMoneyMarketPositions } from '../../hooks/use-money-positions';
import { borrowRequestStore } from '../../stores/borrow-request.store';

const BorrowDialogForm = () => {
  const { address } = useAccount();
  const reserve = useStore(borrowRequestStore, (state) => state.reserve!);

  const { data: items } = useMoneyMarketPositions({
    pool: reserve.pool.id || 'default',
    address: address!,
  });

  const { begin } = useSlayerTx({
    onClosed: (ok: boolean) => {
      console.log('borrow tx modal closed, success:', ok);
      if (ok) {
        // close borrowing dialog if tx was successful
        borrowRequestStore.getState().reset();
      }
    },
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

  const form = useAppForm({
    defaultValues: {
      amount: '',
      agree: false,
    },
    validators: {
      onChange: z.object({
        amount: validateDecimal({
          min: 1n,
          max: Decimal.from(data?.position.availableToBorrow ?? '0').toBigInt(),
        }),
        agree: z.literal(true, 'Must agree to proceed with borrowing'),
      }),
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

  const calculateLiquidationPrice = useCallback(
    (amount: string) => {
      if (!data || Decimal.from(data.summary.collateralBalanceUsd).eq(0)) {
        return Decimal.INFINITY;
      }

      return Decimal.from(
        Decimal.from(amount || '0').mul(data.position.reserve.priceUsd),
      )
        .mul(data.summary.currentLiquidationThreshold)
        .div(data.summary.collateralBalanceUsd);
    },
    [data],
  );

  const computeHealthFactor = useCallback(
    (amount: string) => {
      if (!data || Decimal.from(data.summary.totalBorrowsUsd).eq(0)) {
        return Decimal.INFINITY;
      }

      return Decimal.from(data.summary.collateralBalanceUsd)
        .mul(data.summary.currentLiquidationThreshold)
        .div(
          Decimal.from(data.summary.totalBorrowsUsd).add(
            Decimal.from(amount || '0').mul(data.position.reserve.priceUsd),
          ),
        );
    },
    [data],
  );

  return (
    <form onSubmit={handleSubmit} id={form.formId}>
      <DialogContent
        onInteractOutside={handleEscapes}
        onEscapeKeyDown={handleEscapes}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Borrow Asset</DialogTitle>
          <DialogDescription className="sr-only">
            Borrowing functionality is under development.
          </DialogDescription>
        </DialogHeader>
        <form.AppField name="amount">
          {(field) => (
            <>
              <field.AmountField
                label="Amount to Borrow"
                balance={{
                  value: Decimal.from(
                    data?.position.availableToBorrow ?? '0',
                  ).toBigInt(),
                  decimals: data?.position.token.decimals || 18,
                  symbol: data?.position.token.symbol || '',
                }}
                placeholder="Amount to borrow"
                addonRight={data?.position.token.symbol}
              />
            </>
          )}
        </form.AppField>

        <form.Subscribe
          selector={(state) =>
            [
              state.values.amount,
              computeHealthFactor(state.values.amount ?? 0),
            ] as const
          }
        >
          {([amount, healthFactor]) => (
            <ItemGroup>
              <Item size="sm" variant="outline">
                <ItemContent>
                  <ItemContent>
                    <div className="flex flex-row justify-between">
                      <div>Collateral Ratio</div>
                      <AmountRenderer
                        value={healthFactor.mul(100).toNumber().toFixed(8)}
                        suffix="%"
                        showApproxSign
                      />
                    </div>
                  </ItemContent>
                  <ItemDescription>
                    <HealthFactorBar
                      value={healthFactor.toNumber()}
                      options={{
                        start: 1,
                        middleStart: 1.1,
                        middleEnd: 1.5,
                        end: 2,
                      }}
                    />
                  </ItemDescription>
                </ItemContent>
              </Item>
              <Item size="sm" className="mt-2 py-1">
                <ItemContent>Borrow APY</ItemContent>
                <ItemContent>
                  <AmountRenderer
                    value={data?.position.reserve.variableBorrowApy ?? '0'}
                    suffix="%"
                    showApproxSign
                  />
                </ItemContent>
              </Item>
              <Item size="sm" className="py-1">
                <ItemContent>Liquidation price</ItemContent>
                <ItemContent>
                  <AmountRenderer
                    value={calculateLiquidationPrice(amount).toString()}
                    showApproxSign
                    prefix="$"
                  />
                </ItemContent>
              </Item>
              <Item size="sm" className="py-1">
                <ItemContent>{data?.position.token.symbol} Price</ItemContent>
                <ItemContent>
                  <AmountRenderer
                    value={data?.position.reserve.priceUsd ?? '0'}
                    prefix="$"
                    showApproxSign
                  />
                </ItemContent>
              </Item>
            </ItemGroup>
          )}
        </form.Subscribe>

        <form.AppField name="agree">
          {(field) => (
            <field.CheckBox label="I understand that my collateral may be liquidated or used to pay rollover fees if applicable." />
          )}
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
