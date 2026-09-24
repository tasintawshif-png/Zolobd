import { AdminUser } from '../types';

const TOKEN_KEY = 'luxe_admin_token';
const USER_KEY = 'luxe_admin_user';

export async function loginAdmin(password: string, email = 'admin@store.com'): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, email }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error || 'Authentication failed' };
    }
  } catch (err: any) {
    return { success: false, error: 'Connection error while connecting to auth server' };
  }
}

export function getAdminSession(): AdminUser | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  if (!token || !userStr) return null;
  try {
    const user = JSON.parse(userStr) as AdminUser;
    user.token = token;
    return user;
  } catch {
    return null;
  }
}

export function getAdminAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminAuthToken();
  if (!token) return false;
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok || !data.authenticated) {
      logoutAdmin();
      return false;
    }
    return true;
  } catch {
    // If backend endpoint is temporarily offline, keep valid stored token for resiliency
    return true;
  }
}

export async function changeAdminPassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const token = getAdminAuthToken();
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Failed to update password' };
    }
  } catch {
    return { success: false, error: 'Network error during password update' };
  }
}

export function logoutAdmin(): void {
  const token = getAdminAuthToken();
  if (token) {
    fetch('/api/admin/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
