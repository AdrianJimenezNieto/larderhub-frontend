import { apiClient } from '../../lib/axiosClient';
import type {
  Household,
  HouseholdMember,
  CreateHouseholdRequest,
  JoinHouseholdRequest,
  UserSearchResult,
  InviteMemberRequest,
} from '../../types/household';

const BASE = '/api/v1/households';

// GET /api/v1/households/mine
export const getMyHouseholds = (): Promise<Household[]> =>
  apiClient.get<Household[]>(`${BASE}/mine`).then((r) => r.data);

// POST /api/v1/households
export const createHousehold = (data: CreateHouseholdRequest): Promise<Household> =>
  apiClient.post<Household>(BASE, data).then((r) => r.data);

// POST /api/v1/households/join
export const joinHousehold = (data: JoinHouseholdRequest): Promise<Household> =>
  apiClient.post<Household>(`${BASE}/join`, data).then((r) => r.data);

// GET /api/v1/households/{id}/members
export const getHouseholdMembers = (householdId: number): Promise<HouseholdMember[]> =>
  apiClient.get<HouseholdMember[]>(`${BASE}/${householdId}/members`).then((r) => r.data);

// GET /api/v1/households/{id}/members/search?q= → returns an ARRAY (may be empty)
export const searchUser = (householdId: number, query: string): Promise<UserSearchResult[]> =>
  apiClient
    .get<UserSearchResult[]>(`${BASE}/${householdId}/members/search`, { params: { q: query } })
    .then((r) => r.data);

// POST /api/v1/households/{id}/members/invite
export const inviteMember = (
  householdId: number,
  data: InviteMemberRequest
): Promise<HouseholdMember> =>
  apiClient.post<HouseholdMember>(`${BASE}/${householdId}/members/invite`, data).then((r) => r.data);

// DELETE /api/v1/households/{id}/members/{memberId}
export const removeMember = (householdId: number, memberId: number): Promise<void> =>
  apiClient.delete(`${BASE}/${householdId}/members/${memberId}`).then(() => undefined);

