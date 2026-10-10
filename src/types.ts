export type SubscriptionPlanId =
  | 'session'         // حصة (يوم واحد)
  | 'week'            // أسبوع (٧ أيام)
  | 'half_month'      // نصف شهر (١٥ يوماً)
  | 'month'           // شهر (٣٠ يوماً)
  | 'two_months'      // شهرين (٦٠ يوماً)
  | 'three_months'    // ثلاث شهور (ربع سنوي)
  | 'six_months'      // ٦ شهور (نصف سنوي)
  | 'alternate_days'; // اشتراك يوم ويوم (أيام تبادلية)

export interface SubscriptionRecord {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  amount: number;
  durationMonths: number;
  planType?: SubscriptionPlanId;
  paidAt: string;
  notes?: string;
  recordedBy?: string; // اسم الموظف الذي قام بالعملية
}

export interface LoyaltyGiftRecord {
  id: string;
  date: string;
  giftType: string;
  notes?: string;
  awardedBy?: string; // اسم الموظف الذي قام بتسليم الهدية
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  amount: number;
  durationMonths: number; // Duration of current subscription
  planType?: SubscriptionPlanId;
  gender?: 'male' | 'female';
  notes?: string;
  consecutiveMonths: number; // Consecutive months of subscription
  giftsClaimed: LoyaltyGiftRecord[];
  history: SubscriptionRecord[];
  createdAt: string;
  createdBy?: string; // اسم الموظف الذي أضاف المشترك
  updatedBy?: string; // آخر موظف قام بالتعديل
}

export type FilterStatus = 'all' | 'active' | 'expired' | 'expiring_soon' | 'loyalty_eligible';

export interface GymStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  expiringSoonMembers: number;
  loyaltyEligibleCount: number;
  totalRevenue: number;
}

// User Roles & Authentication Types
export type UserRole = 'admin' | 'staff';

export interface UserPermissions {
  canAddMember: boolean;
  canRenewMember: boolean;
  canAwardGift: boolean;
  canEditMember: boolean;
  canDeleteMember: boolean;
  canManagePricing: boolean;
  canBackupRestore: boolean;
  canManageUsers: boolean;
}

export interface AppUser {
  id: string;
  username: string; // اسم المستخدم / كود الدخول
  password: string; // كلمة المرور أو رمز PIN
  name: string; // الاسم الظاهر للموظف
  role: UserRole; // 'admin' (مدير الصالة) أو 'staff' (موظف / كابتن)
  phone?: string;
  active: boolean; // الحساب نشط أم معطل
  createdAt: string;
  lastLoginAt?: string;
  permissions: UserPermissions;
}

export interface StaffActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionType: 
    | 'login' 
    | 'add_member' 
    | 'renew_member' 
    | 'award_gift' 
    | 'edit_member' 
    | 'delete_member' 
    | 'change_pricing' 
    | 'restore_backup'
    | 'manage_users';
  details: string;
}

