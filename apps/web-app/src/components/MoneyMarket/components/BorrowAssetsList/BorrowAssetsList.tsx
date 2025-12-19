import { Accordion } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { MoneyMarketPoolReserve } from '@sovryn/slayer-sdk';
import { CircleAlert } from 'lucide-react';
import { useState, type FC } from 'react';
import { AssetsTable } from './components/AssetsTable/AssetsTable';

type BorrowAssetsListProps = {
  borrowAssets: MoneyMarketPoolReserve[];
  eModesCategoryId?: number;
  loading?: boolean;
};

export const BorrowAssetsList: FC<BorrowAssetsListProps> = ({
  borrowAssets,
  eModesCategoryId,
}) => {
  const [open, setOpen] = useState(true);
  return (
    <Accordion
      label={<span className="text-[1rem] font-medium">Assets to borrow</span>}
      className="px-4 py-3 space-y-3 lg:p-6 border border-neutral-700"
      labelClassName="justify-between h-7 flex items-center"
      open={open}
      onClick={setOpen}
    >
      {eModesCategoryId && (
        <Alert>
          <CircleAlert />
          <AlertDescription>
            In E-Mode some assets are not borrowable. Exit E-Mode to get access
            to all assets.
          </AlertDescription>
        </Alert>
      )}

      <AssetsTable assets={borrowAssets} />
    </Accordion>
  );
};
