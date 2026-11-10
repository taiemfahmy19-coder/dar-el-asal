'use client';

import React from 'react';

/**
 * Registers /sw.js in production only, and immediately hands control to a
 * newly published worker (old builds can never keep running after a deploy).
 */
export default function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;

    // A new SW taking control means a new build was published → reload once
    // so the user is never served a mix of old/new app chunks.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          // Ask the browser to look for an update right away on every visit
          reg.update().catch(() => {});
          setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
        })
        .catch(() => {
          /* SW registration is best-effort; the site works without it */
        });
    };

    if (document.readyState === 'complete') {
      window.setTimeout(register, 600);
    } else {
      window.addEventListener('load', () => window.setTimeout(register, 600), {
        once: true,
      });
    }
  }, []);

  return null;
}
