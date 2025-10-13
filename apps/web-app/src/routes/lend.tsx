import { Hero } from '@/components/Hero/Hero';
import { AssetsTable } from '@/components/Lend/components/AssetsTable/AssetsTable';
import type { IAsset } from '@/components/Lend/components/AssetsTable/AssetsTable.types';
import { assets, tabClassName } from '@/components/Lend/Lend.constants';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { StatsCard } from '@/components/StatsCard/StatsCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

export const Route = createFileRoute('/lend')({
  component: RouteComponent,
});

function RouteComponent() {
  const [filteredAssets, setFilteredAssets] = useState(assets);
  console.log(filteredAssets);

  const handleSearch = useCallback((filteredAssets: IAsset[]) => {
    setFilteredAssets(filteredAssets);
  }, []);
  return (
    <div className="container mx-auto my-8 px-4 max-w-6xl">
      <Hero title="Lending" className="mb-3">
        <p>
          Lorem bitcoinae dollar situs ametus, consensusium adipiscing elitum,
          sed do proofus-of-workium.{' '}
          <Link
            className="text-neutral-50 hover:no-underline underline"
            to="/stake"
          >
            Learn more
          </Link>
        </p>
      </Hero>

      <div className="flex items-center gap-10 mb-9">
        <Button
          variant="default"
          className="text-sm bg-slate-100 text-[#0F172A] hover:bg-slate-200 cursor-pointer rounded-full"
        >
          Guide
        </Button>
        <Link
          className="text-orange-600 hover:underline no-underline text-sm"
          to="/stake"
        >
          Learn more
        </Link>
      </div>

      <div className="mt-10 flex items-center gap-4 lg:flex-row flex-col w-full">
        <StatsCard
          title="Net worth"
          value="$1,234,567.89"
          percent="+12.1% from last week"
        />
        <StatsCard
          title="Net APY"
          value="11.69%"
          percent="+12.1% from last week"
          tooltip="Net APY - The annual percentage yield (APY) is the real rate of return earned on an investment, taking into account the effect of compounding interest."
        />
        <StatsCard
          title="Collateral Ratio"
          value="200%"
          percent="+12.1% from last week"
          tooltip="Collateral Ratio - The ratio of the value of your collateral to the value of your loan. A higher collateral ratio means you have more collateral than you need to cover your loan."
        />
      </div>

      <Tabs defaultValue="assets" className="mt-10">
        <div className="flex justify-between items-center w-full flex-col-reverse lg:flex-row gap-4">
          <TabsList className="flex bg-transparent gap-3">
            <TabsTrigger value="assets" className={tabClassName}>
              Assets to lend
            </TabsTrigger>
            <TabsTrigger value="dashboard" className={tabClassName}>
              Dashboard
            </TabsTrigger>
          </TabsList>
          <SearchBar assets={assets} onSearch={handleSearch} />
        </div>

        <TabsContent value="assets">
          <div className="mt-6">
            <AssetsTable assets={filteredAssets} />
          </div>
        </TabsContent>

        <TabsContent value="dashboard">
          <div className="mt-6">
            <div>Dashboard content goes here...</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
