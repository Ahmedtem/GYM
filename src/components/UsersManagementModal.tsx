import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Trash2, 
  Edit3, 
  Check, 
  Clock, 
  Activity, 
  UserCheck, 
  UserX,
  Lock,
  Phone,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { AppUser, UserRole, UserPermissions, StaffActivityLog } from '../types';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  getActivityLogs, 
  clearActivityLogs, 
  logActivity 
} from '../utils/authUtils';
import { formatArabicDate } from '../utils/dateUtils';

interface UsersManagementModalProps {
  isOpen: boolean;
  currentUser: AppUser;
  onClose: () => void;
  onUsersUpdated?: () => void;
}

export const UsersManagementModal: React.FC<UsersManagementModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onUsersUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [users, setUsers] = useState<AppUser[]>(() => getStoredUsers());
  const [logs, setLogs] = useState<StaffActivityLog[]>(() => getActivityLogs());
  
  // Modal states for adding/editing user
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [changingPasswordUserId, setChangingPasswordUserId] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('staff');
  const [formPermissions, setFormPermissions] = useState<UserPermissions>({
    canAddMember: true,
    canRenewMember: true,
    canAwardGift: true,
    canEditMember: true,
    canDeleteMember: false,
    canManagePricing: false,
    canBackupRestore: false,
    canManageUsers: false,
  });

  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const refreshData = () => {
    const freshUsers = getStoredUsers();
    setUsers(freshUsers);
    setLogs(getActivityLogs());
    if (onUsersUpdated) onUsersUpdated();
  };

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('');
    setFormPhone('');
    setFormRole('staff');
    setFormPermissions({
      canAddMember: true,
      canRenewMember: true,
      canAwardGift: true,
      canEditMember: true,
      canDeleteMember: false,
      canManagePricing: false,
      canBackupRestore: false,
      canManageUsers: false,
    });
    setFormError(null);
    setIsAddingUser(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormPassword(user.password);
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormPermissions({ ...user.permissions });
    setFormError(null);
    setIsAddingUser(true);
  };

  const handleRoleChange = (role: UserRole) => {
    setFormRole(role);
    if (role === 'admin') {
      setFormPermissions({
        canAddMember: true,
        canRenewMember: true,
        canAwardGift: true,
        canEditMember: true,
        canDeleteMember: true,
        canManagePricing: true,
        canBackupRestore: true,
        canManageUsers: true,
      });
    } else {
      setFormPermissions({
        canAddMember: true,
        canRenewMember: true,
        canAwardGift: true,
        canEditMember: true,
        canDeleteMember: false,
        canManagePricing: false,
        canBackupRestore: false,
        canManageUsers: false,
      });
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = formName.trim();
    const username = formUsername.trim().toLowerCase();
    const password = formPassword.trim();
    const phone = formPhone.trim();

    if (!name) {
      setFormError('يرجى إدخال اسم الموظف بالكامل');
      return;
    }
    if (!username) {
      setFormError('يرجى تحديد اسم المستخدم / كود الدخول');
      return;
    }
    if (!password) {
      setFormError('يرجى تحديد كلمة المرور');
      return;
    }

    // Check duplicate username
    const duplicate = users.find(
      (u) => u.username.toLowerCase() === username && u.id !== editingUserId
    );
    if (duplicate) {
      setFormError('اسم المستخدم هذا مستخدم بالفعل لموظف آخر، اختر اسماً مختلفاً');
      return;
    }

    if (editingUserId) {
      // Update
      const updatedList = users.map((u) => {
        if (u.id === editingUserId) {
          return {
            ...u,
            name,
            username,
            password,
            phone,
            role: formRole,
            permissions: formPermissions,
          };
        }
        return u;
      });
      saveStoredUsers(updatedList);
      logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'manage_users',
        `تعديل بيانات وصلاحيات الحساب: ${name} (${username})`
      );
    } else {
      // Create new
      const newUser: AppUser = {
        id: 'usr-' + Date.now(),
        name,
        username,
        password,
        phone,
        role: formRole,
        active: true,
        createdAt: new Date().toISOString(),
        permissions: formPermissions,
      };
      const updatedList = [...users, newUser];
      saveStoredUsers(updatedList);
      logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'manage_users',
        `إضافة حساب موظف جديد: ${name} (${username}) بصلاحية ${formRole === 'admin' ? 'مدير' : 'موظف'}`
      );
    }

    setIsAddingUser(false);
    setEditingUserId(null);
    refreshData();
  };

  const handleToggleActive = (user: AppUser) => {
    if (user.id === currentUser.id) {
      alert('لا يمكنك تعطيل حسابك الحالي أثناء تسجيل الدخول منه!');
      return;
    }
    const newStatus = !user.active;
    const updated = users.map((u) => (u.id === user.id ? { ...u, active: newStatus } : u));
    saveStoredUsers(updated);
    logActivity(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'manage_users',
      `${newStatus ? 'تفعيل' : 'تعطيل'} حساب الموظف: ${user.name}`
    );
    refreshData();
  };

  const handleDeleteUser = (user: AppUser) => {
    if (user.id === currentUser.id) {
      alert('لا يمكنك حذف حسابك الشخصي!');
      return;
    }
    if (user.username === 'admin') {
      alert('لا يمكن حذف حساب المدير الرئيسي الافتراضي للنظام.');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف حساب الموظف "${user.name}" نهائياً من النظام؟`)) {
      const updated = users.filter((u) => u.id !== user.id);
      saveStoredUsers(updated);
      logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'manage_users',
        `حذف حساب الموظف: ${user.name} (${user.username})`
      );
      refreshData();
    }
  };

  const handleChangePassword = (userId: string) => {
    const val = newPasswordValue.trim();
    if (!val) {
      alert('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const updated = users.map((u) => (u.id === userId ? { ...u, password: val } : u));
    saveStoredUsers(updated);
    logActivity(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'manage_users',
      `تغيير كلمة المرور لحساب: ${targetUser.name}`
    );
    setChangingPasswordUserId(null);
    setNewPasswordValue('');
    refreshData();
    alert(`تم تحديث كلمة المرور للحساب ${targetUser.name} بنجاح!`);
  };

  const handleClearLogs = () => {
    if (window.confirm('هل تريد مسح سجل نشاط وحركات الموظفين بالكامل؟')) {
      clearActivityLogs();
      refreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        id="modal-users-management"
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  إدارة الموظفين وصلاحيات المستخدمين
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                  خاص بالإدارة
                </span>
              </div>
              <p className="text-xs text-slate-500">
                التحكم بحسابات الموظفين والمديرين ومتابعة سجل العمليات لضمان أمان الصالة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>الموظفين والمدير ({users.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('logs');
                setLogs(getActivityLogs());
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>سجل حركات ونشاط الموظفين ({logs.length})</span>
            </button>
          </div>

          {activeTab === 'users' && !isAddingUser && (
            <button
              id="btn-add-new-staff"
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إضافة موظف جديد</span>
            </button>
          )}

          {activeTab === 'logs' && logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
            >
              مسح السجل
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: USERS LIST & FORM */}
          {activeTab === 'users' && (
            <div>
              {/* If Add/Edit Form is open */}
              {isAddingUser ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-red-600" />
                      <span>{editingUserId ? 'تعديل بيانات وصلاحيات الموظف' : 'تسجيل موظف أو مدير جديد'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingUser(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      إلغاء ✕
                    </button>
                  </div>

                  {formError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveUser} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          اسم الموظف / الكابتن *
                        </label>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="مثال: كابتن محمود إبراهيم"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600"
                          required
                        />
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          اسم المستخدم / كود الدخول * (بالإنجليزية)
                        </label>
                        <input
                          type="text"
                          value={formUsername}
                          onChange={(e) => setFormUsername(e.target.value)}
                          placeholder="مثال: mahmoud أو coach2"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 font-mono"
                          dir="ltr"
                          required
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          كلمة المرور / الرمز السري (PIN) *
                        </label>
                        <input
                          type="text"
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          placeholder="مثال: 123456 أو 123"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 font-mono"
                          dir="ltr"
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          رقم الهاتف (اختياري)
                        </label>
                        <input
                          type="text"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="01xxxxxxxxx"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 font-mono"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Role selector */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        الدور الوظيفي في الصالة
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label 
                          onClick={() => handleRoleChange('staff')}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                            formRole === 'staff' 
                              ? 'bg-blue-50 border-blue-400 text-blue-900' 
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="role" 
                            checked={formRole === 'staff'} 
                            onChange={() => {}} 
                            className="text-blue-600"
                          />
                          <div>
                            <span className="text-xs font-bold block">موظف استقبال / كابتن</span>
                            <span className="text-[10px] text-slate-500">تسجيل وتجديد الاشتراكات ومتابعة المشتركين</span>
                          </div>
                        </label>

                        <label 
                          onClick={() => handleRoleChange('admin')}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                            formRole === 'admin' 
                              ? 'bg-amber-50 border-amber-400 text-amber-900' 
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="role" 
                            checked={formRole === 'admin'} 
                            onChange={() => {}} 
                            className="text-amber-600"
                          />
                          <div>
                            <span className="text-xs font-bold block">مدير الصالة (Admin)</span>
                            <span className="text-[10px] text-slate-500">صلاحيات كاملة تشمل التسعير، حذف المشتركين، وإدارة الموظفين</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Custom Permissions Checklist */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        صلاحيات هذا الحساب التفصيلية:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formPermissions.canAddMember}
                            onChange={(e) => setFormPermissions(p => ({ ...p, canAddMember: e.target.checked }))}
                            className="rounded text-red-600"
                          />
                          <span>تسجيل مشتركين جدد</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formPermissions.canRenewMember}
                            onChange={(e) => setFormPermissions(p => ({ ...p, canRenewMember: e.target.checked }))}
                            className="rounded text-red-600"
                          />
                          <span>تجديد اشتراكات المشتركين</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formPermissions.canAwardGift}
                            onChange={(e) => setFormPermissions(p => ({ ...p, canAwardGift: e.target.checked }))}
                            className="rounded text-red-600"
                          />
                          <span>تسليم هدايا ولاء الـ ٦ أشهر</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formPermissions.canEditMember}
                            onChange={(e) => setFormPermissions(p => ({ ...p, canEditMember: e.target.checked }))}
                            className="rounded text-red-600"
                          />
                          <span>تعديل بيانات المشتركين القائمين</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-rose-700 font-semibold">
                          <input
                            type="checkbox"
                            checked={formPermissions.canDeleteMember}
                            onChange={(e) => setFormPermissions(p => ({ ...p, canDeleteMember: e.target.checked }))}
                            className="rounded text-rose-600"
                          />
                          <span>حذف المشتركين نهائياً (إجراء حساس)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-amber-800 font-semibold">
                          <input
                            type="checkbox"
                            checked={formPermissions.canManagePricing}
                            onChange={(e) => setFormPermissions(p => ({ ...p, canManagePricing: e.target.checked }))}
                            className="rounded text-amber-600"
                          />
                          <span>تعديل أسعار باقات الاشتراكات الـ 8</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-blue-800 font-semibold">
                          <input
                            type="checkbox"
                            checked={formPermissions.canBackupRestore}
                            onChange={(e) => setFormPermissions(p => ({ ...p, canBackupRestore: e.target.checked }))}
                            className="rounded text-blue-600"
                          />
                          <span>النسخ الاحتياطي واستعادة الداتا</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-purple-800 font-semibold">
                          <input
                            type="checkbox"
                            checked={formPermissions.canManageUsers}
                            onChange={(e) => setFormPermissions(p => ({ ...p, canManageUsers: e.target.checked }))}
                            className="rounded text-purple-600"
                          />
                          <span>إدارة الموظفين وتعديل حساباتهم</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsAddingUser(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{editingUserId ? 'حفظ التعديلات' : 'إنشاء الحساب'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {/* Users Cards / List */}
              <div className="space-y-3">
                {users.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const isAdmin = user.role === 'admin';
                  const isChangingPass = changingPasswordUserId === user.id;

                  return (
                    <div 
                      key={user.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        !user.active 
                          ? 'bg-slate-50/60 border-slate-200 opacity-60' 
                          : isAdmin
                          ? 'bg-gradient-to-r from-amber-50/50 via-white to-white border-amber-200/80 shadow-xs'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        {/* User Identity info */}
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                            isAdmin 
                              ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold' 
                              : 'bg-blue-100 text-blue-700 border-blue-200 font-bold'
                          }`}>
                            {isAdmin ? '👑' : '👤'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900">
                                {user.name}
                              </h4>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  أنت (الحساب الحالي)
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isAdmin 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {isAdmin ? 'مدير الصالة' : 'موظف استقبال / كابتن'}
                              </span>
                              {!user.active && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  معطل
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                اسم المستخدم: <strong>{user.username}</strong>
                              </span>
                              {user.phone && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{user.phone}</span>
                                </span>
                              )}
                              {user.lastLoginAt && (
                                <span className="text-[11px] text-slate-400">
                                  آخر دخول: {formatArabicDate(user.lastLoginAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                          <button
                            onClick={() => {
                              if (isChangingPass) {
                                setChangingPasswordUserId(null);
                              } else {
                                setChangingPasswordUserId(user.id);
                                setNewPasswordValue('');
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                            title="تغيير كلمة المرور أو PIN"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                            <span>كلمة المرور</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="تعديل البيانات والصلاحيات"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {!isCurrent && (
                            <button
                              onClick={() => handleToggleActive(user)}
                              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                                user.active 
                                  ? 'text-slate-500 hover:text-amber-700 hover:bg-amber-50' 
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={user.active ? 'تعطيل الحساب مؤقتاً' : 'تفعيل الحساب'}
                            >
                              {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          )}

                          {!isCurrent && user.username !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                              title="حذف الموظف نهائياً"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      </div>

                      {/* Quick Change Password Row */}
                      {isChangingPass && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-xs font-bold text-slate-700">كلمة المرور الجديدة:</span>
                          <input
                            type="text"
                            value={newPasswordValue}
                            onChange={(e) => setNewPasswordValue(e.target.value)}
                            placeholder="أدخل الرمز أو كلمة المرور..."
                            className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-300 font-mono text-slate-900 w-48 focus:outline-none focus:border-red-600"
                            dir="ltr"
                          />
                          <button
                            onClick={() => handleChangePassword(user.id)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setChangingPasswordUserId(null)}
                            className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      )}

                      {/* Permissions indicators */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-600">
                        <span className="font-bold text-slate-500">الصلاحيات:</span>
                        {user.permissions.canAddMember && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">تسجيل مشتركين</span>
                        )}
                        {user.permissions.canRenewMember && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">تجديد</span>
                        )}
                        {user.permissions.canAwardGift && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">هدايا الولاء</span>
                        )}
                        {user.permissions.canEditMember && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">تعديل</span>
                        )}
                        {user.permissions.canDeleteMember && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold">حذف مشتركين ⚠️</span>
                        )}
                        {user.permissions.canManagePricing && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold">تسعير الباقات</span>
                        )}
                        {user.permissions.canBackupRestore && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">نسخ احتياطي</span>
                        )}
                        {user.permissions.canManageUsers && (
                          <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-bold">إدارة الموظفين</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVITY AUDIT LOG */}
          {activeTab === 'logs' && (
            <div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p>
                    يقوم النظام تلقائياً بتوثيق كافة العمليات الحساسة (تسجيل دخول، إضافة وتجديد المشتركين، تعديل الأسعار، الحذف) مع توقيت حدوثها واسم الموظف المنفذ لضمان النزاهة التامة.
                  </p>
                </div>
              </div>

              {logs.length > 0 ? (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div 
                      key={log.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          log.actionType === 'delete_member'
                            ? 'bg-rose-100 text-rose-700'
                            : log.actionType === 'change_pricing'
                            ? 'bg-amber-100 text-amber-800'
                            : log.actionType === 'renew_member' || log.actionType === 'add_member'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">{log.userName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {log.userRole === 'admin' ? 'مدير' : 'موظف'}
                            </span>
                          </div>
                          <p className="text-slate-700 mt-0.5">{log.details}</p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })} • {formatArabicDate(log.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">لا يوجد نشاطات مسجلة حتى الآن</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>نظام حماية مستخدمي Monster Gym • قفل البرنامج للموظفين المصرح لهم فقط</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
