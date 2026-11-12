'use client';

import React from 'react';
import { fetchCaptchaChallenge, CaptchaChallenge } from '@/services/captcha.service';

/**
 * Shared human-verification state for any order form (checkout, future fins).
 * Provides the challenge, the answer state and a reload that issues a NEW
 * question after a wrong answer (per product spec).
 */
export function useCaptcha() {
  const [captcha, setCaptcha] = React.useState<CaptchaChallenge | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = React.useState('');

  const loadCaptcha = React.useCallback(() => {
    fetchCaptchaChallenge().then((challenge) => {
      setCaptcha(challenge);
      if (challenge) setCaptchaAnswer('');
    });
  }, []);

  React.useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  return { captcha, captchaAnswer, setCaptchaAnswer, loadCaptcha };
}
