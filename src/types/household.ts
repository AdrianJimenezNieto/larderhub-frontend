// Household domain types

export type HouseholdRole = 'ADMIN' | 'MEMBER';

export interface Household {
  id: number;
  name: string;
  joinCode: string;
  createdAt: string;
  myRole: HouseholdRole;
}

export interface HouseholdMember {
  userId: number;
  username: string;
  role: HouseholdRole;
  joinedAt: string;
}

export interface CreateHouseholdRequest {
  name: string;
}

export interface JoinHouseholdRequest {
  joinCode: string;
}
