import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FC } from 'react';

export const AssetSelect: FC<{
  value?: string;
  onChange?(value: string): void;
}> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="shadow-none w-40 border-none text-lg cursor-pointer h-5">
        <SelectValue placeholder="Token" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem className="text-lg" value="BTC">
          <img className="size-6 rounded-full" src="/images/btc.png" />
          BTC
        </SelectItem>
        <SelectItem className="text-lg" value="ETH">
          <img className="size-6 rounded-full" src="/images/btc.png" />
          ETH
        </SelectItem>
        <SelectItem className="text-lg" value="USDT">
          <img className="size-6 rounded-full" src="/images/btc.png" />
          USDT
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
