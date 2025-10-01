import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function DepositDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [dllr, setDllr] = useState('');
  const [btc, setBtc] = useState('');
  const [agree, setAgree] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>AMM pool deposit</DialogTitle>
        </DialogHeader>

        <div className="p-4 rounded-md bg-muted">
          <div className="flex justify-between mb-2">
            <span className="font-medium">DLLR/BTC</span>
            <span className="text-sm text-muted-foreground">
              Up to 0.16% APR
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Current balance</span>
            <span>0 DLLR / 0 BTC</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="mb-1">Amount (DLLR)</Label>
            <Input
              type="number"
              placeholder="0 DLLR"
              value={dllr}
              onChange={(e) => setDllr(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1">Amount (BTC)</Label>
            <Input
              type="number"
              placeholder="0 BTC"
              value={btc}
              onChange={(e) => setBtc(e.target.value)}
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground p-4 rounded-md bg-muted">
          <div className="flex justify-between">
            <span>New pool balance</span>
            <span>N/A</span>
          </div>
          <div className="flex justify-between">
            <span>Weekly rewards estimation</span>
            <span>N/A</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="risk"
            checked={agree}
            onCheckedChange={(checked) => setAgree(!!checked)}
          />
          <label htmlFor="risk" className="text-sm leading-none cursor-pointer">
            I understand that my deposit will be at risk of divergence loss as
            the price of each asset changes.
          </label>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={!agree || (!dllr && !btc)}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
