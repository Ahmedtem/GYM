import React, { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running inside an installed PWA, do not show install prompts
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'floating') {
    return (
      <>
        <div className="fixed bottom-4 left-4 z-40 sm:hidden animate-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={handleClick}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-full shadow-lg shadow-rose-900/40 text-xs font-bold border border-rose-400/40 active:scale-95 transition"
          >
            <Smartphone className="w-4 h-4 animate-bounce" />
            <span>تثبيت على الموبايل</span>
          </button>
        </div>
        <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  if (variant === 'full') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer active:scale-98 ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>تثبيت التطبيق على الموبايل (PWA)</span>
        </button>
        <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // Compact header button
  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition cursor-pointer ${className}`}
        title="تثبيت التطبيق على هاتفك"
      >
        <Smartphone className="w-3.5 h-3.5 text-rose-400" />
        <span className="hidden sm:inline">تثبيت على الموبايل</span>
        <span className="sm:hidden">تثبيت</span>
      </button>
      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
