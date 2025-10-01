import { Card, CardContent } from '@/components/ui/card';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  { date: '2025-07-01', apr: 3.4, volume: 0.01 },
  { date: '2025-07-10', apr: 9.1, volume: 0.02 },
  { date: '2025-07-20', apr: 8.2, volume: 0.0 },
  { date: '2025-08-01', apr: 8.5, volume: 0.03 },
  { date: '2025-08-15', apr: 8.0, volume: 0.0 },
  { date: '2025-09-01', apr: 8.7, volume: 0.05 },
  { date: '2025-09-20', apr: 7.9, volume: 0.15 },
];

export default function PoolDetails() {
  return (
    <div className="flex items-center justify-between m-4 w-full">
      <Card>
        <CardContent>
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
        </CardContent>
      </Card>
      <div className="w-full h-[500px] bg-muted rounded-xl p-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#999" />
            <YAxis
              yAxisId="left"
              stroke="#999"
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#999"
              tickFormatter={(v) => `${v} BTC`}
            />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="apr"
              stroke="#ccc"
              strokeWidth={2}
              dot={false}
              name="APR"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="volume"
              stroke="#ff7300"
              strokeWidth={2}
              dot={false}
              name="24h Volume (BTC)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
