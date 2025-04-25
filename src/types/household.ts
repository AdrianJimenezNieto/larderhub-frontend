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
  avatarUrl?: string | null;
}

export interface CreateHouseholdRequest {
  name: string;
}

export interface JoinHouseholdRequest {
  joinCode: string;
}

// Slice 5 — member management
export interface UserSearchResult {
  id: number;
  username: string;
  email: string;
  alreadyMember: boolean;
  avatarUrl?: string | null;
}

export interface InviteMemberRequest {
  query: string; // username or email
}
