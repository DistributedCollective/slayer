import { TRANSACTION_STATE, type SlayerTx } from '@/lib/transactions/store';
import { isTransactionRequest } from '@sovryn/slayer-sdk';
import {
  CircleCheckBig,
  CircleDashed,
  CircleX,
  ExternalLink,
  Loader2Icon,
} from 'lucide-react';
import { useMemo, type FC } from 'react';
import { useChains } from 'wagmi';
import { LinkToExplorer } from '../LinkToExplorer/LinkToExplorer';

type TransactionItemProps = {
  index: number;
  item: SlayerTx;
};

export const TransactionItem: FC<TransactionItemProps> = ({ item, index }) => {
  const isTx = isTransactionRequest(item);
  const chains = useChains();
  const chain = useMemo(() => {
    if (isTx) {
      const chainId = item.request.data.chain?.id;
      return chains.find((c) => c.id === chainId);
    }
    return undefined;
  }, [chains, isTx, item.request.data]);

  return (
    <div className="flex flex-row justify-start items-start gap-4 mb-3">
      <div className="w-8 shrink-0 grow-0 text-center">
        <div className="flex flex-col items-center gap-1">
          {item.state === TRANSACTION_STATE.idle && <CircleDashed size={24} />}
          {item.state === TRANSACTION_STATE.pending && (
            <Loader2Icon className="animate-spin" size={24} />
          )}
          {item.state === TRANSACTION_STATE.success && (
            <CircleCheckBig size={24} className="text-green-500" />
          )}
          {item.state === TRANSACTION_STATE.error && (
            <CircleX size={24} className="text-red-500" />
          )}
          <div className="text-xs">#{index + 1}</div>
        </div>
      </div>
      <div className="grow">
        <p>{item.title}</p>
        <p className="text-sm">{item.description}</p>
        {isTx && chain && item.res?.transactionHash && (
          <p className="text-sm flex flex-row justify-start gap-2 items-center mt-2">
            <ExternalLink size={16} />
            <LinkToExplorer chain={chain} txHash={item.res.transactionHash} />
          </p>
        )}

        {item.error && (
          <p className="mt-2 text-xs text-red-500">{item.error}</p>
        )}
      </div>
    </div>
  );
};
