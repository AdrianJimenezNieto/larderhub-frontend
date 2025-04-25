import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../store/authStore';
import type { AuthResponse } from '../../types/auth';

const mockAuthResponse: AuthResponse = {
  token: 'test.jwt.token',
  user: { id: 1, name: 'Juan', email: 'juan@test.com' },
};

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state and clear localStorage before each test
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    localStorage.clear();
  });

  it('starts in unauthenticated state', () => {
    const { isAuthenticated, user, token } = useAuthStore.getState();
    expect(isAuthenticated).toBe(false);
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it('login sets user, token, and isAuthenticated', () => {
    useAuthStore.getState().login(mockAuthResponse);

    const { isAuthenticated, user, token } = useAuthStore.getState();
    expect(isAuthenticated).toBe(true);
    expect(token).toBe('test.jwt.token');
    expect(user?.name).toBe('Juan');
    expect(user?.email).toBe('juan@test.com');
  });

  it('logout clears all state', () => {
    useAuthStore.getState().login(mockAuthResponse);
    useAuthStore.getState().logout();

    const { isAuthenticated, user, token } = useAuthStore.getState();
    expect(isAuthenticated).toBe(false);
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it('logout is idempotent — calling twice leaves state clean', () => {
    useAuthStore.getState().login(mockAuthResponse);
    useAuthStore.getState().logout();
    useAuthStore.getState().logout();

    const { isAuthenticated, user } = useAuthStore.getState();
    expect(isAuthenticated).toBe(false);
    expect(user).toBeNull();
  });
});
