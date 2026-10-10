import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  KeyRound,
  Sparkles,
  Users
} from 'lucide-react';
import { MonsterGymLogo } from './MonsterGymLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { AppUser } from '../types';
import { verifyLogin } from '../utils/authUtils';

interface LoginScreenProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const result = verifyLogin(username, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'فشل تسجيل الدخول، تأكد من صحة البيانات');
      }
      setIsSubmitting(false);
    }, 200);
  };

  // Quick fill helper for easy testing
  const handleQuickFill = (role: 'admin' | 'staff') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('123');
    } else {
      setUsername('staff');
      setPassword('123');
    }
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-red-600 selection:text-white font-sans antialiased">
      
      {/* Background ambient effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Logo and Brand Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center">
            <MonsterGymLogo size="lg" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black tracking-wider text-white font-mono">
                MONSTER GYM
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-red-600 text-white tracking-widest uppercase">
                بوابة الموظفين
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              تسجيل دخول الموظفين والإدارة لمتابعة اشتراكات الجيم
            </p>
          </div>
        </div>

        {/* Notice badge */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 mb-6 flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="leading-relaxed">
            البرنامج محمي ومخصص فقط للمدير والموظفين المصرح لهم لضمان سرية وأمان البيانات.
          </p>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username / Staff Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>اسم المستخدم / كود الدخول</span>
            </label>
            <div className="relative">
              <input
                id="input-login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: admin أو staff"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-left font-mono"
                dir="ltr"
                required
              />
            </div>
          </div>

          {/* Password / PIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>كلمة المرور / الرمز السري (PIN)</span>
            </label>
            <div className="relative">
              <input
                id="input-login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-left font-mono"
                dir="ltr"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-login-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'جارٍ التحقق...' : 'تسجيل الدخول للنظام'}</span>
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-[11px] font-semibold text-slate-400 mb-2.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>حسابات النظام الجاهزة للاختبار السريع:</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 text-right cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-amber-400">👑 المدير العام</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">كامل الصلاحيات</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono" dir="ltr">admin / 123</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('staff')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-blue-500/30 text-right cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-blue-400">👤 موظف استقبال</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300">تسجيل وتجديد</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono" dir="ltr">staff / 123</p>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            يمكن لمدير الصالة إضافة موظفين جدد وتغيير كلمات المرور في أي وقت من لوحة الإدارة.
          </p>

          {/* Mobile PWA Install option */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <PWAInstallButton variant="full" />
          </div>
        </div>

      </div>
    </div>
  );
};
