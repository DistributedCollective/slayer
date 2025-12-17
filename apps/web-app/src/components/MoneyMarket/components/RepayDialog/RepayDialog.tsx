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
import { revalidateQuery } from '@/integrations/tanstack-query/root-provider';
import { sdk } from '@/lib/sdk';
import { useSlayerTx } from '@/lib/transactions';
import { shouldUseFullAmount } from '@/lib/utils';
import { validateDecimal } from '@/lib/validations';
import { areAddressesEqual, Decimal } from '@sovryn/slayer-shared';
import { useCallback, useMemo, useReducer } from 'react';
import { useAccount, useBalance } from 'wagmi';
import z from 'zod';
import { useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { MINIMUM_HEALTH_FACTOR } from '../../constants';
import { useMoneyMarketPositions } from '../../hooks/use-money-positions';
import { repayRequestStore } from '../../stores/repay-request.store';

const RepayDialogForm = () => {
  const { address } = useAccount();

  const position = useStore(repayRequestStore, (state) => state.position!);

  const [useCollateral] = useReducer((state) => !state, false);

  const { data } = useMoneyMarketPositions({
    pool: position.pool.id || 'default',
    address: address!,
  });

  const summary = useMemo(() => {
    const pos = (data?.data?.positions || []).find(
      (item) => item.reserve.id === position.reserve.id,
    );
    if (pos && data?.data) {
      return data.data.summary;
    }
    return null;
  }, [data]);

  const { begin } = useSlayerTx({
    onClosed: (ok: boolean) => {
      if (ok) {
        // close withdrawal dialog if tx was successful
        repayRequestStore.getState().reset();
      }
    },
    onCompleted: () => {
      revalidateQuery({
        queryKey: [
          'money-market:positions',
          position.pool.id || 'default',
          address,
        ],
      });
    },
  });

  const { data: walletBalance } = useBalance({
    token: areAddressesEqual(position.token.address, position.pool.weth)
      ? undefined
      : position.token.address,
    address: address,
    chainId: sdk.ctx.chainId,
  });

  const maximumRepayAmount = useMemo(() => {
    return Decimal.from(position.borrowed, position.token.decimals).gt(
      walletBalance?.value ?? 0n,
      walletBalance?.decimals,
    )
      ? Decimal.from(walletBalance?.value ?? 0n, walletBalance?.decimals)
      : Decimal.from(position.borrowed, position.token.decimals);
  }, [
    position.borrowed,
    position.token.decimals,
    walletBalance?.decimals,
    walletBalance?.value,
  ]);

  const balance = useMemo(
    () => ({
      value: maximumRepayAmount.toBigInt(),
      decimals: position.token.decimals,
      symbol: position.token.symbol,
    }),
    [position, maximumRepayAmount],
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
        sdk.moneyMarket.repay(
          {
            ...position.reserve,
            pool: position.pool,
            token: position.token,
          },
          value.amount,
          maximumRepayAmount.lte(value.amount) ||
            shouldUseFullAmount(value.amount, position.borrowed),
          useCollateral,
          position.borrowRateMode,
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
    e.preventDefault();
  };

  const computeHealthFactor = useCallback(
    (amount: string) => {
      if (!summary || Decimal.from(summary.totalBorrowsUsd).eq(0)) {
        return Decimal.INFINITY;
      }

      return Decimal.from(summary.collateralBalanceUsd)
        .mul(summary.currentLiquidationThreshold)
        .div(
          Decimal.from(summary.totalBorrowsUsd).sub(
            Decimal.from(amount || '0').mul(position.reserve.priceUsd),
          ),
        );
    },
    [summary, position],
  );

  const calculateRemainingDebt = (repaymentAmount: string) => {
    const amount = Decimal.from(
      repaymentAmount || '0',
      position.token.decimals,
    );
    const current = Decimal.from(position.borrowed, position.token.decimals);
    if (amount.gt(current)) {
      return Decimal.ZERO.toString();
    }
    return Decimal.from(position.borrowed, position.token.decimals)
      .sub(repaymentAmount || '0')
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
          <DialogTitle>Repay Loan</DialogTitle>
          <DialogDescription className="sr-only">
            Repay your borrowed assets in the money market.
          </DialogDescription>
        </DialogHeader>
        <form.AppField name="amount">
          {(field) => (
            <field.AmountField
              label="Amount to Repay"
              placeholder="Amount"
              balance={balance}
              addonRight={balance.symbol}
            />
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
                        middleStart: MINIMUM_HEALTH_FACTOR,
                        middleEnd: 1.5,
                        end: 2,
                      }}
                    />
                  </ItemDescription>
                </ItemContent>
              </Item>
              <Item size="sm" className="py-1">
                <ItemContent>Remaining debt</ItemContent>
                <ItemContent>
                  <AmountRenderer
                    value={calculateRemainingDebt(amount)}
                    showApproxSign
                    suffix={position.token.symbol}
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
            <form.SubscribeButton label="Repay" />
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </form>
  );
};

export const RepayDialog = () => {
  const isOpen = useStoreWithEqualityFn(
    repayRequestStore,
    (state) => state.position !== null,
  );

  const handleClose = (open: boolean) => {
    if (!open) {
      repayRequestStore.getState().reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {isOpen && <RepayDialogForm />}
    </Dialog>
  );
};
