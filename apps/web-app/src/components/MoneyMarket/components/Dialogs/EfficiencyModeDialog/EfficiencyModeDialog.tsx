import { useMoneyMarketReserves } from '@/components/MoneyMarket/hooks/use-money-reserves';
import { efficiencyModeRequestStore } from '@/components/MoneyMarket/stores/efficiency-mode-request.store';
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
import { useSlayerTx } from '@/lib/transactions';
import type { MoneyMarketUserSummary } from '@sovryn/slayer-sdk';
import { Decimal } from '@sovryn/slayer-shared';
import { useLoaderDeps } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { useMoneyMarketPositions } from '../../../hooks/use-money-positions';
import { borrowRequestStore } from '../../../stores/borrow-request.store';

const normalizeEmodeSummary = (
  summary: MoneyMarketUserSummary,
  categoryId: number,
) => {
  if (!summary) {
    return {
      ltv: Decimal.ZERO,
      collateralRatio: Decimal.INFINITY,
      liquidationRisk: false,
    };
  }

  const healthFactor = Decimal.from(summary.healthFactor);
  const liquidationRisk = healthFactor.lte(1) && healthFactor.gt(0);

  const borrowed = Decimal.from(summary.totalBorrowsUsd);
  const collateralRatio = borrowed.eq(0)
    ? Decimal.INFINITY
    : Decimal.from(summary.totalCollateralUsd).div(borrowed);

  return {
    ltv: Decimal.from(summary.currentLoanToValue).mul(100),
    collateralRatio,
    liquidationRisk,
  };
};

