import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Household } from '../types/household';

interface HouseholdState {
  households: Household[];
  activeHouseholdId: number | null;
  // Actions
  setHouseholds: (list: Household[]) => void;
  addHousehold: (h: Household) => void;
  setActiveHousehold: (id: number) => void;
  // Derived getter helper
  getActiveHousehold: () => Household | undefined;
}

export const useHouseholdStore = create<HouseholdState>()(
  persist(
    (set, get) => ({
      households: [],
      activeHouseholdId: null,

      setHouseholds: (list) =>
        set({ households: list }),

      addHousehold: (h) =>
        set((state) => ({
          households: [...state.households.filter((x) => x.id !== h.id), h],
        })),

      setActiveHousehold: (id) =>
        set({ activeHouseholdId: id }),

      getActiveHousehold: () => {
        const { households, activeHouseholdId } = get();
        return households.find((h) => h.id === activeHouseholdId);
      },
    }),
    {
      name: 'household-storage', // key in localStorage
    }
  )
);
