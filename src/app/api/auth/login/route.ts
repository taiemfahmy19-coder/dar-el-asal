import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';
import { comparePassword, createSessionToken, AUTH_COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة، تأكد من البريد أو كلمة المرور' },
        { status: 401 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'هذا الحساب موقوف حالياً، يرجى التواصل مع إدارة المتجر' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة، تأكد من البريد أو كلمة المرور' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user);

    const { passwordHash, ...safeUser } = user;
    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'تم تسجيل الدخول بنجاح',
    });

    response.cookies.set(AUTH_COOKIE_OPTIONS.name, token, AUTH_COOKIE_OPTIONS.options);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
