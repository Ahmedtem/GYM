import React, { useState, useEffect } from 'react';
import { X, RotateCw, Check, Calendar, DollarSign, Gift, Sparkles } from 'lucide-react';
import { Member, SubscriptionPlanId } from '../types';
import { getTodayStr, getSubscriptionStatus, formatArabicDate } from '../utils/dateUtils';
import { 
  SUBSCRIPTION_PLANS, 
  calculatePlanEndDate, 
  getPlanById,
  getSubscriptionPlans
} from '../utils/subscriptionPlans';

interface RenewModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onConfirmRenew: (
    memberId: string, 
    newStartDate: string, 
    newEndDate: string, 
    amount: number, 
    monthsToAdd: number, 
    note: string,
    planType?: SubscriptionPlanId
  ) => void;
  customPrices?: Record<SubscriptionPlanId, number>;
}

export const RenewModal: React.FC<RenewModalProps> = ({
  isOpen,
  member,
  onClose,
  onConfirmRenew,
  customPrices,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('month');
  const [durationMonths, setDurationMonths] = useState(1);
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(calculatePlanEndDate(getTodayStr(), 'month'));
  const [amount, setAmount] = useState<number | ''>(400);
  const [note, setNote] = useState('');

  const availablePlans = getSubscriptionPlans(customPrices);

  useEffect(() => {
    if (member) {
      const today = getTodayStr();
      const { status } = getSubscriptionStatus(member.endDate);
      
      // If expired, default start date is today; if still active, start from existing end date
      let initialStart = today;
      if (status === 'active' || status === 'expiring_soon') {
        initialStart = member.endDate;
      }

      // Default to member's existing plan or month
      const plan = getPlanById(member.planType, member.durationMonths, customPrices);
      setSelectedPlanId(plan.id);
      setDurationMonths(plan.monthsEquivalent);
      setStartDate(initialStart);
      setEndDate(calculatePlanEndDate(initialStart, plan.id));
      setAmount(member.amount || plan.defaultPrice);
      setNote('');
    }
  }, [member, isOpen, customPrices]);

  const handleSelectPlan = (planId: SubscriptionPlanId) => {
    setSelectedPlanId(planId);
    const plan = getPlanById(planId, undefined, customPrices);
    setDurationMonths(plan.monthsEquivalent);
    if (startDate) {
      setEndDate(calculatePlanEndDate(startDate, planId));
    }
    // Update suggested amount
    setAmount(plan.defaultPrice);
  };

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (selectedPlanId) {
      setEndDate(calculatePlanEndDate(newStart, selectedPlanId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    onConfirmRenew(
      member.id,
      startDate,
      endDate,
      Number(amount) || 0,
      durationMonths,
      note.trim(),
      selectedPlanId
    );
    onClose();
  };

  if (!isOpen || !member) return null;

  const currentPlan = getPlanById(selectedPlanId, undefined, customPrices);
  const currentConsecutive = member.consecutiveMonths || 0;
  const nextConsecutive = Math.round((currentConsecutive + durationMonths) * 10) / 10;
  const willQualifyForLoyalty = nextConsecutive >= 6 && Math.floor(nextConsecutive / 6) > (member.giftsClaimed?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="modal-renew-subscription"
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <RotateCw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">تجديد اشتراك الجيم</h2>
              <p className="text-xs text-slate-500">للمشترك: <span className="text-blue-700 font-bold">{member.name}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto">
          
          {/* All 8 Subscription Plan Options */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 font-bold text-xs">
                اختر مدة ونوع التجديد
              </label>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                الباقة: {currentPlan.name} ({currentPlan.tag})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availablePlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    id={`btn-renew-plan-${plan.id}`}
                    type="button"
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`p-2 rounded-xl text-right border transition-all cursor-pointer flex flex-col justify-between gap-1 relative ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/25'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{plan.icon}</span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {plan.tag}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-xs leading-tight">{plan.name}</div>
                      <div className={`text-[10px] font-medium mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {plan.defaultPrice} ج.م
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Note about selected plan */}
            <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-1.5">
              <span>{currentPlan.icon}</span>
              <span className="font-bold text-slate-700">{currentPlan.name}:</span>
              <span>{currentPlan.description}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                بداية التجديد
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                تاريخ الانتهاء الجديد
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              قيمة التجديد (ج.م)
            </label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              placeholder="400"
              required
            />
          </div>

          {/* Loyalty Impact Preview */}
          <div className={`p-3 rounded-xl border ${
            willQualifyForLoyalty
              ? 'bg-purple-50/70 border-purple-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Gift className={`w-3.5 h-3.5 ${willQualifyForLoyalty ? 'text-purple-600' : 'text-slate-400'}`} />
                تأثير التجديد على برنامج الولاء:
              </span>
              <span className="font-bold text-purple-700">
                {currentConsecutive} ⬅ {nextConsecutive} أشهر متتالية
              </span>
            </div>
            {willQualifyForLoyalty && (
              <p className="text-[11px] text-purple-900 font-bold mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                رائع! بهذا التجديد سيتأهل المشترك فوراً لاستلام هدية إتمام الـ ٦ أشهر! 🎁
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ملاحظة التجديد (اختياري)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: تم دفع الاشتراك كاش بالكامل..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
            >
              إلغاء
            </button>
            <button
              id="btn-confirm-renew"
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-transform active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>تأكيد التجديد وتحديث الاشتراك</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
