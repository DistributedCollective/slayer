import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownUp, Info, Settings } from 'lucide-react';
import { useState } from 'react';
import { Hero } from '../Hero/Hero';
import AssetSelect from './components/AssetSelect';

export default function Convert() {
  const [fromAsset, setFromAsset] = useState('BTC');
  const [toAsset, setToAsset] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [showChart, setShowChart] = useState(false);

  const handleSwap = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="flex flex-col gap-6 col-span-12 lg:col-span-4 lg:col-start-5">
        <Hero title="Convert">
          Lorem bitcoinae dollar situs ametus, consensusium adipiscing elitum,
          sed do proofus-of-workium.
        </Hero>
        <Card className="dark:bg-neutral-900 bg-neutral-100 border dark:border-neutral-800 rounded-2xl shadow-lg py-3">
          <CardContent className="space-y-4 px-3">
            <div className="flex items-center justify-between">
              <Tabs defaultValue="convert" className="flex-1">
                <TabsList className="flex items-center bg-neutral-200 dark:bg-neutral-800 rounded-full p-1 w-full max-w-md mx-auto">
                  <TabsTrigger value="convert">Convert</TabsTrigger>
                  <TabsTrigger value="cross">Cross-chain convert</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-neutral-400 hover:text-white"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="p-4 dark:bg-neutral-800 bg-neutral-200 rounded-xl">
                <Label className="text-neutral-400">From</Label>
                <div className="flex justify-between items-center mt-2">
                  <AssetSelect value={fromAsset} onChange={setFromAsset} />
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.012"
                    className="w-24 bg-transparent border-none text-right text-2xl font-medium focus-visible:ring-0
             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-neutral-500">Balance -</span>
                  <span className="text-sm text-neutral-500">$100.012</span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  className="bg-accent"
                  variant="ghost"
                  size="icon"
                  onClick={handleSwap}
                >
                  <ArrowDownUp className="h-5 w-5 text-neutral-400" />
                </Button>
              </div>

              <div className="p-4 dark:bg-neutral-800 bg-neutral-200 rounded-xl">
                <Label className="text-neutral-400">To</Label>
                <div className="flex justify-between items-center mt-2">
                  <AssetSelect value={toAsset} onChange={setToAsset} />

                  <Input
                    type="number"
                    value="0.012"
                    readOnly
                    className="w-24 bg-transparent border-none text-right text-lg font-medium focus-visible:ring-0"
                  />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-neutral-500">Balance -</span>
                  <span className="text-sm text-neutral-500">$100.012</span>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2">
                <Label htmlFor="chart" className="text-sm text-neutral-400">
                  Show chart
                </Label>
                <Switch
                  checked={showChart}
                  id="chart"
                  onCheckedChange={setShowChart}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="rounded-xl dark:bg-neutral-900 bg-neutral-100 border dark:border-neutral-800 p-4 space-y-2 text-sm text-neutral-400">
          <div className="flex justify-between">
            <span>You’ll receive</span>
            <span className="dark:text-neutral-100">0.004 XYZ</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              Estimated network fee <Info className="w-3 h-3" />
            </span>
            <span className="dark:text-neutral-100">0.004 XYZ</span>
          </div>
          <div className="flex justify-between">
            <span>Transaction fee</span>
            <span className="dark:text-neutral-100">0.004 XYZ</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-sm">
              Accept terms and condition
            </Label>
          </div>
          <p className="text-xs text-neutral-500">
            You agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-base font-medium py-6 rounded-xl">
          Convert
        </Button>
      </div>
    </div>
  );
}
