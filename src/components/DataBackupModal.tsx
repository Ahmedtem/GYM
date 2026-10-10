import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  FileText, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  FileSpreadsheet, 
  RotateCcw,
  Cloud,
  FileCheck
} from 'lucide-react';
import { Member } from '../types';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onRestoreData: (newMembers: Member[], mode: 'replace' | 'merge') => void;
  onRequestGoogleDriveConnect?: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  members,
  onRestoreData,
  onRequestGoogleDriveConnect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'drive' | 'snapshots'>('export');
  
  // Import file staging state
  const [importedData, setImportedData] = useState<{
    members: Member[];
    date?: string;
    version?: string;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Local Snapshots
  const [snapshots, setSnapshots] = useState<{ timestamp: string; count: number; data: Member[] }[]>(() => {
    try {
      const saved = localStorage.getItem('monster_gym_snapshots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  // 1. Export JSON backup file
  const handleExportJSON = () => {
    const backupPayload = {
      appName: 'Monster Gym',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      exportedAtFormatted: new Date().toLocaleString('ar-EG'),
      totalMembers: members.length,
      members: members,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `monster-gym-backup-${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    // Save a local snapshot as well
    saveSnapshot(members);
  };

  // 2. Export CSV spreadsheet
  const handleExportCSV = () => {
    const headers = ['رقم العضوية', 'الاسم', 'رقم الهاتف', 'تاريخ البدء', 'تاريخ الانتهاء', 'الحالة', 'أشهر الاشتراك المتتالية', 'هدايا مستلمة', 'المبلغ المدفوع'];
    const rows = members.map((m) => {
      const isExpired = new Date(m.endDate) < new Date();
      return [
        m.id,
        `"${m.name.replace(/"/g, '""')}"`,
        `"${m.phone}"`,
        m.startDate,
        m.endDate,
        isExpired ? 'منتهي' : 'ساري',
        m.consecutiveMonths || 1,
        m.giftsClaimed?.length || 0,
        m.amount || 0,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `monster-gym-members-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Save snapshot to localStorage
  const saveSnapshot = (data: Member[]) => {
    try {
      const newSnapshot = {
        timestamp: new Date().toLocaleString('ar-EG'),
        count: data.length,
        data,
      };
      const updated = [newSnapshot, ...snapshots.slice(0, 4)];
      setSnapshots(updated);
      localStorage.setItem('monster_gym_snapshots', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Handle both raw array or wrapped payload
        let parsedMembers: Member[] = [];
        let backupDate = '';

        if (Array.isArray(parsed)) {
          parsedMembers = parsed;
        } else if (parsed && Array.isArray(parsed.members)) {
          parsedMembers = parsed.members;
          backupDate = parsed.exportedAtFormatted || parsed.exportedAt || '';
        } else {
          throw new Error('صيغة الملف غير صحيحة، لا يحتوي على بيانات مشتركين.');
        }

        // Validate basic structure
        if (parsedMembers.length > 0 && (!parsedMembers[0].name || !parsedMembers[0].endDate)) {
          throw new Error('الملف لا يتطابق مع بنية بيانات مشتركي Monster Gym.');
        }

        setImportedData({
          members: parsedMembers,
          date: backupDate,
          version: parsed.version || '1.0',
        });
      } catch (err: any) {
        setImportError(err.message || 'حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
        setImportedData(null);
      }
    };
    reader.readAsText(file);
  };

  // Perform restore
  const executeRestore = (mode: 'replace' | 'merge') => {
    if (!importedData || !importedData.members) return;

    // First save current state as a snapshot in case user changes their mind
    saveSnapshot(members);

    onRestoreData(importedData.members, mode);
    setImportSuccessMessage(
      mode === 'replace'
        ? `تم استرجاع واستبدال البيانات بنجاح (${importedData.members.length} مشترك)!`
        : `تم دمج البيانات بنجاح مع البيانات الحالية!`
    );
    setImportedData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Restore from a snapshot
  const handleRestoreSnapshot = (snap: { timestamp: string; count: number; data: Member[] }) => {
    if (window.confirm(`هل أنت متأكد من استرجاع نسخة [${snap.timestamp}] المحتوية على ${snap.count} مشترك؟`)) {
      saveSnapshot(members);
      onRestoreData(snap.data, 'replace');
      setImportSuccessMessage(`تمت استعادة النسخة المؤرخة ${snap.timestamp} بنجاح!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                مركز حفظ واسترجاع البيانات (Monster Gym)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                تصدير ملفات النسخ الاحتياطي، استرجاع البيانات، والمزامنة مع Google Drive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 p-2 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'export'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>تصدير ملف النسخة الاحتياطية</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'import'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>استرجاع البيانات من ملف</span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'drive'
                ? 'bg-white text-purple-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cloud className="w-4 h-4 text-purple-600" />
            <span>Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('snapshots')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'snapshots'
                ? 'bg-white text-amber-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>سجل النسخ التلقائية ({snapshots.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Notifications */}
          {importSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{importSuccessMessage}</span>
            </div>
          )}

          {importError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">إجمالي المشتركين المسجلين حالياً</h4>
                  <p className="text-xs text-slate-500 mt-0.5">جاهز للتصدير كملف مؤمن مع جميع سجلات الاشتراكات والهدايا</p>
                </div>
                <span className="text-lg font-extrabold text-blue-600 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                  {members.length} مشترك
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* JSON Full Backup */}
                <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-colors bg-white flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">ملف النسخة الاحتياطية الكاملة (.json)</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      ملف يحفظ كل تفاصيل الجيم: المشتركين، أرقام الهواتف، تواريخ الانتهاء، سجلات التجديد، وجوائز الولاء. هذا الملف هو المستخدم للاسترجاع لاحقاً.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل ملف النسخة الاحتياطية (.json)</span>
                  </button>
                </div>

                {/* CSV / Excel Spreadsheet */}
                <div className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition-colors bg-white flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">جدول إكسل / بيانات (.csv)</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      تصدير كجدول بيانات متوافق مع Excel أو Google Sheets لطباعة القوائم أو الحسابات والمراجعة المحاسبية للجيم.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="w-full py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل جدول المشتركين (Excel/CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT / RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              
              {/* File Dropzone / Picker */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  انقر هنا لاختيار ملف النسخة الاحتياطية (.json)
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  اختر ملف النسخة الاحتياطية المحفوظ سابقاً لاستعادة كافة بيانات المشتركين وتواريخ الاشتراكات.
                </p>
              </div>

              {/* Staged Data Preview */}
              {importedData && (
                <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">الملف جاهز للاسترجاع</h5>
                        <p className="text-[11px] text-slate-500">
                          {importedData.date ? `تاريخ النسخة: ${importedData.date}` : 'نسخة احتياطية Monster Gym'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {importedData.members.length} مشترك
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    حدد طريقة الاسترجاع المفضلة:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => executeRestore('replace')}
                      className="p-3 text-right rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 transition-colors cursor-pointer"
                    >
                      <strong className="block text-xs font-bold text-blue-900 mb-1">
                        1. استبدال كامل (Full Restore)
                      </strong>
                      <span className="text-[11px] text-blue-700 leading-snug block">
                        مسح البيانات الحالية واعتماد بيانات الملف المرفوع تماماً. (يوصى به عند نقل البيانات لجهاز جديد).
                      </span>
                    </button>

                    <button
                      onClick={() => executeRestore('merge')}
                      className="p-3 text-right rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 transition-colors cursor-pointer"
                    >
                      <strong className="block text-xs font-bold text-emerald-900 mb-1">
                        2. دمج ذكي (Smart Merge)
                      </strong>
                      <span className="text-[11px] text-emerald-700 leading-snug block">
                        إضافة المشتركين الجدد وتحديث التواريخ مع الإبقاء على المشتركين الموجودين بدون حذف.
                      </span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="space-y-4 text-slate-700">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-purple-950">
                      النسخ الاحتياطي السحابي على Google Drive
                    </h4>
                    <p className="text-xs text-purple-800/80 mt-0.5">
                      حفظ ملفات بيانات الجيم تلقائياً في حساب Google Drive الخاص بك لحمايتها من أي عطل بالأجهزة
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xs rounded-xl p-4 border border-purple-100 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ميزات الحفظ على Google Drive:</span>
                  </div>
                  <ul className="space-y-1 list-disc list-inside text-slate-600 pr-1 leading-relaxed">
                    <li>مزامنة فورية لملف النسخة الاحتياطية باسم <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">MonsterGym-Data.json</code> في مجلد خاص.</li>
                    <li>إمكانية فتح البرنامج من جهاز الماك أو الويندوز واستعادة البيانات مباشرة من الدرايف.</li>
                    <li>حماية تامة للبيانات مع صلاحيات الوصول المخصصة بإذن المستخدم.</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                  <button
                    onClick={onRequestGoogleDriveConnect}
                    className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>ربط وتفعيل Google Drive للنسخ الاحتياطي</span>
                  </button>

                  <button
                    onClick={handleExportJSON}
                    className="py-2.5 px-4 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>تحميل نسخة لرفعها يدوياً على Drive</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SNAPSHOTS */}
          {activeTab === 'snapshots' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                يقوم النظام تلقائياً بالتقاط لحظة زمنية للبيانات عند التصدير أو التعديلات الهامة. يمكنك العودة لأي لقطة بضغطة زر:
              </p>

              {snapshots.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                  لا توجد لقطات تلقائية محفوظة حالياً. سيتم إنشاؤها تلقائياً عند أول حفظ للبيانات.
                </div>
              ) : (
                <div className="space-y-2">
                  {snapshots.map((snap, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            نسخة زمنية: {snap.timestamp}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            تحتوي على {snap.count} مشترك مسجل
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRestoreSnapshot(snap)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>استرجاع</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>البيانات مشفرة ومحفوظة بأمان محلياً وسحابياً</span>
          </div>
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
