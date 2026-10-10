import React from 'react';
import { Gift, AlertTriangle, Clock, ArrowLeft, RotateCw } from 'lucide-react';
import { Member, FilterStatus } from '../types';
import { formatArabicDate } from '../utils/dateUtils';

interface AlertBannerProps {
  loyaltyEligibleMembers: Member[];
  expiredMembers: Member[];
  expiringSoonMembers: Member[];
  currentFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  loyaltyEligibleMembers,
  expiredMembers,
  expiringSoonMembers,
  currentFilter,
  onSelectFilter,
}) => {
  const hasLoyalty = loyaltyEligibleMembers.length > 0;
  const hasExpired = expiredMembers.length > 0;
  const hasExpiringSoon = expiringSoonMembers.length > 0;

  if (!hasLoyalty && !hasExpired && !hasExpiringSoon) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
      
      {/* 1. Loyalty Gifts Section (High Density style) */}
      {hasLoyalty && (
        <div
          id="banner-loyalty-alert"
          className="bg-white border border-purple-200/80 rounded-xl overflow-hidden shadow-xs flex flex-col"
        >
          <div className="p-3 border-b border-purple-100 bg-purple-50/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-700 shrink-0" />
              <h3 className="font-bold text-purple-900 text-xs sm:text-sm">
                هدايا برنامج الولاء (٦ أشهر متصلة)
              </h3>
            </div>
            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {loyaltyEligibleMembers.length} مكافآت
            </span>
          </div>

          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {loyaltyEligibleMembers.slice(0, 2).map((m) => (
                <div
                  key={m.id}
                  className="p-2 bg-purple-50/40 border border-purple-100 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{m.name}</p>
                    <p className="text-[10px] text-purple-700 font-medium">أتم {m.consecutiveMonths} شهور متتالية بدون انقطاع</p>
                  </div>
                  <div className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded font-bold shrink-0">
                    مستحق هدية
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                {loyaltyEligibleMembers.length} أعضاء مؤهلين للهدية
              </span>
              <button
                id="btn-filter-loyalty"
                onClick={() => onSelectFilter('loyalty_eligible')}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  currentFilter === 'loyalty_eligible'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                }`}
              >
                <span>تسليم المكافآت</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Expiry Alerts Section (High Density style) */}
      {hasExpired && (
        <div
          id="banner-expired-alert"
          className="bg-white border border-rose-200/80 rounded-xl overflow-hidden shadow-xs flex flex-col"
        >
          <div className="p-3 border-b border-rose-100 bg-rose-50/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              <h3 className="font-bold text-rose-900 text-xs sm:text-sm">
                تنبيهات انتهاء الاشتراك
              </h3>
            </div>
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {expiredMembers.length} عاجل
            </span>
          </div>

          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {expiredMembers.slice(0, 2).map((m) => (
                <div
                  key={m.id}
                  className="p-2 bg-rose-50/30 border border-rose-100 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{m.name}</p>
                    <p className="text-[10px] text-slate-500">انتهى في: {formatArabicDate(m.endDate)}</p>
                  </div>
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                    منتهي
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                {expiredMembers.length} اشتراك بحاجة للمتابعة
              </span>
              <button
                id="btn-filter-expired"
                onClick={() => onSelectFilter('expired')}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  currentFilter === 'expired'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                }`}
              >
                <span>متابعة التجديد</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Expiring Soon Alert */}
      {hasExpiringSoon && (
        <div
          id="banner-expiring-soon-alert"
          className="bg-white border border-amber-200/80 rounded-xl overflow-hidden shadow-xs flex flex-col"
        >
          <div className="p-3 border-b border-amber-100 bg-amber-50/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <h3 className="font-bold text-amber-900 text-xs sm:text-sm">
                تنبيه: اشتراكات تنتهي قريباً
              </h3>
            </div>
            <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {expiringSoonMembers.length} خلال ٧ أيام
            </span>
          </div>

          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {expiringSoonMembers.slice(0, 2).map((m) => (
                <div
                  key={m.id}
                  className="p-2 bg-amber-50/30 border border-amber-100 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{m.name}</p>
                    <p className="text-[10px] text-amber-700 font-medium">ينتهي في: {formatArabicDate(m.endDate)}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                    قريباً
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                تذكير استباقي للأعضاء
              </span>
              <button
                id="btn-filter-expiring-soon"
                onClick={() => onSelectFilter('expiring_soon')}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  currentFilter === 'expiring_soon'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <span>عرض الأعضاء</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
