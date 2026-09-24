import { AdminUser } from '../types';

const TOKEN_KEY = 'luxe_admin_token';
const USER_KEY = 'luxe_admin_user';
const DEFAULT_ADMIN_PASS = '12111209';

export async function loginAdmin(password: string, email = 'admin@store.com'): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  const trimmedPassword = (password || '').trim();

  // 1. Attempt to authenticate with backend server if available
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: trimmedPassword, email }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else if (res.status === 401) {
        return { success: false, error: data.error || 'Invalid administrator password' };
      }
    }
  } catch (err: any) {
    // Backend API is not available (e.g. running on static hosting like Netlify, Vercel, GitHub Pages)
  }

  // 2. Seamless static-hosting fallback (Netlify / Vercel static build support)
  if (trimmedPassword === DEFAULT_ADMIN_PASS) {
    const fallbackUser: AdminUser = {
      role: 'admin',
      email: email || 'admin@store.com',
      name: 'Store Administrator',
    };
    const localToken = 'admin_sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(TOKEN_KEY, localToken);
    localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));
    return { success: true, user: fallbackUser };
  }

  return { success: false, error: 'Invalid administrator password' };
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

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        if (res.status === 401) {
          logoutAdmin();
          return false;
        }
      }
      return true;
    }
    // Static host returned HTML, maintain existing local session
    return true;
  } catch {
    // If backend is offline or static hosting (Netlify), trust existing valid stored token
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
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to update password' };
      }
    }
  } catch {
    // Static hosting
  }

  return { success: false, error: 'Admin password cannot be changed.' };
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
