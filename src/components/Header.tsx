import React from 'react';
import { 
  Plus, 
  Gift, 
  Printer, 
  HardDrive, 
  Laptop, 
  Tags, 
  Users, 
  LogOut, 
  Lock, 
  ShieldCheck, 
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { MonsterGymLogo } from './MonsterGymLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { AppUser } from '../types';

interface HeaderProps {
  currentUser: AppUser;
  onOpenAddModal: () => void;
  onOpenLoyaltyInfo: () => void;
  onOpenDesktopModal: () => void;
  onOpenBackupModal: () => void;
  onOpenPricingModal: () => void;
  onOpenUsersManagement: () => void;
  onLogout: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAddModal,
  onOpenLoyaltyInfo,
  onOpenDesktopModal,
  onOpenBackupModal,
  onOpenPricingModal,
  onOpenUsersManagement,
  onLogout,
  onPrint,
}) => {
  const todayFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isAdmin = currentUser.role === 'admin';
  const canManageUsers = currentUser.permissions.canManageUsers || isAdmin;
  const canManagePricing = currentUser.permissions.canManagePricing || isAdmin;
  const canBackup = currentUser.permissions.canBackupRestore || isAdmin;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top micro-bar: User status & Session management */}
      <div className="bg-slate-900 text-slate-200 px-4 sm:px-6 lg:px-8 py-1.5 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          
          {/* Active staff identity */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-slate-400 hidden xs:inline">المستخدم الحالي:</span>
              <strong className="text-white font-medium">{currentUser.name}</strong>
            </span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
              isAdmin 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {isAdmin ? '👑 مدير الصالة' : '👤 موظف استقبال'}
            </span>
          </div>

          {/* Quick User Actions */}
          <div className="flex items-center gap-2 mr-auto sm:mr-0">
            {canManageUsers && (
              <button
                id="btn-header-manage-users"
                onClick={onOpenUsersManagement}
                className="px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="إدارة حسابات الموظفين والصلاحيات وسجل النشاط"
              >
                <Users className="w-3 h-3 text-amber-400" />
                <span>إدارة الموظفين والصلاحيات</span>
              </button>
            )}

            <button
              id="btn-header-logout"
              onClick={onLogout}
              className="px-2.5 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="تسجيل الخروج وقفل البرنامج"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span>تسجيل خروج (قفل)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <MonsterGymLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-950 font-mono">
                  MONSTER GYM
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-red-600 text-white shadow-2xs tracking-wide">
                  إدارة المشتركين
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {todayFormatted} • متابعة الاشتراكات ومكافآت برنامج الولاء
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
            
            {/* Mobile PWA Install */}
            <PWAInstallButton variant="compact" />

            {/* Desktop App (Mac & Windows) */}
            <button
              id="btn-desktop-version"
              onClick={onOpenDesktopModal}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="نسخة الكمبيوتر للماك والويندوز"
            >
              <Laptop className="w-3.5 h-3.5 text-red-400" />
              <span>نسخة Mac / Windows</span>
            </button>

            {/* Backup & Google Drive Center (Admin or authorized) */}
            {canBackup && (
              <button
                id="btn-data-backup-center"
                onClick={onOpenBackupModal}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="حفظ واسترجاع البيانات وملفات الداتا وجوجل درايف"
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                <span>حفظ واسترجاع الداتا</span>
              </button>
            )}

            {/* Subscription Pricing Management (Admin or authorized) */}
            {canManagePricing && (
              <button
                id="btn-subscription-pricing"
                onClick={onOpenPricingModal}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="تعديل أسعار باقات الاشتراكات الـ 8 في الجيم"
              >
                <Tags className="w-3.5 h-3.5 text-amber-600" />
                <span>تسعير الاشتراكات</span>
              </button>
            )}

            {/* Loyalty Rules Button */}
            <button
              id="btn-loyalty-rules"
              onClick={onOpenLoyaltyInfo}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تفاصيل برنامج ولاء الـ 6 أشهر"
            >
              <Gift className="w-3.5 h-3.5 text-purple-600" />
              <span>هدايا الولاء (٦ أشهر)</span>
            </button>

            {/* Print button */}
            <button
              id="btn-print-report"
              onClick={onPrint}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="طباعة كشف المشتركين"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Add Member Primary Button */}
            {currentUser.permissions.canAddMember && (
              <button
                id="btn-add-member"
                onClick={onOpenAddModal}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>إضافة مشترك جديد</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
