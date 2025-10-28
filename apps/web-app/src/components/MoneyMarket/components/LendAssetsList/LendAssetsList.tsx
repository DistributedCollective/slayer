import { Accordion } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCallback, useMemo, useState, type FC } from 'react';
import type { LendAsset } from './LendAssetsList.types';
import { AssetsTable } from './components/AssetsTable/AssetsTable';

type LendPAssetsListProps = {
  lendAssets: LendAsset[];
  loading?: boolean;
};

export const LendAssetsList: FC<LendPAssetsListProps> = ({ lendAssets }) => {
  const [open, setOpen] = useState(false);
  const [showZeroBalances, setShowZeroBalances] = useState(false);

  const handleShowBalances = useCallback(
    () => setShowZeroBalances((prevState) => !prevState),
    [],
  );

  const filteredAssets = useMemo(
    () =>
      showZeroBalances
        ? lendAssets
        : lendAssets.filter(
            ({ balance }) => parseFloat(balance.replace(/,/g, '')) > 0,
          ),
    [lendAssets, showZeroBalances],
  );

  return (
    <Accordion
      label={<span className="text-[1rem] font-medium">Assets to supply</span>}
      className="px-4 py-3 space-y-3 lg:p-6 border border-neutral-700"
      labelClassName="justify-between h-7 flex items-center"
      open={open}
      onClick={setOpen}
    >
      <div className="mb-2 lg:mb-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="zeroBalances"
            onCheckedChange={handleShowBalances}
            checked={showZeroBalances}
            defaultChecked
          />
          <Label
            htmlFor="zeroBalances"
            className="text-xs font-medium text-gray-50 cursor-pointer"
          >
            Show zero balances
          </Label>
        </div>
      </div>

      <AssetsTable assets={filteredAssets} />
    </Accordion>
  );
};
