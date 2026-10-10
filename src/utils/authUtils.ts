import { AppUser, UserRole, StaffActivityLog } from '../types';

export const USERS_STORAGE_KEY = 'monster_gym_users_accounts_v1';
export const SESSION_STORAGE_KEY = 'monster_gym_user_session_v1';
export const ACTIVITY_LOGS_KEY = 'monster_gym_activity_logs_v1';

export const DEFAULT_ADMIN_USER: AppUser = {
  id: 'usr-admin-1',
  username: 'admin',
  password: '123',
  name: 'المدير العام (كابتن الإدارة)',
  role: 'admin',
  phone: '01000000001',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  permissions: {
    canAddMember: true,
    canRenewMember: true,
    canAwardGift: true,
    canEditMember: true,
    canDeleteMember: true,
    canManagePricing: true,
    canBackupRestore: true,
    canManageUsers: true,
  },
};

export const DEFAULT_STAFF_USER: AppUser = {
  id: 'usr-staff-1',
  username: 'staff',
  password: '123',
  name: 'موظف الاستقبال / كابتن الشفت',
  role: 'staff',
  phone: '01111111112',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  permissions: {
    canAddMember: true,
    canRenewMember: true,
    canAwardGift: true,
    canEditMember: true,
    canDeleteMember: false,
    canManagePricing: false,
    canBackupRestore: false,
    canManageUsers: false,
  },
};

export const INITIAL_USERS: AppUser[] = [DEFAULT_ADMIN_USER, DEFAULT_STAFF_USER];

/**
 * Retrieve all registered users from storage
 */
export function getStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored users:', e);
  }
  // Initialize with defaults if empty
  saveStoredUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

/**
 * Save users list to storage
 */
export function saveStoredUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

/**
 * Get the currently logged-in user from session
 */
export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const sessionUser: AppUser = JSON.parse(raw);
      // Re-verify against stored users to ensure they are still active and valid
      const users = getStoredUsers();
      const matched = users.find((u) => u.id === sessionUser.id && u.active);
      if (matched) {
        return matched;
      }
    }
  } catch (e) {
    console.error('Failed to get current session:', e);
  }
  return null;
}

/**
 * Save current session
 */
export function setCurrentUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to set current user:', e);
  }
}

/**
 * Verify login credentials (case-insensitive for username)
 */
export function verifyLogin(
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: AppUser; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername) {
    return { success: false, error: 'يرجى إدخال اسم المستخدم أو كود الدخول' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'يرجى إدخال كلمة المرور أو رمز PIN' };
  }

  const users = getStoredUsers();
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === cleanUsername ||
      (cleanUsername === 'admin' && u.role === 'admin')
  );

  if (!user) {
    return { success: false, error: 'اسم المستخدم غير موجود في النظام' };
  }

  if (!user.active) {
    return { success: false, error: 'هذا الحساب تم تعطيله من قِبل إدارة الصالة' };
  }

  // Allow standard password check, plus accept 'admin123' as fallback for default admin
  const isPasswordMatch =
    user.password === cleanPassword ||
    (user.username === 'admin' && (cleanPassword === 'admin123' || cleanPassword === '123'));

  if (!isPasswordMatch) {
    return { success: false, error: 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى' };
  }

  // Update last login
  const updatedUser: AppUser = {
    ...user,
    lastLoginAt: new Date().toISOString(),
  };

  const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
  saveStoredUsers(updatedUsers);
  setCurrentUser(updatedUser);

  logActivity(
    updatedUser.id,
    updatedUser.name,
    updatedUser.role,
    'login',
    'تسجيل الدخول للنظام بنجاح'
  );

  return { success: true, user: updatedUser };
}

/**
 * Activity log helper
 */
export function getActivityLogs(): StaffActivityLog[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse activity logs:', e);
  }
  return [];
}

export function logActivity(
  userId: string,
  userName: string,
  userRole: UserRole,
  actionType: StaffActivityLog['actionType'],
  details: string
): void {
  try {
    const current = getActivityLogs();
    const newLog: StaffActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userRole,
      actionType,
      details,
    };
    // Keep last 150 entries
    const updated = [newLog, ...current].slice(0, 150);
    localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to write activity log:', e);
  }
}

export function clearActivityLogs(): void {
  try {
    localStorage.removeItem(ACTIVITY_LOGS_KEY);
  } catch (e) {
    console.error('Failed to clear logs:', e);
  }
}
