import { cn } from '@/lib/utils';
import { Link, linkOptions } from '@tanstack/react-router';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useMemo, useReducer, type MouseEvent } from 'react';
import { Button } from '../ui/button';
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
    content: 'Convert assets instantly',
  },
  {
    to: '/lend',
    label: 'Lend',
    content: 'Lend assets to earn yield',
  },
  {
    to: '/stake',
    label: 'Stake',
    content: 'Stake assets to earn rewards',
  },
  {
    to: '/demo/tanstack-query',
    label: 'TanStack Query',
    content: 'Demo of TanStack Query',
  },
  {
    to: '/demo/form/simple',
    label: 'Simple form',
    content: 'Demo of Simple form',
  },
  {
    to: '/demo/form/address',
    label: 'Address form',
    content: 'Demo of Address form',
  },
]);

export const Links = () => {
  const main = useMemo(() => items.slice(0, 3), [items]);
  const others = useMemo(() => items.slice(3), [items]);

  const [isOpen, toggleMenu] = useReducer((state) => !state, false);
  const closeMenu = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    toggleMenu();
  };

  return (
    <div className="w-full lg:w-auto text-sm">
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden justify-self-start self-start"
        onClick={toggleMenu}
      >
        <Menu
          className={cn(
            '!h-[1.2rem] !w-[1.2rem] rotate-0 scale-100 transition-all',
            isOpen && '-rotate-90 scale-0',
          )}
        />
        <X
          className={cn(
            'absolute !h-[1.2rem] !w-[1.2rem] rotate-90 scale-0 transition-all',
            isOpen && 'rotate-0 scale-100',
          )}
        />
        <span className="sr-only">Toggle menu</span>
      </Button>
      {/* Mobile menu */}
      <nav
        className={cn(
          'hidden absolute bg-background p-4 top-17 left-0 right-0 z-10 flex-row flex-wrap justify-start items-center gap-4 border-t border-b border-slate-200 dark:border-slate-800 rounded-b-xl shadow-lg overflow-y-auto',
          isOpen && 'flex lg:hidden',
        )}
      >
        {items.map((item) => (
          <Link
            to={item.to}
            className="w-full px-4 py-2 rounded-xl font-medium border flex flex-col items-start justify-start shrink-0 text-sm"
            activeProps={{
              className:
                'bg-slate-100 text-slate-900 hover:bg-slate-300 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200',
            }}
            inactiveProps={{
              className:
                'hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            }}
            key={item.to}
            onClick={closeMenu}
          >
            {item.label}
            {item.content && (
              <span className="text-muted text-xs">{item.content}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Desktop menu */}
      <nav className="hidden lg:flex flex-row gap-3">
        {main.map((item) => (
          <Link
            to={item.to}
            className="px-4 py-2 rounded-xl font-medium leading-none text-sm flex items-center justify-center"
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
              <button className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 flex flex-row items-center gap-2">
                More <ChevronDown size={12} />
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
