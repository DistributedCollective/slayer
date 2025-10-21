import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BOB, BTC, USDT } from '@/constants/tokens';
import type { FC } from 'react';

interface AssetSelectProps {
  value?: string;
  onChange?(value: string): void;
}

export const AssetSelect: FC<AssetSelectProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="shadow-none w-36 border-none text-lg cursor-pointer h-5 pl-0">
        <SelectValue placeholder="Token" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem className="text-lg" value={BTC}>
          <img className="size-8 rounded-full" src="/images/btc.svg" />
          {BTC}
        </SelectItem>
        <SelectItem className="text-lg" value={BOB}>
          <img className="size-8 rounded-full" src="/images/bob.svg" />
          {BOB}
        </SelectItem>
        <SelectItem className="text-lg" value={USDT}>
          <img className="size-8 rounded-full" src="/images/btc.svg" />
          {USDT}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