const EfficiencyModeDialogForm = () => {
  const { pool } = useLoaderDeps({ from: '/money-market' });
  const { address } = useAccount();

  const { eModes } = useMoneyMarketReserves({
    pool: pool || 'default',
  });

  const { summary } = useMoneyMarketPositions({
    pool: pool || 'default',
    address: address!,
  });

  const currentCategoryId = useMemo(
    () => summary?.userEmodeCategoryId ?? 0,
    [summary],
  );
  const currentCategory = useMemo(
    () => eModes.find((c) => c.id === currentCategoryId),
    [eModes, currentCategoryId],
  );

  const emodeSummary = normalizeEmodeSummary(summary!, currentCategoryId);
  const emodeThen = normalizeEmodeSummary(summary!, 0);

  const { begin } = useSlayerTx({
    onClosed: (ok: boolean) => {
      console.log('borrow tx modal closed, success:', ok);
      if (ok) {
        // close borrowing dialog if tx was successful
        borrowRequestStore.getState().reset();
      }
    },
    onCompleted: () => {
      // revalidateQuery({
      //   queryKey: [
      //     'money-market:positions',
      //     reserve.pool.id || 'default',
      //     address,
      //   ],
      // });
    },
  });

  const form = useAppForm({
    defaultValues: {
      mode: currentCategoryId,
    },
    onSubmit: ({ value }) => {
      // begin(() =>
      //   sdk.moneyMarket.borrow(
      //     reserve,
      //     value.amount,
      //     data?.position.borrowRateMode ?? BORROW_RATE_MODES.variable,
      //     {
      //       account: address!,
      //     },
      //   ),
      // );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  // const handleEscapes = (e: Event) => {
  //   e.preventDefault();
  // };

  // const calculateLiquidationPrice = useCallback(
  //   (amount: string) => {
  //     if (!data || Decimal.from(data.summary.collateralBalanceUsd).eq(0)) {
  //       return Decimal.INFINITY;
  //     }

  //     return Decimal.from(
  //       Decimal.from(amount || '0').mul(data.position.reserve.priceUsd),
  //     )
  //       .mul(data.summary.currentLiquidationThreshold)
  //       .div(data.summary.collateralBalanceUsd);
  //   },
  //   [data],
  // );

  // const computeHealthFactor = useCallback(
  //   (amount: string) => {
  //     if (!data || Decimal.from(data.summary.totalBorrowsUsd).eq(0)) {
  //       return Decimal.INFINITY;
  //     }

  //     return Decimal.from(data.summary.collateralBalanceUsd)
  //       .mul(data.summary.currentLiquidationThreshold)
  //       .div(
  //         Decimal.from(data.summary.totalBorrowsUsd).add(
  //           Decimal.from(amount || '0').mul(data.position.reserve.priceUsd),
  //         ),
  //       );
  //   },
  //   [data],
  // );

  return (
    <form onSubmit={handleSubmit} id={form.formId}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Efficiency Mode</DialogTitle>
          <DialogDescription>emode: {pool}</DialogDescription>
        </DialogHeader>
        {summary?.userEmodeCategoryId} // {currentCategoryId} -{' '}
        {currentCategory?.label || 'None'}
        <p>ltv: {emodeSummary.ltv.toString()}</p>
        <p>collateralRatio: {emodeSummary.collateralRatio.toString()}</p>
        <p>liquidationRisk: {emodeSummary.liquidationRisk.toString()}</p>
        <p>--- Previous ---</p>
        <p>ltv: {emodeThen.ltv.toString()}</p>
        <p>collateralRatio: {emodeThen.collateralRatio.toString()}</p>
        <p>liquidationRisk: {emodeThen.liquidationRisk.toString()}</p>
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

  // return (
  //   <form onSubmit={handleSubmit} id={form.formId}>
  //     <DialogContent
  // onInteractOutside={handleEscapes}
  // onEscapeKeyDown={handleEscapes}
  // onOpenAutoFocus={(e) => e.preventDefault()}
  //     >
  //       <DialogHeader>
  //         <DialogTitle>Borrow Asset</DialogTitle>
  //         <DialogDescription className="sr-only">
  //           Borrowing functionality is under development.
  //         </DialogDescription>
  //       </DialogHeader>
  //       <form.AppField name="amount">
  //         {(field) => (
  //           <>
  //             <field.AmountField
  //               label="Amount to Borrow"
  //               balance={{
  //                 value: Decimal.from(
  //                   data?.position.availableToBorrow ?? '0',
  //                 ).toBigInt(),
  //                 decimals: data?.position.token.decimals || 18,
  //                 symbol: data?.position.token.symbol || '',
  //               }}
  //               placeholder="Amount to borrow"
  //               addonRight={data?.position.token.symbol}
  //             />
  //           </>
  //         )}
  //       </form.AppField>

  //       <form.Subscribe
  //         selector={(state) =>
  //           [
  //             state.values.amount,
  //             computeHealthFactor(state.values.amount ?? 0),
  //           ] as const
  //         }
  //       >
  //         {([amount, healthFactor]) => (
  //           <ItemGroup>
  //             <Item size="sm" variant="outline">
  //               <ItemContent>
  //                 <ItemContent>
  //                   <div className="flex flex-row justify-between">
  //                     <div>Collateral Ratio</div>
  //                     <AmountRenderer
  //                       value={healthFactor.mul(100).toNumber().toFixed(8)}
  //                       suffix="%"
  //                       showApproxSign
  //                     />
  //                   </div>
  //                 </ItemContent>
  //                 <ItemDescription>
  //                   <HealthFactorBar
  //                     value={healthFactor.toNumber()}
  //                     options={{
  //                       start: 1,
  //                       middleStart: MINIMUM_HEALTH_FACTOR,
  //                       middleEnd: 1.5,
  //                       end: 2,
  //                     }}
  //                   />
  //                 </ItemDescription>
  //               </ItemContent>
  //             </Item>
  //             <Item size="sm" className="mt-2 py-1">
  //               <ItemContent>Borrow APY</ItemContent>
  //               <ItemContent>
  //                 <AmountRenderer
  //                   value={
  //                     data?.position.borrowRateMode ===
  //                     BORROW_RATE_MODES.variable
  //                       ? (data?.position.reserve.variableBorrowApy ?? '0')
  //                       : (data?.position.reserve.stableBorrowApy ?? '0')
  //                   }
  //                   suffix="%"
  //                   showApproxSign
  //                 />
  //               </ItemContent>
  //             </Item>
  //             <Item size="sm" className="py-1">
  //               <ItemContent>Liquidation price</ItemContent>
  //               <ItemContent>
  //                 <AmountRenderer
  //                   value={calculateLiquidationPrice(amount).toString()}
  //                   showApproxSign
  //                   prefix="$"
  //                 />
  //               </ItemContent>
  //             </Item>
  //             <Item size="sm" className="py-1">
  //               <ItemContent>{data?.position.token.symbol} Price</ItemContent>
  //               <ItemContent>
  //                 <AmountRenderer
  //                   value={data?.position.reserve.priceUsd ?? '0'}
  //                   prefix="$"
  //                   showApproxSign
  //                 />
  //               </ItemContent>
  //             </Item>
  //           </ItemGroup>
  //         )}
  //       </form.Subscribe>

  //       <form.AppField name="agree">
  //         {(field) => (
  //           <field.CheckBox label="I understand that my collateral may be liquidated or used to pay rollover fees if applicable." />
  //         )}
  //       </form.AppField>

  //       <DialogFooter>
  //         <DialogClose asChild>
  //           <Button variant="secondary" type="button">
  //             Close
  //           </Button>
  //         </DialogClose>
  //         <form.AppForm>
  //           <form.SubscribeButton label="Submit" />
  //         </form.AppForm>
  //       </DialogFooter>
  //     </DialogContent>
  //   </form>
  // );
};

export const EfficiencyModeDialog = () => {
  const isOpen = useStoreWithEqualityFn(
    efficiencyModeRequestStore,
    (state) => state.active,
  );

  const handleClose = (open: boolean) => {
    if (!open) {
      efficiencyModeRequestStore.getState().reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {isOpen && <EfficiencyModeDialogForm />}
    </Dialog>
  );
};
