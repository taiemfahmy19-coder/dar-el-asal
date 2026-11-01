import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح: هذه العملية مخصصة لإدارة المتجر فقط' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على أي ملف مرفوع' },
        { status: 400 }
      );
    }

    const mimeType = file.type || 'application/octet-stream';
    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, error: 'نوع الملف غير مدعوم. يرجى رفع ملف صورة (JPG, PNG, WebP) أو فيديو (MP4, WebM, MOV)' },
        { status: 400 }
      );
    }

    // Limit check (e.g. 25MB for video, 10MB for images)
    const maxSizeBytes = isVideo ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: `حجم الملف كبير جداً. الحد الأقصى المسموح به هو ${isVideo ? '25 ميجابايت للفيديو' : '10 ميجابايت للصور'}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
      mediaType: isVideo ? 'video' : 'image',
    });
  } catch (error) {
    console.error('Error in /api/admin/upload:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء معالجة ورفع الملف' },
      { status: 500 }
    );
  }
}
