import { createStore } from 'zustand';
import { combine } from 'zustand/middleware';

type State = {
  active: boolean;
};

type Actions = {
  setActive: (value: boolean) => void;
  reset: () => void;
};

type EfficiencyModeRequestStore = State & Actions;

export const efficiencyModeRequestStore =
  createStore<EfficiencyModeRequestStore>(
    combine(
      {
        active: false,
      },
      (set) => ({
        setActive: (value: boolean) => set({ active: value }),
        reset: () => set({ active: false }),
      }),
    ),
  );
