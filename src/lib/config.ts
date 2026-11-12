/**
 * Central configuration & single source of truth for brand + storage + PWA.
 * Nothing secret lives here — only client-safe constants (no keys, no DB).
 */

/** Brand identity tokens used by the PWA + UI kit */
export const BRAND = {
  name: 'دار العسل والزيتون',
  shortName: 'دار العسل',
  colors: {
    forest: '#102d1c',   // header/status bars
    forestAlt: '#143823', // deep green surfaces
    gold: '#c59b27',
    ivory: '#fcfaf6',     // page background
    goldText: '#f5ebd2',
  },
} as const;

/** PWA install banner keys — device-level preferences (kept across logout) */
export const PWA_STORAGE_KEYS = {
  installDismissed: 'dar_pwa_install_dismissed_v1',
} as const;

/** Client-side storage quotas used by the store (ids/quantities only) */
export const STORAGE_KEYS = {
  cart: 'darelasal_cart_items',
  wishlist: 'darelasal_wishlist_ids',
} as const;

/**
 * Temporary, session-bound data wiped on explicit logout so no trace of a
 * previous user's activity remains on a shared device.
 */
export function clearLocalTempData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.cart);
    localStorage.removeItem(STORAGE_KEYS.wishlist);
    // Remove any legacy/scratch keys the app may ever have written
    const scratchPrefixes = ['dar_temp_', 'darla_password_hint'];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && scratchPrefixes.some((p) => key.startsWith(p))) {
        localStorage.removeItem(key);
      }
    }
    try {
      sessionStorage.clear();
    } catch {
      /* private mode */
    }
  } catch {
    /* storage unavailable */
  }
}

/** Shipping quote shown to customers (final price is confirmed per order) */
export const SHIPPING = {
  supportedGovernorate: 'الإسكندرية',
  estimateAlexandriaEGP: 55,
} as const;

/**
 * Public contact channels. The WhatsApp float button renders ONLY when a
 * number is configured (international format without +, e.g. 2011XXXXXXXX).
 */
export const CONTACT = {
  whatsappNumber: '',
  get whatsappLink(): string | null {
    if (!this.whatsappNumber) return null;
    return `https://wa.me/${this.whatsappNumber}`;
  },
} as const;
