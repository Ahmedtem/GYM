import React from 'react';
import { X, Calendar, History, Gift, CheckCircle2, DollarSign } from 'lucide-react';
import { Member } from '../types';
import { formatArabicDate, formatCurrency } from '../utils/dateUtils';
import { getPlanById } from '../utils/subscriptionPlans';

interface MemberHistoryModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
}

export const MemberHistoryModal: React.FC<MemberHistoryModalProps> = ({
  isOpen,
  member,
  onClose,
}) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="modal-member-history"
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">سجل اشتراكات وهدايا المشترك</h2>
              <p className="text-xs text-slate-500">{member.name} • {member.phone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          
          {/* Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-500 block">إجمالي الشهور المتتالية</span>
              <span className="text-base font-bold text-purple-700">{member.consecutiveMonths} شهر</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">هدايا ولاء تم استلامها</span>
              <span className="text-base font-bold text-emerald-700">{member.giftsClaimed?.length || 0} هدية 🎁</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">تاريخ أول تسجيل</span>
              <span className="text-xs font-bold text-slate-700 mt-1 block">{formatArabicDate(member.createdAt || member.startDate)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">الموظف المسجل</span>
              <span className="text-xs font-bold text-slate-900 mt-1 block truncate">
                {member.createdBy || 'إدارة الصالة'}
              </span>
            </div>
          </div>

          {/* Loyalty Gifts History */}
          <div>
            <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Gift className="w-4 h-4" />
              سجل هدايا ولاء الـ ٦ أشهر المستلمة
            </h3>
            {member.giftsClaimed && member.giftsClaimed.length > 0 ? (
              <div className="space-y-2">
                {member.giftsClaimed.map((gift, idx) => (
                  <div key={gift.id || idx} className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{gift.giftType}</p>
                        {gift.notes && <p className="text-[11px] text-slate-500 mt-0.5">{gift.notes}</p>}
                        {gift.awardedBy && (
                          <p className="text-[10px] text-purple-600 font-semibold mt-0.5">
                            الموظف المسؤول: {gift.awardedBy}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                      {formatArabicDate(gift.date)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                لم يتم تسليم أي هدايا ولاء بعد لهذا المشترك.
              </p>
            )}
          </div>

          {/* Subscriptions History */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              سجل فترات الاشتراكات والدفع
            </h3>
            {member.history && member.history.length > 0 ? (
              <div className="space-y-2">
                {member.history.slice().reverse().map((rec, idx) => {
                  const plan = getPlanById(rec.planType, rec.durationMonths);
                  return (
                    <div key={rec.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-xs">
                            {formatArabicDate(rec.startDate)} ⬅ {formatArabicDate(rec.endDate)}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${plan.badgeBg} ${plan.badgeText} ${plan.badgeBorder} flex items-center gap-1`}>
                            <span>{plan.icon}</span>
                            <span>{plan.name}</span>
                          </span>
                        </div>
                        {rec.notes && <p className="text-[11px] text-slate-500 mt-0.5">{rec.notes}</p>}
                        {rec.recordedBy && (
                          <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
                            الموظف المنفذ: {rec.recordedBy}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 text-xs shrink-0">
                        {formatCurrency(rec.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-800 text-xs">
                    {formatArabicDate(member.startDate)} ⬅ {formatArabicDate(member.endDate)}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 mr-2">
                    الاشتراك الحالي
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-xs">
                  {formatCurrency(member.amount)}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
