import { useState, useEffect, useCallback, useRef } from 'react';
import type { HouseholdMember, UserSearchResult } from '../../types/household';
import * as service from './householdService';

interface UseMemberManagementReturn {
  members: HouseholdMember[];
  loading: boolean;
  error: string | null;
  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: UserSearchResult[];
  searching: boolean;
  searchError: string | null;
  triggerSearch: () => void;
  // Actions
  inviteMember: (query: string) => Promise<HouseholdMember>;
  removeMember: (memberId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

const useMemberManagement = (householdId: number | null): UseMemberManagementReturn => {
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Debounce ref — timer for clearing previous search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch members list
  const fetchMembers = useCallback(async () => {
    if (!householdId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await service.getHouseholdMembers(householdId);
      setMembers(data);
    } catch {
      setError('No se pudieron cargar los miembros.');
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => { void fetchMembers(); }, [fetchMembers]);

  // Debounced search — fires 400ms after the last keystroke
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(searchQuery.trim());
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, householdId]);

  // Manual trigger (also used by the debounce)
  const runSearch = async (q: string) => {
    if (!householdId || !q) return;
    setSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      // API returns an array — empty array means no matches
      const results = await service.searchUser(householdId, q);
      setSearchResults(results);
      if (results.length === 0) setSearchError('No se encontraron usuarios con ese nombre o email.');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setSearchError('No tienes permisos de administrador.');
      } else {
        setSearchError('Error al buscar. Inténtalo de nuevo.');
      }
    } finally {
      setSearching(false);
    }
  };

  const triggerSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    void runSearch(searchQuery.trim());
  };

  // --- INVITE ---
  const inviteMember = async (query: string): Promise<HouseholdMember> => {
    if (!householdId) throw new Error('No household selected.');
    const newMember = await service.inviteMember(householdId, { query });
    setMembers((prev) => [...prev, newMember]);
    setSearchResults([]);
    setSearchQuery('');
    return newMember;
  };

  // --- REMOVE (optimistic) ---
  const removeMember = async (memberId: number): Promise<void> => {
    if (!householdId) return;
    const previous = members;
    setMembers((prev) => prev.filter((m) => m.userId !== memberId));
    try {
      await service.removeMember(householdId, memberId);
    } catch (err) {
      setMembers(previous);
      throw err;
    }
  };

  return {
    members,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    searchError,
    triggerSearch,
    inviteMember,
    removeMember,
    refetch: fetchMembers,
  };
};

export default useMemberManagement;
