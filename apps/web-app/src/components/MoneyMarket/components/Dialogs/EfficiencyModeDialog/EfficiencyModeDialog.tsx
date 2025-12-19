import { useMoneyMarketReserves } from '@/components/MoneyMarket/hooks/use-money-reserves';
import { efficiencyModeRequestStore } from '@/components/MoneyMarket/stores/efficiency-mode-request.store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AmountRenderer } from '@/components/ui/amount-renderer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Item, ItemContent, ItemGroup } from '@/components/ui/item';
import { useAppForm } from '@/hooks/app-form';
import { revalidateQuery } from '@/integrations/tanstack-query/root-provider';
import { sdk } from '@/lib/sdk';
import { useSlayerTx } from '@/lib/transactions';
import { Decimal } from '@sovryn/slayer-shared';
import { useStore } from '@tanstack/react-form';
import { useLoaderDeps } from '@tanstack/react-router';
import { CircleAlert } from 'lucide-react';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { useMoneyMarketPositions } from '../../../hooks/use-money-positions';

const DISABLED_EMODE_CATEGORY_ID = '0';

const EfficiencyModeDialogForm = () => {
  const { pool } = useLoaderDeps({ from: '/money-market' });
  const { address } = useAccount();

  const { eModes, reserves } = useMoneyMarketReserves({
    pool: pool || 'default',
  });

  const { summary, positions } = useMoneyMarketPositions({
    pool: pool || 'default',
    address: address!,
  });

  const currentCategoryId = useMemo(
    () => String(summary?.userEmodeCategoryId ?? DISABLED_EMODE_CATEGORY_ID),
    [summary],
  );

  const { begin } = useSlayerTx({
    onClosed: (ok: boolean) => {
      console.log('borrow tx modal closed, success:', ok);
      if (ok) {
        efficiencyModeRequestStore.getState().reset();
      }
    },
    onCompleted: () => {
      revalidateQuery({
        queryKey: ['money-market:positions', pool || 'default', address],
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      mode: currentCategoryId,
    },
    onSubmit: ({ value }) => {
      begin(() =>
        sdk.moneyMarket.changeEfficiencyMode(
          reserves[0].pool,
          Number(value.mode),
          {
            account: address!,
          },
        ),
      );
    },
  });

  const selectedCategoryId = useStore(form.store, (state) => state.values.mode);

  const selectedCategory = useMemo(
    () => eModes.find((c) => c.id.toString() === selectedCategoryId),
    [eModes, selectedCategoryId],
  );

  const hasLoansInOutsideCategory = useMemo(
    () =>
      selectedCategoryId !== DISABLED_EMODE_CATEGORY_ID &&
      positions.some(
        (item) =>
          item.reserve.eModeCategoryId !== Number(selectedCategoryId) &&
          Decimal.from(item.borrowed).gt(0),
      ),
    [positions, selectedCategoryId],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const handleEscapes = (e: Event) => {
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
          <DialogTitle>Efficiency Mode</DialogTitle>
        </DialogHeader>
        <form.AppField name="mode">
          {(field) => (
            <field.Select
              label="E-Mode Category"
              values={[
                {
                  label: 'Disabled',
                  value: DISABLED_EMODE_CATEGORY_ID,
                },
                ...eModes.map((category) => ({
                  label: category.label,
                  value: category.id.toString(),
                })),
              ]}
            />
          )}
        </form.AppField>

        {selectedCategory &&
          selectedCategory.id.toString() !== DISABLED_EMODE_CATEGORY_ID && (
            <>
              <ItemGroup>
                <Item size="sm" className="py-1">
                  <ItemContent>Available assets:</ItemContent>
                  <ItemContent>
                    {selectedCategory.assets
                      .map((token) => token.symbol)
                      .join(', ')}
                  </ItemContent>
                </Item>
                <Item size="sm" className="py-1">
                  <ItemContent>Max Loan to value:</ItemContent>
                  <ItemContent>
                    <AmountRenderer
                      value={selectedCategory.ltv.toString()}
                      suffix="%"
                      showApproxSign
                    />
                  </ItemContent>
                </Item>
              </ItemGroup>

              {hasLoansInOutsideCategory ? (
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertDescription>
                    To enable E-mode for the {selectedCategory.label} category,
                    all borrow positions outside of this category must be
                    closed.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CircleAlert />
                  <AlertDescription>
                    Enabling E-Mode only allows you to borrow assets belonging
                    to the selected category!
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" type="button">
              Close
            </Button>
          </DialogClose>
          <form.AppForm>
            <form.SubscribeButton
              label="Submit"
              disabled={
                currentCategoryId === selectedCategoryId ||
                hasLoansInOutsideCategory
              }
            />
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </form>
  );
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
