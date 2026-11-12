'use client';

import React from 'react';
import Image from 'next/image';
import { X, Download, Share2 } from 'lucide-react';
import { PWA_STORAGE_KEYS } from '@/lib/config';

const DISMISS_KEY = PWA_STORAGE_KEYS.installDismissed;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA install banner:
 *  - Android Chrome: uses the native beforeinstallprompt event → one-tap install.
 *  - iPhone (Safari): shows the exact two-step gesture (Share → Add to Home Screen)
 *    since iOS does not fire beforeinstallprompt.
 *  - Fully dismissible: closing it is remembered for good on this device.
 *  - Never shown inside the installed app itself (standalone display mode).
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = React.useState(false);
  const [standalone, setStandalone] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(true);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }

    // iOS: iPads on iOS 13+ report as Macintosh with touch support
    const ua = navigator.userAgent;
    const iOS =
      /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
    setIsIOS(iOS);

    const inStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone === true;
    setStandalone(inStandalone);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // keep Chrome from showing its own mini-infobar
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setVisible(false);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Gentle delay: let the page settle before nudging the user
  React.useEffect(() => {
    if (standalone || dismissed) return;
    const canShow = deferred !== null || (isIOS && !standalone);
    if (!canShow) return;
    const t = window.setTimeout(() => setVisible(true), 4000);
    return () => window.clearTimeout(t);
  }, [deferred, isIOS, standalone, dismissed]);

  const close = React.useCallback((remember = true) => {
    setVisible(false);
    if (remember) {
      try {
        localStorage.setItem(DISMISS_KEY, '1');
      } catch {
        /* private mode → banner returns next visit, acceptable */
      }
    }
  }, []);

  const install = async () => {
    if (!deferred) {
      close(false);
      return;
    }
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === 'accepted') {
        setVisible(false);
      }
      setDeferred(null);
    } catch {
      close(false);
    }
  };

  if (!visible || standalone) return null;

  return (
    <div
      role="dialog"
      aria-label="تثبيت تطبيق دار العسل والزيتون"
      className="fixed z-[70] bottom-20 sm:bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-[380px] p-4 rounded-2xl bg-[#112f1f] text-[#f5ebd2] border border-[#c59b27]/40 shadow-2xl"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <button
        type="button"
        onClick={() => close(true)}
        aria-label="إغلاق رسالة التثبيت"
        className="absolute top-2 left-2 p-1.5 rounded-full text-[#c59b27] hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>

      <div className="flex items-start gap-3">
        <Image
          src="/icons/icon-192.png"
          alt="شعار دار العسل والزيتون"
          width={52}
          height={52}
          className="rounded-xl border border-[#c59b27]/30 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-tight">دار العسل والزيتون</p>
          <p className="text-[11px] text-[#c9d6c4] mt-1 leading-relaxed">
            ثبّت المتجر كتطبيق على جهازك — يفتح فورًا مثل التطبيقات ويحفظ الجلسة.
          </p>

          {deferred ? (
            <button
              type="button"
              onClick={install}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c59b27] text-[#102d1c] text-xs font-bold hover:bg-[#d4ae3e] active:scale-95 transition-all shadow"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>تثبيت التطبيق الآن</span>
            </button>
          ) : (
            <p className="mt-3 text-[11px] bg-white/5 border border-[#c59b27]/25 rounded-xl px-3 py-2.5 leading-relaxed flex items-start gap-2">
              <Share2 className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                على الآيفون: اضغط زر <span className="font-bold text-[#c59b27]">«المشاركة»</span>{' '}
                في أسفل السفاري، ثم اختر{' '}
                <span className="font-bold text-[#c59b27]">«إضافة إلى الشاشة الرئيسية»</span>.
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
