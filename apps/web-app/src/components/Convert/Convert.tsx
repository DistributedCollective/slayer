import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowDownUp, Info, Settings } from 'lucide-react';
import { useState, type FC } from 'react';
import { Hero } from '../Hero/Hero';
import { AssetSelect } from './components/AssetSelect';
import { CryptoChart } from './components/ConvertChart';

export const Convert: FC = () => {
  const search = useSearch({ from: '/convert' });
  const navigate = useNavigate({ from: '/convert' });

  const [fromAsset, setFromAsset] = useState('BTC');
  const [toAsset, setToAsset] = useState('BTC');
  const [amount, setAmount] = useState('1');

  const showChart = search.showChart === true;

  const toggleChart = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        showChart: prev.showChart ? undefined : true,
      }),
      replace: true,
    });
  };

  const handleSwap = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6 justify-center">
        <Hero className="w-full lg:w-1/3" title="Convert">
          Lorem bitcoinae dollar situs ametus, consensusium adipiscing elitum,
          sed do proofus-of-workium.
        </Hero>
        {showChart && <div className="w-full lg:w-1/2" />}
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 justify-center">
        <div className="flex flex-col gap-6 w-full lg:w-1/3">
          <Card className="bg-neutral-900 border-none rounded-2xl shadow-lg py-3">
            <CardContent className="space-y-4 px-3">
              <div className="flex items-center justify-between">
                <Tabs defaultValue="convert" className="flex-1">
                  <TabsList className="flex items-center bg-neutral-800 rounded-full p-1 w-full max-w-md mx-auto">
                    <TabsTrigger value="convert">Convert</TabsTrigger>
                    <TabsTrigger value="cross">Cross-chain convert</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <Settings className="size-6" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-neutral-800 rounded-xl flex flex-col gap-4">
                  <Label className="text-neutral-400 font-medium text-sm">
                    From
                  </Label>
                  <div className="flex justify-between items-center">
                    <AssetSelect value={fromAsset} onChange={setFromAsset} />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="flex-1 bg-transparent border-none text-right text-2xl font-semibold focus-visible:ring-0 text-white outline-none
             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex justify-between items-center text-neutral-400 font-medium text-xs">
                    <span>Balance -</span>
                    <span>$100.012</span>
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

                <div className="p-4 bg-neutral-800 rounded-xl flex flex-col gap-4">
                  <Label className="text-neutral-400 font-medium text-sm">
                    From
                  </Label>
                  <div className="flex justify-between items-center">
                    <AssetSelect value={fromAsset} onChange={setFromAsset} />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="flex-1 bg-transparent border-none text-right text-2xl font-semibold focus-visible:ring-0 text-white outline-none
             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex justify-between items-center text-neutral-400 font-medium text-xs">
                    <span>Balance -</span>
                    <span>$100.012</span>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2">
                  <Label
                    htmlFor="chart"
                    className="text-sm cursor-pointer text-gray-50 font-medium"
                  >
                    Show chart
                  </Label>
                  <Switch
                    className="cursor-pointer"
                    checked={showChart}
                    id="chart"
                    onCheckedChange={toggleChart}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="rounded-xl border border-neutral-700 p-4 space-y-2 text-xs font-medium text-gray-400">
            <div className="flex justify-between">
              <span>You’ll receive</span>
              <span>0.004 XYZ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                Estimated network fee <Info className="w-3 h-3" />
              </span>
              <span>0.004 XYZ</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction fee</span>
              <span>0.004 XYZ</span>
            </div>
          </div>

          <div className="space-y-1 mx-auto">
            <div className="flex items-center gap-2">
              <Checkbox id="terms" />
              <Label
                htmlFor="terms"
                className="text-sm font-medium text-gray-50"
              >
                Accept terms and condition
              </Label>
            </div>
            <p className="text-sm text-gray-50 pl-6">
              You agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          <Button size="lg" className="w-40 mx-auto">
            Convert
          </Button>
        </div>

        {showChart && (
          <div className="w-full lg:w-1/2">
            <CryptoChart />
          </div>
        )}
      </div>
    </div>
  );
};
