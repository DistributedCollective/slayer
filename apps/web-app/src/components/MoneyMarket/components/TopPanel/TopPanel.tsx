import type { FC } from 'react';
import { StatisticsCard } from '../StatisticsCard/StatisticsCard';

type TopPanelProps = {
  netWorth: number;
  netApy: number;
  healthFactor: number;
};

export const TopPanel: FC<TopPanelProps> = ({
  netApy,
  netWorth,
  healthFactor,
}) => (
  <div className="w-full flex flex-col gap-6">
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="flex flex-col gap-4 md:py-12 md:flex-row md:gap-9 flex-shrink-0">
        <StatisticsCard
          label="Net Worth"
          value={<span className="text-2xl">${netWorth.toFixed(2)}</span>}
        />
        <div className="flex gap-9">
          <StatisticsCard
            label="Net APY"
            value={<span className="text-2xl">{netApy.toFixed(2)}%</span>}
            help="Net APY is the combined effect of all supply and borrow positions on net worth, including incentives. It is possible to have a negative net APY if debt APY is higher than supply APY."
          />
          <StatisticsCard
            label="Health Factor"
            value={<span className="text-2xl">{healthFactor.toFixed(2)}</span>}
          />
        </div>
      </div>
    </div>
  </div>
);
