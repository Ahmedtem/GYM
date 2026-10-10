import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  X, 
  CheckCircle2, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  Sparkles,
  Zap,
  WifiOff,
  ShieldCheck
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MonsterGymLogo } from './MonsterGymLogo';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-rose-950 p-5 text-white flex items-center justify-between border-b border-rose-900/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 p-1 border border-zinc-700/60 flex items-center justify-center shadow-inner">
              <MonsterGymLogo className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">تثبيت تطبيق Monster Gym</h3>
                <span className="bg-rose-600/30 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/40">
                  PWA Mobile
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                تثبيت البرنامج على هاتفك ليعمل كتطبيق كامل وسريع بدون متصفح
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Success state */}
          {installSuccess ? (
            <div className="p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 animate-bounce" />
              <h4 className="font-bold text-base">تم تثبيت التطبيق بنجاح!</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                أصبح تطبيق Monster Gym متاحاً الآن على شاشتك الرئيسية ويمكنك فتحه مباشرة في أي وقت.
              </p>
            </div>
          ) : isInstalled ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div className="text-xs font-semibold">
                التطبيق مثبت بالفعل على هذا الجهاز ويعمل بنمط التطبيق الأصلي المستقل (Standalone).
              </div>
            </div>
          ) : (
            <>
              {/* Direct 1-Click Install Button if supported by browser */}
              {isInstallable && (
                <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3 text-right w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Download className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">تثبيت فوري بضغطة واحدة</h4>
                      <p className="text-xs text-slate-600 dark:text-zinc-400">متصفحك يدعم التثبيت المباشر على الشاشة الرئيسية</p>
                    </div>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    تثبيت الآن على الجهاز
                  </button>
                </div>
              )}

              {/* Tabs: Android vs iOS */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-800/80 p-1 border border-slate-200 dark:border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'android'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  أجهزة أندرويد (Android)
                  {isAndroid && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'ios'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  أجهزة آيفون وآيباد (iPhone / iOS)
                  {isIOS && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                </button>
              </div>

              {/* Tab 1: Android steps */}
              {activeTab === 'android' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    خطوات التثبيت على هواتف أندرويد (Google Chrome / Samsung Browser):
                  </h4>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
                      <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          افتح قائمة المتصفح
                          <MoreVertical className="w-3.5 h-3.5 inline text-slate-500" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          اضغط على علامة النقاط الثلاث (⋮) في أعلى زاوية المتصفح (Chrome أو Samsung Internet).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
                      <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          اختر &quot;تثبيت التطبيق&quot; أو &quot;إضافة إلى الشاشة الرئيسية&quot;
                          <Download className="w-3.5 h-3.5 inline text-rose-500" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          اضغط على &quot;Install app&quot; أو &quot;Add to Home screen&quot; من القائمة المنسدلة.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
                      <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          اضغط &quot;تثبيت&quot; (Install)
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          ستظهر لك أيقونة Monster Gym على شاشة هاتفك مع بقية تطبيقاتك لتفتحه بنقرة واحدة دائماً!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: iOS steps */}
              {activeTab === 'ios' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    خطوات التثبيت على أجهزة iPhone و iPad (متصفح Safari):
                  </h4>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
                      <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          افتح الصفحة في متصفح Safari ثم اضغط زر المشاركة
                          <Share2 className="w-3.5 h-3.5 inline text-blue-500" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          اضغط على زر المشاركة (مربع بسهم لأعلى ⎋) الموجود في أسفل شاشة الآيفون.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
                      <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          مرر لأسفل واختر &quot;إضافة إلى الصفحة الرئيسية&quot;
                          <PlusSquare className="w-3.5 h-3.5 inline text-rose-500" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          اختر خيار &quot;Add to Home Screen&quot; من الخيارات المعروضة.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
                      <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          اضغط على &quot;إضافة&quot; (Add) في الزاوية العلوية
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          سيتم تثبيت التطبيق وتظهر أيقونة Monster Gym فوراً على الشاشة الرئيسية للآيفون!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits of PWA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/30 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-center">
                  <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">سرعة وخفة فائقة</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">بدون الحاجة لمتجر تطبيقات</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/30 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-center">
                  <WifiOff className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">حفظ محلي فوري</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">البيانات مخزنة بأمان على هاتفك</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/30 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">أمان وحماية</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">قفل وشاشات دخول الموظفين</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
            Monster Gym Progressive Web App v2.0
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
