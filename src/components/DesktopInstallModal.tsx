import React, { useState } from 'react';
import { X, Laptop, Monitor, Download, Check, Sparkles, Shield, ArrowDownToLine, Globe, Terminal } from 'lucide-react';
import { MonsterGymLogo } from './MonsterGymLogo';
import { usePWAInstall } from '../utils/usePWAInstall';

interface DesktopInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopInstallModal: React.FC<DesktopInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isMac, isWindows, install } = usePWAInstall();
  const [activeOS, setActiveOS] = useState<'windows' | 'mac'>(isMac ? 'mac' : 'windows');
  const [downloadedLauncher, setDownloadedLauncher] = useState<string | null>(null);

  if (!isOpen) return null;

  // Download Windows .bat launcher script
  const downloadWindowsLauncher = () => {
    const scriptContent = `@echo off
title Monster Gym - Desktop Launcher
echo ====================================================
echo      Starting MONSTER GYM Desktop Application...
echo ====================================================
start msedge --app="${window.location.href}" || start chrome --app="${window.location.href}" || start "" "${window.location.href}"
exit
`;
    const blob = new Blob([scriptContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MonsterGym-Windows-Launcher.bat';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedLauncher('windows');
    setTimeout(() => setDownloadedLauncher(null), 3500);
  };

  // Download Mac .command launcher script
  const downloadMacLauncher = () => {
    const scriptContent = `#!/bin/bash
# Monster Gym macOS Desktop Launcher
open -na "Google Chrome" --args --app="${window.location.href}" 2>/dev/null || open "${window.location.href}"
`;
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MonsterGym-Mac-Launcher.command';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedLauncher('mac');
    setTimeout(() => setDownloadedLauncher(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <MonsterGymLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  تحميل وتثبيت نسخة الكمبيوتر (Windows & Mac)
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white">
                  Monster Gym Desktop
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تطبيق مكتبي أصلي وسريع يعمل بدون متصفح ويحفظ بياناتك محلياً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OS Selector Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 p-2 gap-2">
          <button
            onClick={() => setActiveOS('windows')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeOS === 'windows'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Monitor className="w-4 h-4 text-blue-600" />
            <span>نسخة ويندوز (Windows 10 / 11)</span>
            {isWindows && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">
                جهازك الحالي
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveOS('mac')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeOS === 'mac'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Laptop className="w-4 h-4 text-slate-900" />
            <span>نسخة ماك (macOS Sonoma / Ventura)</span>
            {isMac && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-900 font-semibold">
                جهازك الحالي
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Status Indicator */}
          {isInstalled ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3 text-emerald-800 text-xs">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>البرنامج مثبت بالفعل على جهازك!</strong> يعمل التطبيق حالياً في وضع التطبيق المكتبي المستقل (Standalone App).
              </div>
            </div>
          ) : isInstallable ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-blue-900">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  متصفحك يدعم التثبيت المكتبي الفوري بنقرة واحدة كبرنامج مستقل على {activeOS === 'windows' ? 'ويندوز' : 'ماك'}.
                </span>
              </div>
              <button
                onClick={() => install()}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>تثبيت البرنامج الآن</span>
              </button>
            </div>
          ) : null}

          {/* Tab 1: Windows Instructions & Launcher */}
          {activeOS === 'windows' && (
            <div className="space-y-4 text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Method 1: Instant PWA Install */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-extrabold">1</span>
                    <span>التثبيت المكتبي عبر المتصفح (Chrome / Edge)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    يتم تثبيت <strong>Monster Gym</strong> كتطبيق ويندوز في قائمة Start وسطح المكتب مع أيقونة اللوجو الأصلية:
                  </p>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside pr-1">
                    <li>اضغط على أيقونة التثبيت <span className="font-mono bg-slate-200 px-1 rounded">⊕</span> بأعلى شريط العنوان في Edge أو Chrome.</li>
                    <li>أو من القائمة (⋮) اختر <strong>التطبيقات (Apps)</strong> ← <strong>تثبيت Monster Gym</strong>.</li>
                    <li>اختر "إنشاء اختصار على سطح المكتب".</li>
                  </ol>
                  {isInstallable && (
                    <button
                      onClick={() => install()}
                      className="w-full py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      تثبيت فوري على Windows
                    </button>
                  )}
                </div>

                {/* Method 2: Download Windows Launcher Script */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] flex items-center justify-center font-extrabold">2</span>
                    <span>ملف تشغيل سطح المكتب السريع (.bat)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    حمّل ملف التشغيل وضعه على سطح المكتب، وبنقرة واحدة سيفتح البرنامج كنافذة تطبيق مستقلة بدون شريط المتصفح:
                  </p>
                  <button
                    onClick={downloadWindowsLauncher}
                    className="w-full py-2.5 px-3 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>تحميل MonsterGym-Windows.bat</span>
                  </button>
                  {downloadedLauncher === 'windows' && (
                    <p className="text-[11px] text-emerald-600 font-semibold text-center">
                      ✓ تم تحميل ملف التشغيل بنجاح!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Mac Instructions & Launcher */}
          {activeOS === 'mac' && (
            <div className="space-y-4 text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Mac Method 1: Safari / Chrome Add to Dock */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-extrabold">1</span>
                    <span>التثبيت على macOS Dock و Applications</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    يعمل كتطبيق ماك أصلي يظهر في مجلد التطبيقات وفي شريط Dock:
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside pr-1">
                    <li>
                      <strong>في Safari:</strong> من قائمة <span className="font-semibold">File</span> اختر <span className="font-semibold">Add to Dock...</span>
                    </li>
                    <li>
                      <strong>في Chrome:</strong> اضغط على أيقونة التثبيت في شريط العنوان أو من قائمة <span className="font-semibold">Install Monster Gym</span>.
                    </li>
                    <li>سيصبح البرنامج متاحاً عبر Spotlight والـ Launchpad!</li>
                  </ul>
                  {isInstallable && (
                    <button
                      onClick={() => install()}
                      className="w-full py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      تثبيت فوري على Mac
                    </button>
                  )}
                </div>

                {/* Mac Method 2: Download Mac Launcher Script */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] flex items-center justify-center font-extrabold">2</span>
                    <span>ملف تشغيل سطح مكتب الماك (.command)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    حمّل أداة التشغيل لنظام الماك لتشغيل البرنامج كنافذة سطح مكتب منفصلة وسريعة:
                  </p>
                  <button
                    onClick={downloadMacLauncher}
                    className="w-full py-2.5 px-3 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>تحميل MonsterGym-Mac.command</span>
                  </button>
                  {downloadedLauncher === 'mac' && (
                    <p className="text-[11px] text-emerald-600 font-semibold text-center">
                      ✓ تم تحميل ملف تشغيل الماك بنجاح!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Offline & Data Security Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-slate-900 block">حفظ البيانات وأمان الجيم:</strong>
              <p>
                كافة بيانات المشتركين والمدفوعات وتاريخ الاشتراكات تحفظ محلياً على جهاز الكمبيوتر الخاص بك، مع إمكانية التصدير كملف واسترجاعها في أي لحظة أو رفعها على Google Drive.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Monster Gym Desktop Edition v2.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
