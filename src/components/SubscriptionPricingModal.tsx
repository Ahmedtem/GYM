import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tags, 
  Check, 
  RotateCcw, 
  TrendingUp, 
  Percent, 
  CheckCircle2, 
  DollarSign, 
  Sparkles,
  Info
} from 'lucide-react';
import { SubscriptionPlanId } from '../types';
import { 
  SUBSCRIPTION_PLANS, 
  DEFAULT_PLAN_PRICES, 
  saveCustomPlanPrices, 
  resetCustomPlanPrices 
} from '../utils/subscriptionPlans';
import { formatCurrency } from '../utils/dateUtils';

interface SubscriptionPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrices: Record<SubscriptionPlanId, number>;
  onPricesUpdated: (newPrices: Record<SubscriptionPlanId, number>) => void;
}

export const SubscriptionPricingModal: React.FC<SubscriptionPricingModalProps> = ({
  isOpen,
  onClose,
  currentPrices,
  onPricesUpdated,
}) => {
  const [editedPrices, setEditedPrices] = useState<Record<SubscriptionPlanId, number>>(currentPrices);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk'>('individual');

  // Keep editedPrices in sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditedPrices({ ...currentPrices });
      setSuccessMessage(null);
    }
  }, [isOpen, currentPrices]);

  if (!isOpen) return null;

  const handlePriceChange = (planId: SubscriptionPlanId, value: string | number) => {
    const num = typeof value === 'number' ? value : parseInt(value) || 0;
    setEditedPrices((prev) => ({
      ...prev,
      [planId]: Math.max(0, num),
    }));
  };

  const handleQuickAdjust = (planId: SubscriptionPlanId, delta: number) => {
    setEditedPrices((prev) => {
      const current = prev[planId] ?? DEFAULT_PLAN_PRICES[planId];
      return {
        ...prev,
        [planId]: Math.max(0, current + delta),
      };
    });
  };

  // Bulk adjustment by percentage
  const handleBulkPercentage = (percent: number) => {
    setEditedPrices((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as SubscriptionPlanId[]).forEach((planId) => {
        const curr = updated[planId] ?? DEFAULT_PLAN_PRICES[planId];
        const rawNewPrice = curr * (1 + percent / 100);
        // Round to nearest 5 or 10 EGP
        updated[planId] = Math.max(5, Math.round(rawNewPrice / 10) * 10);
      });
      return updated;
    });
  };

  // Reset to original system defaults
  const handleResetDefaults = () => {
    if (window.confirm('هل أنت متأكد من استعادة أسعار الاشتراكات الافتراضية للجيم؟')) {
      const defaults = resetCustomPlanPrices();
      setEditedPrices({ ...defaults });
      onPricesUpdated(defaults);
      setSuccessMessage('تمت استعادة الأسعار الافتراضية بنجاح!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Save changes
  const handleSave = () => {
    saveCustomPlanPrices(editedPrices);
    onPricesUpdated(editedPrices);
    setSuccessMessage('تم حفظ الأسعار الجديدة بنجاح وتطبيقها على نماذج الاشتراكات والتجديد!');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  // Check if any price differs from default
  const hasCustomizations = (Object.keys(editedPrices) as SubscriptionPlanId[]).some(
    (key) => editedPrices[key] !== DEFAULT_PLAN_PRICES[key]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="modal-subscription-pricing"
        className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-300">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  تعديل تسعير باقات الاشتراكات
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                  ٨ باقات معتمدة
                </span>
              </div>
              <p className="text-xs text-slate-500">
                حدد تسعير كل باقة في الجيم (تُقترح الأسعار تلقائياً عند تسجيل مشترك جديد أو تجديد الاشتراك)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Informative Guidance Banner */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-blue-50/80 border border-blue-200/70 text-blue-900 text-xs flex items-start gap-2.5 shrink-0">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">ملاحظة تنظيمية: </span>
            تعديل الأسعار هنا يُحدد القيمة المقترحة تلقائياً في نافذة <strong className="text-blue-800">إضافة مشترك جديد</strong> ونافذة <strong className="text-blue-800">تجديد الاشتراك</strong>، مع الاحتفاظ بحرية إدخال خصومات أو أسعار خاصة لأي مشترك فردي أثناء التسجيل.
          </div>
        </div>

        {/* Quick Bulk Adjustment Toolbar */}
        <div className="px-6 pt-3 pb-1 shrink-0 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-slate-400" />
              تعديل نسبي سريع:
            </span>
            <button
              type="button"
              onClick={() => handleBulkPercentage(10)}
              className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="زيادة جميع الأسعار بنسبة 10%"
            >
              +10%
            </button>
            <button
              type="button"
              onClick={() => handleBulkPercentage(20)}
              className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="زيادة جميع الأسعار بنسبة 20%"
            >
              +20%
            </button>
            <button
              type="button"
              onClick={() => handleBulkPercentage(-10)}
              className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="تخفيض جميع الأسعار بنسبة 10%"
            >
              -10%
            </button>
          </div>

          {hasCustomizations && (
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الأسعار الافتراضية</span>
            </button>
          )}
        </div>

        {/* Plans List / Grid */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const currentVal = editedPrices[plan.id] ?? DEFAULT_PLAN_PRICES[plan.id];
              const defaultVal = DEFAULT_PLAN_PRICES[plan.id];
              const diff = currentVal - defaultVal;
              const dailyRate = plan.days > 0 ? (currentVal / plan.days).toFixed(1) : currentVal;

              return (
                <div
                  key={plan.id}
                  id={`pricing-card-${plan.id}`}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between gap-3"
                >
                  {/* Plan Top Info */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{plan.icon}</span>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 leading-tight">
                            {plan.name}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {plan.tag} ({plan.days} {plan.days === 1 ? 'يوم' : 'يوماً'})
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${plan.badgeBg} ${plan.badgeText} ${plan.badgeBorder}`}>
                        {plan.badgeLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-normal">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price Setting Inputs */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    {/* Input Field */}
                    <div className="flex items-center gap-1.5">
                      <div className="relative w-28">
                        <input
                          id={`input-price-${plan.id}`}
                          type="number"
                          min="0"
                          step="10"
                          value={currentVal}
                          onChange={(e) => handlePriceChange(plan.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-bold text-sm text-left focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          dir="ltr"
                        />
                        <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400 pointer-events-none">
                          ج.م
                        </span>
                      </div>

                      {/* Quick Adjust Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(plan.id, -50)}
                          className="px-1.5 py-1 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          title="تخفيض 50 ج.م"
                        >
                          -50
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(plan.id, +50)}
                          className="px-1.5 py-1 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          title="زيادة 50 ج.م"
                        >
                          +50
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(plan.id, +100)}
                          className="px-1.5 py-1 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          title="زيادة 100 ج.م"
                        >
                          +100
                        </button>
                      </div>
                    </div>

                    {/* Metadata: Default & Daily Rate */}
                    <div className="text-left text-[10px] text-slate-500" dir="rtl">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>الافتراضي: {defaultVal} ج.م</span>
                        {diff !== 0 && (
                          <span className={`font-bold ${diff > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ({diff > 0 ? `+${diff}` : diff} ج.م)
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[9px] mt-0.5">
                        معدل اليوم: ~{dailyRate} ج.م/يوم
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            سيتم حفظ هذه التسعيرات وتطبيقها مباشرة في النظام.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="btn-save-plan-prices"
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>حفظ وتطبيق الأسعار الجديدة</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
