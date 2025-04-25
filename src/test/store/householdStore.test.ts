import { describe, it, expect, beforeEach } from 'vitest';
import { useHouseholdStore } from '../../store/householdStore';
import type { Household } from '../../types/household';

const makeHousehold = (id: number, name: string): Household => ({
  id,
  name,
  joinCode: `CODE${id}`,
  createdAt: '2026-01-01T00:00:00Z',
  myRole: 'MEMBER',
});

describe('householdStore', () => {
  beforeEach(() => {
    useHouseholdStore.setState({ households: [], activeHouseholdId: null });
    localStorage.clear();
  });

  it('starts with empty households and no active id', () => {
    const { households, activeHouseholdId } = useHouseholdStore.getState();
    expect(households).toHaveLength(0);
    expect(activeHouseholdId).toBeNull();
  });

  it('addHousehold appends a new household', () => {
    useHouseholdStore.getState().addHousehold(makeHousehold(1, 'Casa'));
    expect(useHouseholdStore.getState().households).toHaveLength(1);
    expect(useHouseholdStore.getState().households[0].name).toBe('Casa');
  });

  it('addHousehold replaces existing household with the same id', () => {
    useHouseholdStore.getState().addHousehold(makeHousehold(1, 'Casa A'));
    useHouseholdStore.getState().addHousehold(makeHousehold(1, 'Casa B'));

    const { households } = useHouseholdStore.getState();
    expect(households).toHaveLength(1);
    expect(households[0].name).toBe('Casa B');
  });

  it('setActiveHousehold updates activeHouseholdId', () => {
    useHouseholdStore.getState().addHousehold(makeHousehold(1, 'Casa'));
    useHouseholdStore.getState().addHousehold(makeHousehold(2, 'Oficina'));
    useHouseholdStore.getState().setActiveHousehold(2);

    expect(useHouseholdStore.getState().activeHouseholdId).toBe(2);
  });

  it('removeHousehold removes only the targeted household', () => {
    useHouseholdStore.getState().addHousehold(makeHousehold(1, 'Casa'));
    useHouseholdStore.getState().addHousehold(makeHousehold(2, 'Oficina'));
    useHouseholdStore.getState().removeHousehold(1);

    const { households } = useHouseholdStore.getState();
    expect(households).toHaveLength(1);
    expect(households[0].id).toBe(2);
  });

  it('removeHousehold clears activeHouseholdId when the active one is removed', () => {
    useHouseholdStore.getState().addHousehold(makeHousehold(1, 'Casa'));
    useHouseholdStore.getState().setActiveHousehold(1);
    useHouseholdStore.getState().removeHousehold(1);

    expect(useHouseholdStore.getState().activeHouseholdId).toBeNull();
  });

  it('removeHousehold does not clear activeHouseholdId when a different household is removed', () => {
    useHouseholdStore.getState().addHousehold(makeHousehold(1, 'Casa'));
    useHouseholdStore.getState().addHousehold(makeHousehold(2, 'Oficina'));
    useHouseholdStore.getState().setActiveHousehold(1);
    useHouseholdStore.getState().removeHousehold(2);

    expect(useHouseholdStore.getState().activeHouseholdId).toBe(1);
  });

  it('getActiveHousehold returns the household matching activeHouseholdId', () => {
    useHouseholdStore.getState().addHousehold(makeHousehold(1, 'Casa'));
    useHouseholdStore.getState().addHousehold(makeHousehold(2, 'Oficina'));
    useHouseholdStore.getState().setActiveHousehold(2);

    const active = useHouseholdStore.getState().getActiveHousehold();
    expect(active?.id).toBe(2);
    expect(active?.name).toBe('Oficina');
  });

  it('getActiveHousehold returns undefined when no household is active', () => {
    useHouseholdStore.getState().addHousehold(makeHousehold(1, 'Casa'));
    const active = useHouseholdStore.getState().getActiveHousehold();
    expect(active).toBeUndefined();
  });
});
