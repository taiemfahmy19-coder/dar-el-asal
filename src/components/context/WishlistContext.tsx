'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/config';

interface WishlistContextType {
  favorites: string[]; // product IDs
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = STORAGE_KEYS.wishlist;

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load wishlist', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        // Empty wishlist removes the key entirely (clean state after logout wipe)
        if (favorites.length === 0) localStorage.removeItem(WISHLIST_STORAGE_KEY);
        else localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(favorites));
      } catch (e) {
        console.error('Failed to save wishlist', e);
      }
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return (
    <WishlistContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
