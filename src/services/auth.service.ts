/**
 * Authentication service — every auth HTTP call lives here so UI components
 * never talk to raw fetch for identity logic. Response shapes are typed here
 * so callers never cast loosely.
 */

import { User } from '@/lib/types';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

export interface ServiceResult<T = Record<string, unknown>> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<ServiceResult<T>> {
  const res = await fetch(url, init);
  let data: T;
  try {
    data = (await res.json()) as T;
  } catch {
    data = {} as T;
  }
  return { ok: res.ok, status: res.status, data, error: (data as { error?: string }).error };
}

export function meRequest() {
  return jsonFetch<{ user: User | null }>('/api/auth/me');
}

export function loginRequest(email: string, password: string) {
  return jsonFetch<{ user: User; role: string }>('/api/auth/login', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });
}

export function registerRequest(payload: { name: string; email: string; password: string; phone: string }) {
  return jsonFetch<{ user: User }>('/api/auth/register', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}

export function logoutRequest() {
  return fetch('/api/auth/logout', { method: 'POST' });
}
