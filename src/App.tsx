import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  Gift, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Users, 
  RefreshCw, 
  Trash2, 
  X, 
  AlertTriangle,
  Layers,
  Tags
} from 'lucide-react';
import { Member, FilterStatus, GymStats, SubscriptionPlanId, AppUser } from './types';
import { INITIAL_MEMBERS } from './utils/sampleData';
import { getSubscriptionStatus, isLoyaltyGiftEligible } from './utils/dateUtils';
import { 
  SUBSCRIPTION_PLANS, 
  getPlanById, 
  getCustomPlanPrices, 
  getSubscriptionPlans 
} from './utils/subscriptionPlans';
import { 
  getCurrentUser, 
  setCurrentUser as setCurrentUserInStorage, 
  logActivity 
} from './utils/authUtils';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { AlertBanner } from './components/AlertBanner';
import { MemberCard } from './components/MemberCard';
import { MemberTable } from './components/MemberTable';
import { MemberModal } from './components/MemberModal';
import { RenewModal } from './components/RenewModal';
import { LoyaltyGiftModal } from './components/LoyaltyGiftModal';
import { MemberHistoryModal } from './components/MemberHistoryModal';
import { LoyaltyProgramInfoModal } from './components/LoyaltyProgramInfoModal';
import { DesktopInstallModal } from './components/DesktopInstallModal';
import { DataBackupModal } from './components/DataBackupModal';
import { SubscriptionPricingModal } from './components/SubscriptionPricingModal';
import { LoginScreen } from './components/LoginScreen';
import { UsersManagementModal } from './components/UsersManagementModal';
import { PWAInstallButton } from './components/PWAInstallButton';

const STORAGE_KEY = 'gym_members_loyalty_app_data';

