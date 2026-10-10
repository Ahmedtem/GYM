import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Gift, Check, Sparkles, MessageSquare } from 'lucide-react';
import { Member } from '../types';
import { getTodayStr, formatArabicDate } from '../utils/dateUtils';
import { getWhatsAppLink, generateLoyaltyGiftMessage } from '../utils/whatsappUtils';

interface LoyaltyGiftModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onConfirmAward: (memberId: string, giftType: string, note: string) => void;
}

const PRESET_GIFTS = [
  'شهر اشتراك مجاني إضافي 🎁',
  'تيشيرت الجيم الرسمي + شيكر بروتين 🎽',
  'حقيبة جيم رياضية مميزة 🎒',
  'جلسة تدريب شخصي (Private PT) مجانية 🏋️',
  'قسيمة خصم ٥٠٪ على التجديد القادم 🏷️',
  'عبوة مكمل غذائي / كرياتين / فيتامينات 💊',
];

export const LoyaltyGiftModal: React.FC<LoyaltyGiftModalProps> = ({
  isOpen,
  member,
  onClose,
  onConfirmAward,
}) => {
  const [selectedGift, setSelectedGift] = useState(PRESET_GIFTS[0]);
  const [customGift, setCustomGift] = useState('');
  const [note, setNote] = useState('');
  const [isAwardedSuccess, setIsAwardedSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsAwardedSuccess(false);
      setCustomGift('');
      setNote('');
      // Trigger subtle celebratory confetti burst when modal opens
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#d97706', '#10b981'],
        });
      } catch {
        // fallback
      }
    }
  }, [isOpen]);

  if (!isOpen || !member) return null;

  const handleAward = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGift = customGift.trim() ? customGift.trim() : selectedGift;
    onConfirmAward(member.id, finalGift, note.trim());
    setIsAwardedSuccess(true);

    try {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#fbbf24', '#d97706', '#10b981', '#3b82f6'],
      });
    } catch {
      // ignore
    }
  };

  const loyaltyMsg = generateLoyaltyGiftMessage(member);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="modal-loyalty-gift"
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Banner with crown/gift */}
        <div className="bg-purple-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-xs">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 fill-white" />
                <h2 className="text-base font-bold tracking-tight">
                  تسليم هدية ولاء المشتركين
                </h2>
              </div>
              <p className="text-xs text-purple-100 mt-0.5">
                مكافأة إتمام ٦ أشهر متتالية من الالتزام الرياضي!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAwardedSuccess ? (
          <form onSubmit={handleAward} className="p-6 space-y-4 text-xs sm:text-sm">
            
            {/* Member Info Card */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">اسم المشترك:</span>
                <span className="text-sm font-bold text-slate-900">{member.name}</span>
                <span className="text-xs text-slate-500 block mt-0.5" dir="ltr">
                  {member.phone}
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs text-purple-600 font-semibold block">إجمالي الالتزام:</span>
                <span className="text-sm font-bold text-purple-700">
                  {member.consecutiveMonths} أشهر متتالية
                </span>
              </div>
            </div>

            {/* Gift Selector */}
            <div>
              <label className="block text-slate-700 font-bold mb-2">
                اختر نوع الهدية المقدمة للعميل:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_GIFTS.map((gift) => (
                  <button
                    key={gift}
                    type="button"
                    onClick={() => {
                      setSelectedGift(gift);
                      setCustomGift('');
                    }}
                    className={`p-2.5 text-right rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedGift === gift && !customGift
                        ? 'bg-purple-50 text-purple-700 border-purple-400 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {gift}
                  </button>
                ))}
              </div>
            </div>

            {/* Or custom gift */}
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">
                أو حدد هدية أخرى مخصصة:
              </label>
              <input
                type="text"
                value={customGift}
                onChange={(e) => setCustomGift(e.target.value)}
                placeholder="مثال: اشتراك شهرين بنصف السعر، ميزان InBody مجاني..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-xs"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">
                ملاحظات تسليم الهدية (اختياري):
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="مثال: تم تسليم الشيكر في استقبال الفرع الرئيسي..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-xs"
              />
            </div>

            {/* WhatsApp notification teaser */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                يمكنك أيضاً إرسال رسالة تهنئة رسمية للعميل عبر واتساب فوراً بعد التسليم!
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                id="btn-confirm-award-gift"
                type="submit"
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-transform active:scale-95"
              >
                <Gift className="w-4 h-4" />
                <span>تأكيد تسليم الهدية للعميل 🎁</span>
              </button>
            </div>

          </form>
        ) : (
          /* Success Screen */
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                تم تسجيل تسليم الهدية بنجاح! 🎉
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                تم توثيق استلام كابتن <span className="text-purple-700 font-bold">{member.name}</span> لهدية برنامج ولاء الـ ٦ أشهر في سجله.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                id="btn-whatsapp-congratulate"
                href={getWhatsAppLink(member.phone, loyaltyMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>إرسال تهنئة عبر واتساب 💬</span>
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
