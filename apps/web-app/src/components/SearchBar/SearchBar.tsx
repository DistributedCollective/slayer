import { Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { IPool } from '../Lend/components/AssetsTable/AssetsTable.types';
import { Input } from '../ui/input';

type SearchBarProps = {
  assets: IPool[];
  onSearch: (filteredAssets: IPool[]) => void;
};

export const SearchBar: React.FC<SearchBarProps> = ({ assets, onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchQuery = e.target.value;
      setQuery(searchQuery);

      const filteredAssets = assets.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      onSearch(filteredAssets);
    },
    [assets, onSearch],
  );

  return (
    <div className="relative flex items-center w-full lg:max-w-60">
      <Search className="absolute left-3 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Search by name, symbol"
        className="pl-10 pr-4 py-2 dark:bg-neutral-600 h-10 rounded-[0.5rem] w-full placeholder:text-gray-50/50"
        value={query}
        onChange={handleSearch}
      />
    </div>
  );
};
