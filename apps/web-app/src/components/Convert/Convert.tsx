import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownUp, Info, Settings } from 'lucide-react';
import { useState } from 'react';
import { Hero } from '../Hero/Hero';

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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Hero title="Convert">
        Lorem bitcoinae dollar situs ametus, consensusium adipiscing elitum, sed
        do proofus-of-workium.
      </Hero>

      <div className="grid grid-cols-12 gap-6 px-6 py-12">
        <div className="flex flex-col gap-6 col-span-12 lg:col-span-4 lg:col-start-5">
          <Card className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-center">
                Convert
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Tabs defaultValue="convert" className="flex-1">
                  <TabsList className="flex bg-neutral-800 rounded-full p-1 w-full max-w-md mx-auto">
                    <TabsTrigger
                      value="convert"
                      className="flex-1 rounded-full data-[state=active]:bg-neutral-700 data-[state=active]:text-[#FF6228] text-neutral-400"
                    >
                      Convert
                    </TabsTrigger>
                    <TabsTrigger
                      value="cross"
                      className="flex-1 rounded-full data-[state=active]:bg-neutral-700 data-[state=active]:text-[#FF6228] text-neutral-400"
                    >
                      Cross-chain convert
                    </TabsTrigger>
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
                <div className="p-4 bg-neutral-800 rounded-xl">
                  <Label>From</Label>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <Select value={fromAsset} onValueChange={setFromAsset}>
                        <SelectTrigger className="w-28 bg-neutral-700 border-none">
                          <SelectValue placeholder="Token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-neutral-500">
                        Balance -
                      </span>
                    </div>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.012"
                      className="w-24 bg-transparent border-none text-right text-lg font-medium focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button variant="ghost" size="icon" onClick={handleSwap}>
                    <ArrowDownUp className="h-5 w-5 text-neutral-400" />
                  </Button>
                </div>

                <div className="p-4 bg-neutral-800 rounded-xl">
                  <Label>To</Label>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <Select value={toAsset} onValueChange={setToAsset}>
                        <SelectTrigger className="w-28 bg-neutral-700 border-none">
                          <SelectValue placeholder="Token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-neutral-500">
                        Balance -
                      </span>
                    </div>
                    <Input
                      type="number"
                      value="0.012"
                      readOnly
                      className="w-24 bg-transparent border-none text-right text-lg font-medium focus-visible:ring-0"
                    />
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
              </CardContent>
            </div>
          </Card>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-2 text-sm text-neutral-400">
            <div className="flex justify-between">
              <span>You’ll receive</span>
              <span className="text-neutral-100">0.004 XYZ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                Estimated network fee <Info className="w-3 h-3" />
              </span>
              <span className="text-neutral-100">0.004 XYZ</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction fee</span>
              <span className="text-neutral-100">0.004 XYZ</span>
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
    </div>
  );
}
