import React from 'react';
import { X, Gift, Sparkles, CheckCircle2, Trophy, Clock, HeartHandshake } from 'lucide-react';

interface LoyaltyProgramInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyaltyProgramInfoModal: React.FC<LoyaltyProgramInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="modal-loyalty-info"
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-xs sm:text-sm"
      >
        {/* Header */}
        <div className="bg-purple-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 stroke-[2.5]" />
            <h2 className="text-base font-bold tracking-tight">
              كيف يعمل برنامج ولاء العملاء (٦ أشهر)؟
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-600">
          
          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">الهدف من برنامج الولاء</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                تحفيز المشتركين على الالتزام والاستمرار بالتمارين في الجيم شهراً بعد شهر بدون انقطاع، ومكافأة وفائهم بهدية قيمة عند كل ٦ أشهر متتالية.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-purple-700 text-xs uppercase tracking-wider">
              قواعد وشروط استحقاق الهدية:
            </h4>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">
                <strong className="text-slate-900">إكمال ٦ أشهر متتالية:</strong> يقوم البرنامج تلقائياً بعد الأشهر المتتالية مع كل تجديد اشتراك أو تسجيل.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">
                <strong className="text-slate-900">تنبيه فوري وإشعار بالهدية:</strong> بمجرد وصول المشترك إلى ٦ أشهر (أو ١٢، ١٨، إلخ)، يظهر تنبيه بنفسجي بارز في أعلى الشاشة وعلى بطاقة المشترك بأنه مؤهل لاستلام هديته.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">
                <strong className="text-slate-900">تسليم وتوثيق الهدية:</strong> يمكنك بضغطة زر اختيار نوع الهدية (مثل شهر مجاني، شيكر بروتين وتيشيرت الجيم، جلسة مدرب خاص، خصم تجديد) وحفظها في سجل هدايا العميل.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">
                <strong className="text-slate-900">تهنئة تلقائية عبر واتساب:</strong> يوفر النظام رابطاً سريعاً لإرسال رسالة تهنئة جاهزة ومحفزة للعميل عبر الواتساب مباشرة.
              </p>
            </div>
          </div>

          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3 text-xs text-purple-800 flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-600 shrink-0" />
            <span>نظام الهدايا الدوري: العميل الذي يستمر سنة كاملة (١٢ شهر) يستحق هديتين (عند الشهر السادس وعند الشهر الثاني عشر).</span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs transition-colors"
          >
            فهمت، شكراً
          </button>
        </div>

      </div>
    </div>
  );
};
