import type { MoneyMarketPoolReserve } from '@sovryn/slayer-sdk';
import { createStore } from 'zustand';
import { combine } from 'zustand/middleware';

type State = {
  reserve: MoneyMarketPoolReserve | null;
};

type Actions = {
  setReserve: (reserve: MoneyMarketPoolReserve) => void;
  reset: () => void;
};

type LendRequestStore = State & Actions;

export const lendRequestStore = createStore<LendRequestStore>(
  combine(
    {
      reserve: null as MoneyMarketPoolReserve | null,
    },
    (set) => ({
      setReserve: (reserve: MoneyMarketPoolReserve) => set({ reserve }),
      reset: () => set({ reserve: null }),
    }),
  ),
);
