import { NextResponse } from 'next/server';
import { createCaptchaChallenge } from '@/lib/captcha';

// Issues a fresh arithmetic challenge for the order flow. The answer is
// never sent to the client — only a signed token carrying the question.
export async function GET() {
  try {
    const challenge = await createCaptchaChallenge();
    return NextResponse.json({
      question: challenge.question,
      token: challenge.token,
    });
  } catch (error) {
    console.error('Captcha challenge error:', error);
    return NextResponse.json({ error: 'تعذر إنشاء سؤال التحقق، حاول مرة أخرى' }, { status: 500 });
  }
}
