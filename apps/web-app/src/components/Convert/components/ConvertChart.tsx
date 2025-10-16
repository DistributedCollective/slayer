'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bitcoin } from 'lucide-react';
import { useState, type FC } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const data = [
  { date: 'Sep 16', value: 620000000 },
  { date: 'Sep 17', value: 580000000 },
  { date: 'Sep 18', value: 610000000 },
  { date: 'Sep 19', value: 480000000 },
  { date: 'Sep 20', value: 450000000 },
  { date: 'Sep 21', value: 200000000 },
  { date: 'Sep 22', value: 300000000 },
  { date: 'Sep 23', value: 465123743 },
];

export const CryptoChart: FC = () => {
  const [activeRange, setActiveRange] = useState('1W');
  const ranges = ['24H', '1W', '1M', '1Y'];

  return (
    <Card className="dark:bg-neutral-900 bg-neutral-100 text-white border-0 rounded-2xl">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-[#f7931a] p-1.5 rounded-full">
                <Bitcoin className="h-4 w-4" />
              </div>
              <span className="font-medium text-base">BTC / BOS</span>
            </div>
            <div className="text-3xl font-semibold mt-2">1,234,567.12</div>
            <div className="text-sm text-gray-400">Sept 23, 2025</div>
          </div>

          <div className="flex gap-1">
            {ranges.map((range) => (
              <Button
                key={range}
                size="sm"
                variant="ghost"
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  activeRange === range
                    ? 'bg-[#2a2a2a] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff6600" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#ff6600" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                stroke="#333"
                tick={{ fill: '#555', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#333"
                tick={{ fill: '#555', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                }
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#ff6600"
                strokeWidth={2}
                fill="url(#colorValue)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
