import React, { useState, useEffect } from 'react';
import { X, User, Check, Calendar, DollarSign, Sparkles } from 'lucide-react';
import { Member, SubscriptionPlanId } from '../types';
import { getTodayStr } from '../utils/dateUtils';
import { 
  SUBSCRIPTION_PLANS, 
  calculatePlanEndDate, 
  getPlanById,
  getSubscriptionPlans
} from '../utils/subscriptionPlans';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Omit<Member, 'id' | 'createdAt' | 'giftsClaimed' | 'history'> & { id?: string }) => void;
  editingMember?: Member | null;
  customPrices?: Record<SubscriptionPlanId, number>;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMember,
  customPrices,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState(getTodayStr());
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('month');
  const [durationMonths, setDurationMonths] = useState(1);
  const [endDate, setEndDate] = useState(calculatePlanEndDate(getTodayStr(), 'month'));
  const [amount, setAmount] = useState<number | ''>(400);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [consecutiveMonths, setConsecutiveMonths] = useState(1);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; amount?: string }>({});

  const availablePlans = getSubscriptionPlans(customPrices);

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name);
      setPhone(editingMember.phone);
      setStartDate(editingMember.startDate);
      setEndDate(editingMember.endDate);
      const plan = getPlanById(editingMember.planType, editingMember.durationMonths, customPrices);
      setSelectedPlanId(plan.id);
      setDurationMonths(editingMember.durationMonths || plan.monthsEquivalent);
      setAmount(editingMember.amount);
      setGender(editingMember.gender || 'male');
      setConsecutiveMonths(editingMember.consecutiveMonths || 1);
      setNotes(editingMember.notes || '');
    } else {
      // Reset for new member
      const today = getTodayStr();
      const defaultPlan = getPlanById('month', undefined, customPrices);
      setName('');
      setPhone('');
      setStartDate(today);
      setSelectedPlanId('month');
      setDurationMonths(defaultPlan.monthsEquivalent);
      setEndDate(calculatePlanEndDate(today, 'month'));
      setAmount(defaultPlan.defaultPrice);
      setGender('male');
      setConsecutiveMonths(1);
      setNotes('');
    }
    setErrors({});
  }, [editingMember, isOpen, customPrices]);

  // When plan changes, auto-calculate end date and suggested amount
  const handleSelectPlan = (planId: SubscriptionPlanId) => {
    setSelectedPlanId(planId);
    const plan = getPlanById(planId, undefined, customPrices);
    setDurationMonths(plan.monthsEquivalent);
    if (startDate) {
      setEndDate(calculatePlanEndDate(startDate, planId));
    }
    // Suggest default amount unless editing existing member
    if (!editingMember) {
      setAmount(plan.defaultPrice);
    }
  };

  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    if (selectedPlanId) {
      setEndDate(calculatePlanEndDate(newStartDate, selectedPlanId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string; amount?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'يرجى إدخال اسم المشترك';
    }
    if (!phone.trim()) {
      newErrors.phone = 'يرجى إدخال رقم الهاتف';
    }
    if (amount === '' || Number(amount) < 0) {
      newErrors.amount = 'يرجى إدخال قيمة اشتراك صحيحة';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: editingMember?.id,
      name: name.trim(),
      phone: phone.trim(),
      startDate,
      endDate,
      durationMonths,
      planType: selectedPlanId,
      amount: Number(amount),
      gender,
      consecutiveMonths: Number(consecutiveMonths) || 1,
      notes: notes.trim(),
    });

    onClose();
  };

  const currentPlan = getPlanById(selectedPlanId, undefined, customPrices);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="modal-member-form"
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingMember ? 'تعديل بيانات المشترك' : 'تسجيل مشترك جديد في الجيم'}
              </h2>
              <p className="text-[11px] text-slate-500">اختر نوع الاشتراك والمدة وسجل بيانات العميل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with smooth scrolling */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto">
          
          {/* Member Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              اسم المشترك <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-member-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد مصطفى إبراهيم"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  errors.name ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
                }`}
              />
            </div>
            {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Phone & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                رقم الهاتف <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-member-phone"
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-rose-600 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">الجنس</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer text-xs ${
                    gender === 'male'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ذكر 👨
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer text-xs ${
                    gender === 'female'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  أنثى 👩
                </button>
              </div>
            </div>
          </div>

          {/* All 8 Subscription Plans Requested */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 font-bold text-xs">
                نوع ومدة الاشتراك (اختر الباقة) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                الباقة المحددة: {currentPlan.name}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availablePlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    id={`btn-plan-${plan.id}`}
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

            {/* Explanatory note for selected plan */}
            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{currentPlan.icon}</span>
                <div>
                  <span className="font-bold text-slate-800">{currentPlan.name}: </span>
                  <span className="text-[11px] text-slate-600">{currentPlan.description}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${currentPlan.badgeBg} ${currentPlan.badgeText} ${currentPlan.badgeBorder}`}>
                {currentPlan.tag}
              </span>
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                تاريخ بداية الاشتراك
              </label>
              <input
                id="input-member-start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                تاريخ انتهاء الاشتراك
              </label>
              <input
                id="input-member-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Amount & Loyalty Consecutive Months */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                قيمة الاشتراك (ج.م) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-member-amount"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full px-3.5 py-2 rounded-xl bg-white border text-slate-900 focus:outline-none focus:ring-2 ${
                    errors.amount ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
                  }`}
                  placeholder="400"
                />
              </div>
              {errors.amount && <p className="text-rose-600 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                الشهور المتتالية (برنامج الولاء)
              </label>
              <input
                id="input-consecutive-months"
                type="number"
                min="0"
                value={consecutiveMonths}
                onChange={(e) => setConsecutiveMonths(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                title="عدد الأشهر التي اشترك بها العميل متصلة - عند بلوغ ٦ أشهر يستحق هدية"
              />
              <p className="text-[10px] text-purple-700 mt-1 font-medium">
                {consecutiveMonths >= 6 
                  ? '🎉 هذا الرقم يؤهل المشترك لاستلام هدية الولاء فوراً!' 
                  : `متبقي ${6 - (consecutiveMonths % 6)} أشهر لاستحقاق هدية الـ ٦ أشهر`}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ملاحظات إضافية (أهداف، برنامج خاص، تدريب شخصي)
            </label>
            <textarea
              id="input-member-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: الهدف كمال أجسام وتضخيم - يعاني من إصابة في الركبة..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="btn-save-member"
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-transform active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{editingMember ? 'حفظ التعديلات' : 'تسجيل المشترك'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
