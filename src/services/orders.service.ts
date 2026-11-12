/**
 * Orders service — the ONLY sanctioned client entry point for creating orders.
 * Server always re-validates and re-prices; this layer simply shapes the
 * request and types the response contract.
 */

export interface OrderSubmitResponse {
  success?: boolean;
  error?: string;
  errors?: Record<string, string>;
  duplicate?: boolean;
  order?: { id: string };
}

export async function submitOrderRequest(payload: Record<string, unknown>) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let data: OrderSubmitResponse = {};
  try {
    data = (await res.json()) as OrderSubmitResponse;
  } catch {
    /* network-level failure surfaces to the caller's catch */
  }
  return { ok: res.ok, status: res.status, data };
}
