import { SignJWT, jwtVerify } from 'jose';

/**
 * Stateless arithmetic CAPTCHA for the customer order flow.
 *
 * The correct answer is signed server-side (HMAC) inside a short-lived token;
 * the front end only ever receives the question + token, so the answer can
 * never be forged from the client. Guards POST /api/orders against scripted
 * fake-order submissions.
 */

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dar-el-asal-olive-secure-secret-key-2026-production'
);

const CHALLENGE_TTL_SECONDS = 15 * 60;
const OPERATORS = ['+', '×'] as const;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface CaptchaChallenge {
  question: string;
  token: string;
}

/** Generates a new challenge: a question shown to the user + signed token. */
export async function createCaptchaChallenge(): Promise<CaptchaChallenge> {
  const op = OPERATORS[randInt(0, OPERATORS.length - 1)];
  let a = randInt(2, 9);
  let b = randInt(2, 9);
  if (op === '×' && a < 3) a = randInt(3, 9);
  const question = `${a} ${op} ${b}`;
  const token = await new SignJWT({ q: question })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + CHALLENGE_TTL_SECONDS)
    .sign(SECRET);
  return { question, token };
}

/** Verifies a user answer against a signed challenge token. */
export async function verifyCaptchaAnswer(token: string, answer: string | number): Promise<boolean> {
  if (!token || answer === undefined || answer === null || answer === '') return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const question = payload.q as string | undefined;
    if (!question) return false;
    const [l, op, r] = question.split(' ');
    const a = Number(l);
    const b = Number(r);
    const expected = op === '+' ? a + b : a * b;
    const normalized = String(answer).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).trim();
    return Number(normalized) === expected;
  } catch {
    return false;
  }
}

export const CAPTCHA_ERROR_MESSAGE =
  'من فضلك أجب على سؤال التحقق البسيط لإثبات أنك شخص حقيقي (وليس برنامجًا آليًا).';