export default function App() {
  // Staff User Session & Security
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

  // Plan pricing state
  const [planPrices, setPlanPrices] = useState<Record<SubscriptionPlanId, number>>(() => getCustomPlanPrices());

  // Members state loaded from localStorage or initialized with sample data
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_MEMBERS;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [members]);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'endDate_asc' | 'endDate_desc' | 'name' | 'consecutive_desc'>('endDate_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [renewingMember, setRenewingMember] = useState<Member | null>(null);
  const [awardingGiftMember, setAwardingGiftMember] = useState<Member | null>(null);
  const [historyMember, setHistoryMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [isLoyaltyInfoOpen, setIsLoyaltyInfoOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Groupings & alerts
  const expiredMembers = useMemo(() => {
    return members.filter((m) => getSubscriptionStatus(m.endDate).status === 'expired');
  }, [members]);

  const expiringSoonMembers = useMemo(() => {
    return members.filter((m) => getSubscriptionStatus(m.endDate).status === 'expiring_soon');
  }, [members]);

  const loyaltyEligibleMembers = useMemo(() => {
    return members.filter((m) => isLoyaltyGiftEligible(m));
  }, [members]);

  const activeMembers = useMemo(() => {
    return members.filter((m) => {
      const s = getSubscriptionStatus(m.endDate).status;
      return s === 'active' || s === 'expiring_soon';
    });
  }, [members]);

  // Compute Overall Stats
  const stats: GymStats = useMemo(() => {
    const totalRevenue = members.reduce((sum, m) => sum + (m.amount || 0), 0);
    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      expiredMembers: expiredMembers.length,
      expiringSoonMembers: expiringSoonMembers.length,
      loyaltyEligibleCount: loyaltyEligibleMembers.length,
      totalRevenue,
    };
  }, [members, activeMembers, expiredMembers, expiringSoonMembers, loyaltyEligibleMembers]);

  // Filter & Sort Members
  const filteredMembers = useMemo(() => {
    let result = members.filter((m) => {
      // Search filter
      const query = searchQuery.trim().toLowerCase();
      const planInfo = getPlanById(m.planType, m.durationMonths);
      const matchesSearch = 
        !query || 
        m.name.toLowerCase().includes(query) || 
        m.phone.includes(query) ||
        planInfo.name.toLowerCase().includes(query) ||
        planInfo.tag.toLowerCase().includes(query);
      if (!matchesSearch) return false;

      // Plan type filter
      if (selectedPlanFilter !== 'all') {
        const memberPlan = m.planType || 'month';
        if (memberPlan !== selectedPlanFilter) return false;
      }

      // Status filter
      const { status } = getSubscriptionStatus(m.endDate);
      if (currentFilter === 'active') {
        return status === 'active' || status === 'expiring_soon';
      }
      if (currentFilter === 'expired') {
        return status === 'expired';
      }
      if (currentFilter === 'expiring_soon') {
        return status === 'expiring_soon';
      }
      if (currentFilter === 'loyalty_eligible') {
        return isLoyaltyGiftEligible(m);
      }
      return true;
    });

    // Sorting
    result = result.sort((a, b) => {
      if (sortBy === 'endDate_asc') {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      if (sortBy === 'endDate_desc') {
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'ar');
      }
      if (sortBy === 'consecutive_desc') {
        return (b.consecutiveMonths || 0) - (a.consecutiveMonths || 0);
      }
      return 0;
    });

    return result;
  }, [members, searchQuery, currentFilter, selectedPlanFilter, sortBy]);

  // Logout & Lock handler
  const handleLogout = () => {
    if (currentUser) {
      logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'login',
        'تسجيل الخروج وقفل شاشة البرنامج'
      );
    }
    setCurrentUserInStorage(null);
    setCurrentUser(null);
  };

  // Handlers
  const handleSaveMember = (memberData: Omit<Member, 'id' | 'createdAt' | 'giftsClaimed' | 'history'> & { id?: string }) => {
    const operatorName = currentUser?.name || 'إدارة الصالة';

    if (memberData.id) {
      // Update existing
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberData.id
            ? {
                ...m,
                ...memberData,
                updatedBy: operatorName,
              }
            : m
        )
      );
      if (currentUser) {
        logActivity(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'edit_member',
          `تعديل بيانات المشترك: ${memberData.name}`
        );
      }
    } else {
      // Add new
      const plan = memberData.planType || 'month';
      const newMember: Member = {
        ...memberData,
        id: 'mem-' + Date.now(),
        createdAt: new Date().toISOString(),
        createdBy: operatorName,
        giftsClaimed: [],
        planType: plan,
        history: [
          {
            id: 'h-' + Date.now(),
            startDate: memberData.startDate,
            endDate: memberData.endDate,
            amount: memberData.amount,
            durationMonths: memberData.durationMonths || 1,
            paidAt: memberData.startDate,
            notes: 'الاشتراك الأول',
            planType: plan,
            recordedBy: operatorName,
          },
        ],
      };
      setMembers((prev) => [newMember, ...prev]);
      if (currentUser) {
        logActivity(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'add_member',
          `تسجيل مشترك جديد: ${memberData.name} (${memberData.amount} ج.م)`
        );
      }
    }
  };

  const handleConfirmRenew = (
    memberId: string,
    newStartDate: string,
    newEndDate: string,
    amount: number,
    monthsToAdd: number,
    note: string,
    planType?: SubscriptionPlanId
  ) => {
    const operatorName = currentUser?.name || 'إدارة الصالة';
    let renewedMemberName = '';

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        renewedMemberName = m.name;
        const resolvedPlan = planType || m.planType || 'month';
        const newConsecutive = Math.round(((m.consecutiveMonths || 0) + monthsToAdd) * 10) / 10;
        const newHistoryRecord = {
          id: 'renew-' + Date.now(),
          startDate: newStartDate,
          endDate: newEndDate,
          amount,
          durationMonths: monthsToAdd,
          paidAt: new Date().toISOString().split('T')[0],
          notes: note || 'تجديد اشتراك',
          planType: resolvedPlan,
          recordedBy: operatorName,
        };

        return {
          ...m,
          startDate: newStartDate,
          endDate: newEndDate,
          amount,
          durationMonths: monthsToAdd,
          planType: resolvedPlan,
          consecutiveMonths: newConsecutive,
          updatedBy: operatorName,
          history: [...(m.history || []), newHistoryRecord],
        };
      })
    );

    if (currentUser && renewedMemberName) {
      logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'renew_member',
        `تجديد اشتراك للمشترك: ${renewedMemberName} بقيمة ${amount} ج.م`
      );
    }
  };

  const handleConfirmAwardGift = (memberId: string, giftType: string, note: string) => {
    const operatorName = currentUser?.name || 'إدارة الصالة';
    let memberName = '';

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        memberName = m.name;
        const newGiftRecord = {
          id: 'gift-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          giftType,
          notes: note,
          awardedBy: operatorName,
        };
        return {
          ...m,
          giftsClaimed: [...(m.giftsClaimed || []), newGiftRecord],
        };
      })
    );

    if (currentUser && memberName) {
      logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'award_gift',
        `تسليم هدية ولاء (${giftType}) للمشترك: ${memberName}`
      );
    }
  };

  const handleDeleteMember = (memberId: string) => {
    if (!currentUser?.permissions.canDeleteMember && currentUser?.role !== 'admin') {
      alert('عذراً، حذف المشتركين مقتصر فقط على مدير الصالة!');
      setDeletingMember(null);
      return;
    }

    const target = members.find((m) => m.id === memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setDeletingMember(null);

    if (currentUser && target) {
      logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'delete_member',
        `حذف المشترك: ${target.name} نهائياً من النظام`
      );
    }
  };

  // Export Data to JSON
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gym_members_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Data from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          setMembers(parsed);
          alert('تم استيراد بيانات المشتركين بنجاح!');
          if (currentUser) {
            logActivity(
              currentUser.id,
              currentUser.name,
              currentUser.role,
              'restore_backup',
              'استيراد ملف قاعدة بيانات المشتركين'
            );
          }
        } else {
          alert('ملف البيانات غير صالح!');
        }
      } catch {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Restore data from backup modal (Full replace or Smart merge)
  const handleRestoreData = (newMembers: Member[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setMembers(newMembers);
    } else {
      const map = new Map<string, Member>();
      members.forEach((m) => map.set(m.id, m));
      newMembers.forEach((m) => map.set(m.id, m));
      setMembers(Array.from(map.values()));
    }
    if (currentUser) {
      logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'restore_backup',
        `استعادة نسخة احتياطية من البيانات (${mode === 'replace' ? 'استبدال كامل' : 'دمج ذكي'})`
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetSampleData = () => {
    if (currentUser?.role !== 'admin') {
      alert('استعادة البيانات الافتراضية إجراء حساس مقتصر على مدير الصالة فقط!');
      return;
    }
    if (window.confirm('هل تريد استعادة البيانات الافتراضية التجريبية للجيم؟')) {
      setMembers(INITIAL_MEMBERS);
      if (currentUser) {
        logActivity(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'restore_backup',
          'استعادة البيانات النموذجية الافتراضية'
        );
      }
    }
  };

  // Security Gate: Staff & Admin authentication required
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      
      {/* Top Navigation Header */}
      <Header
        currentUser={currentUser}
        onOpenAddModal={() => {
          setEditingMember(null);
          setIsMemberModalOpen(true);
        }}
        onOpenLoyaltyInfo={() => setIsLoyaltyInfoOpen(true)}
        onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onOpenUsersManagement={() => setIsUsersModalOpen(true)}
        onLogout={handleLogout}
        onPrint={handlePrint}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Urgent & Celebration Banners */}
        <AlertBanner
          loyaltyEligibleMembers={loyaltyEligibleMembers}
          expiredMembers={expiredMembers}
          expiringSoonMembers={expiringSoonMembers}
          currentFilter={currentFilter}
          onSelectFilter={setCurrentFilter}
        />

        {/* High-Level Statistics Cards */}
        <StatCards
          stats={stats}
          currentFilter={currentFilter}
          onSelectFilter={setCurrentFilter}
        />

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'الكل', count: stats.totalMembers },
                { id: 'active', label: 'الاشتراكات السارية', count: stats.activeMembers, icon: CheckCircle2 },
                { id: 'expired', label: 'منتهي (تنبيه ⚠️)', count: stats.expiredMembers, icon: AlertCircle, badgeColor: 'text-rose-600' },
                { id: 'expiring_soon', label: 'ينتهي خلال ٧ أيام', count: stats.expiringSoonMembers, icon: Clock },
                { id: 'loyalty_eligible', label: 'هدايا ولاء ٦ أشهر 🎁', count: stats.loyaltyEligibleCount, icon: Gift, badgeColor: 'text-purple-700 font-bold' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-filter-${tab.id}`}
                  onClick={() => setCurrentFilter(tab.id as FilterStatus)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    currentFilter === tab.id
                      ? tab.id === 'loyalty_eligible'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : tab.id === 'expired'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.icon && <tab.icon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                    currentFilter === tab.id 
                      ? 'bg-white/25 text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              
              {/* Search input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-search-members"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم أو الهاتف..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <select
                id="select-sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="endDate_asc">الأقرب انتهاءً أولاً</option>
                <option value="endDate_desc">الأبعد انتهاءً أولاً</option>
                <option value="consecutive_desc">الأعلى في شهور الولاء 🎁</option>
                <option value="name">الاسم أبجدياً</option>
              </select>

              {/* View Toggle: Grid / Table */}
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                <button
                  id="btn-view-grid"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="عرض كروت"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  id="btn-view-table"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="عرض جدول"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Subscription Plan Quick Filters (8 Plans Requested) */}
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 shrink-0 ml-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>الباقة:</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedPlanFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                جميع الباقات ({members.length})
              </button>
              {getSubscriptionPlans(planPrices).map((plan) => {
                const count = members.filter((m) => (m.planType || 'month') === plan.id).length;
                const isSelected = selectedPlanFilter === plan.id;
                return (
                  <button
                    key={plan.id}
                    id={`btn-filter-plan-${plan.id}`}
                    type="button"
                    onClick={() => setSelectedPlanFilter(plan.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? `${plan.badgeBg} ${plan.badgeText} border ${plan.badgeBorder} ring-2 ring-blue-500/20 shadow-xs font-bold`
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{plan.icon}</span>
                    <span>{plan.name}</span>
                    <span className="text-[10px] opacity-75 font-normal">({count})</span>
                    <span className={`text-[10px] font-bold px-1 py-0.2 rounded ${
                      isSelected ? 'bg-black/15 text-inherit' : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {plan.defaultPrice} ج.م
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick pricing trigger button */}
            <button
              id="btn-quick-pricing"
              type="button"
              onClick={() => setIsPricingModalOpen(true)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-2xs mr-auto"
              title="تعديل أسعار باقات الاشتراكات الـ 8"
            >
              <Tags className="w-3.5 h-3.5 text-amber-600" />
              <span>تعديل الأسعار</span>
            </button>
          </div>

        </div>

        {/* Results Header / Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
          <div>
            عرض <strong className="text-slate-900">{filteredMembers.length}</strong> من أصل{' '}
            <strong className="text-slate-900">{members.length}</strong> مشترك
            {(currentFilter !== 'all' || selectedPlanFilter !== 'all' || searchQuery) && (
              <button 
                onClick={() => {
                  setCurrentFilter('all');
                  setSelectedPlanFilter('all');
                  setSearchQuery('');
                }}
                className="mr-2 text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                (إعادة ضبط التصفيات ↺)
              </button>
            )}
          </div>
          {currentFilter !== 'all' && (
            <button
              onClick={() => {
                setCurrentFilter('all');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              إلغاء التصفية
            </button>
          )}
        </div>

        {/* Members List (Grid or Table) */}
        {filteredMembers.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  canDelete={currentUser.permissions.canDeleteMember || currentUser.role === 'admin'}
                  canEdit={currentUser.permissions.canEditMember || currentUser.role === 'admin'}
                  canRenew={currentUser.permissions.canRenewMember || currentUser.role === 'admin'}
                  canAwardGift={currentUser.permissions.canAwardGift || currentUser.role === 'admin'}
                  onRenew={(m) => setRenewingMember(m)}
                  onEdit={(m) => {
                    setEditingMember(m);
                    setIsMemberModalOpen(true);
                  }}
                  onDelete={(m) => setDeletingMember(m)}
                  onShowHistory={(m) => setHistoryMember(m)}
                  onAwardLoyaltyGift={(m) => setAwardingGiftMember(m)}
                />
              ))}
            </div>
          ) : (
            <MemberTable
              members={filteredMembers}
              canDelete={currentUser.permissions.canDeleteMember || currentUser.role === 'admin'}
              canEdit={currentUser.permissions.canEditMember || currentUser.role === 'admin'}
              canRenew={currentUser.permissions.canRenewMember || currentUser.role === 'admin'}
              onRenew={(m) => setRenewingMember(m)}
              onEdit={(m) => {
                setEditingMember(m);
                setIsMemberModalOpen(true);
              }}
              onDelete={(m) => setDeletingMember(m)}
              onShowHistory={(m) => setHistoryMember(m)}
              onAwardLoyaltyGift={(m) => setAwardingGiftMember(m)}
            />
          )
        ) : (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center my-6 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              لا يوجد مشتركون مطابقون لمعايير البحث
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              جرّب تغيير كلمات البحث، أو إزالة التصفية، أو إضافة مشترك جديد.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentFilter('all');
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              >
                إعادة ضبط البحث
              </button>
              <button
                onClick={() => {
                  setEditingMember(null);
                  setIsMemberModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs transition-colors"
              >
                تسجيل مشترك جديد
              </button>
            </div>
          </div>
        )}

        {/* Bottom Helper Bar */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            💡 يتم حفظ كافة بيانات المشتركين وتحديثات الاشتراكات محلياً ومزامنتها تلقائياً.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSampleData}
              className="text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>استعادة البيانات النموذجية</span>
            </button>
          </div>
        </div>

      </main>

      {/* Modal: Add / Edit Member */}
      <MemberModal
        isOpen={isMemberModalOpen}
        editingMember={editingMember}
        customPrices={planPrices}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
      />

      {/* Modal: Renew Subscription */}
      <RenewModal
        isOpen={!!renewingMember}
        member={renewingMember}
        customPrices={planPrices}
        onClose={() => setRenewingMember(null)}
        onConfirmRenew={handleConfirmRenew}
      />

      {/* Modal: Manage Subscription Pricing */}
      <SubscriptionPricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentPrices={planPrices}
        onPricesUpdated={(newPrices) => {
          setPlanPrices(newPrices);
          if (currentUser) {
            logActivity(
              currentUser.id,
              currentUser.name,
              currentUser.role,
              'change_pricing',
              'تعديل وحفظ أسعار باقات الاشتراكات الـ 8'
            );
          }
        }}
      />

      {/* Modal: Award 6-Month Loyalty Gift */}
      <LoyaltyGiftModal
        isOpen={!!awardingGiftMember}
        member={awardingGiftMember}
        onClose={() => setAwardingGiftMember(null)}
        onConfirmAward={handleConfirmAwardGift}
      />

      {/* Modal: Member History & Logs */}
      <MemberHistoryModal
        isOpen={!!historyMember}
        member={historyMember}
        onClose={() => setHistoryMember(null)}
      />

      {/* Modal: Loyalty Program Explanation */}
      <LoyaltyProgramInfoModal
        isOpen={isLoyaltyInfoOpen}
        onClose={() => setIsLoyaltyInfoOpen(false)}
      />

      {/* Modal: Delete Confirmation */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">تأكيد حذف المشترك</h3>
              <p className="text-xs text-slate-600 mt-1">
                هل أنت متأكد من رغبتك في حذف المشترك{' '}
                <strong className="text-rose-600">{deletingMember.name}</strong> نهائياً من النظام؟
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingMember(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                id="btn-confirm-delete"
                onClick={() => handleDeleteMember(deletingMember.id)}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs transition-colors"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Desktop Versions (Mac & Windows) */}
      <DesktopInstallModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />

      {/* Modal: Data Backup, Restore & Google Drive Center */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        members={members}
        onRestoreData={handleRestoreData}
        onRequestGoogleDriveConnect={() => {
          alert('لربط Google Drive تلقائياً، يمكنك حفظ ملف النسخة الاحتياطية وتحديده في مجلد Google Drive للمزامنة الفورية، أو من خلال إعدادات OAuth.');
        }}
      />

      {/* Modal: Staff & Users Management (Admin) */}
      <UsersManagementModal
        isOpen={isUsersModalOpen}
        currentUser={currentUser}
        onClose={() => setIsUsersModalOpen(false)}
        onUsersUpdated={() => {
          const refreshed = getCurrentUser();
          if (refreshed) {
            setCurrentUser(refreshed);
          }
        }}
      />

      {/* Floating Mobile PWA Install Prompt */}
      <PWAInstallButton variant="floating" />

    </div>
  );
}
