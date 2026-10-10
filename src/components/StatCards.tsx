import React from 'react';
import { Users, CheckCircle2, AlertCircle, Gift, DollarSign } from 'lucide-react';
import { FilterStatus, GymStats } from '../types';
import { formatCurrency } from '../utils/dateUtils';

interface StatCardsProps {
  stats: GymStats;
  currentFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  stats,
  currentFilter,
  onSelectFilter,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      
      {/* 1. Total Members */}
      <div
        id="card-stat-total"
        onClick={() => onSelectFilter('all')}
        className={`bg-white p-4 rounded-xl shadow-xs border transition-all cursor-pointer select-none border-r-4 border-r-blue-600 ${
          currentFilter === 'all'
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 mb-1 font-medium">إجمالي المشتركين</p>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900">{stats.totalMembers}</span>
          <span className="text-xs text-slate-400 font-medium">مشترك</span>
        </div>
      </div>

      {/* 2. Active Members */}
      <div
        id="card-stat-active"
        onClick={() => onSelectFilter('active')}
        className={`bg-white p-4 rounded-xl shadow-xs border transition-all cursor-pointer select-none border-r-4 border-r-green-500 ${
          currentFilter === 'active'
            ? 'border-green-500 ring-2 ring-green-500/20 bg-green-50/20'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 mb-1 font-medium">اشتراكات نشطة</p>
          <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-green-600">{stats.activeMembers}</span>
          <span className="text-xs text-green-700/60 font-medium">ساري المفعول</span>
        </div>
      </div>

      {/* 3. Expired Subscriptions (Alert) */}
      <div
        id="card-stat-expired"
        onClick={() => onSelectFilter('expired')}
        className={`bg-white p-4 rounded-xl shadow-xs border transition-all cursor-pointer select-none border-r-4 border-r-rose-500 ${
          currentFilter === 'expired'
            ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 mb-1 font-medium">اشتراكات منتهية</p>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-rose-600">{stats.expiredMembers}</span>
          <span className="text-xs text-rose-600/70 font-medium">بحاجة لتجديد</span>
        </div>
      </div>

      {/* 4. Loyalty Program 6-Month Gifts */}
      <div
        id="card-stat-loyalty"
        onClick={() => onSelectFilter('loyalty_eligible')}
        className={`bg-white p-4 rounded-xl shadow-xs border transition-all cursor-pointer select-none border-r-4 border-r-purple-500 relative ${
          currentFilter === 'loyalty_eligible'
            ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        {stats.loyaltyEligibleCount > 0 && (
          <span className="absolute top-3 left-3 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
          </span>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 mb-1 font-medium">مؤهلين لبرنامج الولاء</p>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Gift className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-purple-600">{stats.loyaltyEligibleCount}</span>
          <span className="text-xs text-purple-600/70 font-medium">مكافأة ٦ أشهر</span>
        </div>
      </div>

      {/* 5. Total Revenue */}
      <div
        id="card-stat-revenue"
        className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl shadow-xs border border-slate-200 border-r-4 border-r-amber-500"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 mb-1 font-medium">إجمالي الإيرادات</p>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-xl sm:text-lg lg:text-xl font-bold text-slate-800 block truncate">
            {formatCurrency(stats.totalRevenue)}
          </span>
        </div>
      </div>

    </div>
  );
};
