import { Accordion } from '@/components/ui/accordion';
import type { MoneyMarketPoolReserve } from '@sovryn/slayer-sdk';
import { useState, type FC } from 'react';
import { AssetsTable } from './components/AssetsTable/AssetsTable';

type BorrowAssetsListProps = {
  borrowAssets: MoneyMarketPoolReserve[];
  loading?: boolean;
};

export const BorrowAssetsList: FC<BorrowAssetsListProps> = ({
  borrowAssets,
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
      <AssetsTable assets={borrowAssets} />
    </Accordion>
  );
};
