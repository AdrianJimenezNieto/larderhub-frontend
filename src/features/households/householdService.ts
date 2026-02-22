import { apiClient } from '../../lib/axiosClient';
import type {
  Household,
  HouseholdMember,
  CreateHouseholdRequest,
  JoinHouseholdRequest,
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
