'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState, type FC } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  { date: 'Sep 16', value: 620000 },
  { date: 'Sep 17', value: 580000 },
  { date: 'Sep 18', value: 610000 },
  { date: 'Sep 19', value: 480000 },
  { date: 'Sep 20', value: 450000 },
  { date: 'Sep 21', value: 200000 },
  { date: 'Sep 22', value: 300000 },
  { date: 'Sep 23', value: 465123 },
];

export const CryptoChart: FC = () => {
  const [activeRange, setActiveRange] = useState('1W');
  const ranges = ['24H', '1W', '1M', '1Y'];

  return (
    <Card className="bg-neutral-900 border-0 rounded-2xl pt-4 pb-7">
      <CardContent className="px-7">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <img className="size-8 rounded-full" src="/images/btc.svg" />
                <img
                  className="size-8 rounded-full -ml-2"
                  src="/images/bob.svg"
                />
              </div>
              <span className="font-medium text-lg text-gray-50">
                BTC / BOS
              </span>
            </div>
            <div className="text-lg font-semibold text-gray-50 pl-1">
              1,234,567.12
            </div>
            <div className="text-sm font-medium text-gray-500 pl-1">
              Sept 23, 2025
            </div>
          </div>

          <div className="flex gap-1">
            {ranges.map((range) => (
              <Button
                key={range}
                size="sm"
                variant="ghost"
                className={cn(
                  'cursor-pointer px-3 py-1.5 text-xs transition-colors text-white rounded-sm',
                  {
                    'bg-neutral-700': activeRange === range,
                  },
                )}
                onClick={() => setActiveRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4500" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#FF4500" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                stroke="none"
                tick={{ fill: '#6B7280', fontSize: 12, textAnchor: 'start' }}
                tickLine={false}
                axisLine={false}
                interval={0}
                padding={{ left: 10, right: 10 }}
              />

              <YAxis
                orientation="right"
                stroke="none"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={50}
                tickFormatter={(v) =>
                  v === 0
                    ? ''
                    : v.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                }
                padding={{ top: 10, bottom: 10 }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#FF4500"
                strokeWidth={2}
                fill="url(#colorValue)"
                dot={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                  borderRadius: '4px',
                }}
                labelStyle={{ color: '#999' }}
                formatter={(value) =>
                  value.toLocaleString('en-US', { minimumFractionDigits: 2 })
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
