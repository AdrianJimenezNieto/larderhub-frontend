import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Household } from '../types/household';

interface HouseholdState {
  households: Household[];
  activeHouseholdId: number | null;
  setHouseholds: (list: Household[]) => void;
  addHousehold: (h: Household) => void;
  setActiveHousehold: (id: number) => void;
  removeHousehold: (id: number) => void;
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

      removeHousehold: (id) =>
        set((state) => ({
          households: state.households.filter((h) => h.id !== id),
          activeHouseholdId: state.activeHouseholdId === id ? null : state.activeHouseholdId,
        })),

      getActiveHousehold: () => {
        const { households, activeHouseholdId } = get();
        return households.find((h) => h.id === activeHouseholdId);
      },
    }),
    {
      name: 'household-storage',
    }
  )
);
