import type { MoneyMarketPoolPosition } from '@sovryn/slayer-sdk';
import { createStore } from 'zustand';
import { combine } from 'zustand/middleware';

type State = {
  position: MoneyMarketPoolPosition | null;
};

type Actions = {
  setPosition: (position: MoneyMarketPoolPosition) => void;
  reset: () => void;
};

type RepayRequestStore = State & Actions;

export const repayRequestStore = createStore<RepayRequestStore>(
  combine(
    {
      position: null as MoneyMarketPoolPosition | null,
    },
    (set) => ({
      setPosition: (position: MoneyMarketPoolPosition) => set({ position }),
      reset: () => set({ position: null }),
    }),
  ),
);
