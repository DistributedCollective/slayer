import { Link, linkOptions } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const items = linkOptions([
  // {
  //   to: '/',
  //   label: 'Home',
  //   activeOptions: { exact: true },
  // },
  {
    to: '/convert',
    label: 'Convert',
  },
  {
    to: '/lend',
    label: 'Lend',
  },
  {
    to: '/stake',
    label: 'Stake',
  },
  {
    to: '/demo/tanstack-query',
    label: 'TanStack Query',
  },
  {
    to: '/demo/form/simple',
    label: 'Simple form',
  },
  {
    to: '/demo/form/address',
    label: 'Address form',
  },
]);

export const Links = () => {
  const main = useMemo(() => items.slice(0, 3), [items]);
  const others = useMemo(() => items.slice(3), [items]);
  return (
    <div>
      <nav className="flex flex-row gap-3">
        {main.map((item) => (
          <Link
            to={item.to}
            className="px-4 py-2 rounded-xl font-medium"
            activeProps={{
              className:
                'bg-slate-100 text-slate-900 hover:bg-slate-300 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200',
            }}
            inactiveProps={{
              className:
                'hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            }}
            key={item.to}
          >
            {item.label}
          </Link>
        ))}
        {items.length > 3 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 rounded-xl font-medium hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 flex flex-row items-center gap-2">
                More <ChevronDown />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {others.map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  <Link
                    to={item.to}
                    activeProps={{
                      className:
                        'bg-slate-100 text-slate-900 dark:bg-slate-100 dark:text-slate-900',
                    }}
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
    </div>
  );
};
