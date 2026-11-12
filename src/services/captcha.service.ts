/**
 * Captcha service — single place that talks to the signed-challenge endpoint.
 */

export interface CaptchaChallenge {
  question: string;
  token: string;
}

export async function fetchCaptchaChallenge(): Promise<CaptchaChallenge | null> {
  try {
    const res = await fetch('/api/captcha', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.question && data?.token) {
      return { question: data.question, token: data.token };
    }
    return null;
  } catch {
    return null;
  }
}
