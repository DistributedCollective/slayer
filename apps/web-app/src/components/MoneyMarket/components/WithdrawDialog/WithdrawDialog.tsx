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
import { Decimal } from '@sovryn/slayer-shared';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import z from 'zod';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { MINIMUM_HEALTH_FACTOR } from '../../constants';
import { useMoneyMarketPositions } from '../../hooks/use-money-positions';
import { withdrawRequestStore } from '../../stores/withdraw-request.store';

const WithdrawDialogForm = () => {
  const { address } = useAccount();

  const position = useStore(withdrawRequestStore, (state) => state.position!);

  const { data } = useMoneyMarketPositions({
    pool: position.pool.id || 'default',
    address: address!,
  });

  const { begin } = useSlayerTx({
    onClosed: (ok: boolean) => {
      if (ok) {
        // close withdrawal dialog if tx was successful
        withdrawRequestStore.getState().reset();
      }
    },
  });

  const maximumWithdrawAmount = useMemo(() => {
    const summary = data?.data?.summary;
    if (!summary) {
      return Decimal.ZERO;
    }

    // if user has no borrows or this position is not used as collateral, allow full withdrawal
    if (Decimal.from(summary.totalBorrowsUsd).eq(0) || !position.collateral) {
      return Decimal.from(position.supplied, position.token.decimals);
    }

    // min collateral at which we reach minimum collateral ratio
    const minCollateralUsd = Decimal.from(MINIMUM_HEALTH_FACTOR)
      .mul(summary.totalBorrowsUsd)
      .div(summary.currentLiquidationThreshold);
    const maxWithdrawUsd = Decimal.from(summary.supplyBalanceUsd).sub(
      minCollateralUsd,
    );

    if (maxWithdrawUsd.lte(0)) {
      return Decimal.ZERO;
    }

    return maxWithdrawUsd.gt(position.suppliedUsd)
      ? Decimal.from(position.supplied, position.token.decimals)
      : maxWithdrawUsd.div(position.reserve.priceUsd);
  }, []);

  const balance = useMemo(
    () => ({
      value: maximumWithdrawAmount.toBigInt(),
      decimals: position.token.decimals,
      symbol: position.token.symbol,
    }),
    [position, maximumWithdrawAmount],
  );

  const form = useAppForm({
    defaultValues: {
      amount: '',
    },
    validators: {
      onChange: z.object({
        amount: validateDecimal({
          min: 1n,
          max: balance.value ?? undefined,
        }),
      }),
    },
    onSubmit: ({ value }) => {
      begin(() =>
        sdk.moneyMarket.withdraw(
          {
            ...position.reserve,
            pool: position.pool,
            token: position.token,
          },
          value.amount,
          // if max amount + summary.borrowPowerUsed.eq(0) then flag it as true
          false,
          {
            account: address!,
          },
        ),
      );
    },
    onSubmitInvalid(props) {
      console.log('Withdraw request submission invalid:', props);
    },
    onSubmitMeta() {
      console.log('Withdraw request submission meta:', form);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const handleEscapes = (e: Event) => {
    withdrawRequestStore.getState().reset();
    e.preventDefault();
  };

  const calculateRemainingSupply = (withdrawAmount: string) => {
    const amount = Decimal.from(withdrawAmount || '0', position.token.decimals);
    const current = Decimal.from(position.supplied, position.token.decimals);
    if (amount.gt(current)) {
      return Decimal.ZERO.toString();
    }
    return Decimal.from(position.supplied, position.token.decimals)
      .sub(withdrawAmount || '0')
      .toString();
  };

  return (
    <form onSubmit={handleSubmit} id={form.formId}>
      <DialogContent
        onInteractOutside={handleEscapes}
        onEscapeKeyDown={handleEscapes}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Withdraw Asset</DialogTitle>
          <DialogDescription className="sr-only">
            Withdraw your supplied assets from the money market.
          </DialogDescription>
        </DialogHeader>
        <form.AppField name="amount">
          {(field) => (
            <field.AmountField
              label="Amount to Withdraw"
              placeholder="Amount"
              balance={balance}
              addonRight={balance.symbol}
            />
          )}
        </form.AppField>

        <form.Subscribe selector={(state) => state.values.amount}>
          {(withdrawAmount) => (
            <ItemGroup>
              <Item size="sm" className="py-1">
                <ItemContent>Remaining supply:</ItemContent>
                <ItemContent>
                  <AmountRenderer
                    value={calculateRemainingSupply(withdrawAmount)}
                    suffix={position.token.symbol}
                    showApproxSign
                  />
                </ItemContent>
              </Item>
            </ItemGroup>
          )}
        </form.Subscribe>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" type="button">
              Close
            </Button>
          </DialogClose>
          <form.AppForm>
            <form.SubscribeButton label="Withdraw" />
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </form>
  );
};

export const WithdrawDialog = () => {
  const isOpen = useStoreWithEqualityFn(
    withdrawRequestStore,
    (state) => state.position !== null,
  );

  const handleClose = (open: boolean) => {
    if (!open) {
      withdrawRequestStore.getState().reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {isOpen && <WithdrawDialogForm />}
    </Dialog>
  );
};
