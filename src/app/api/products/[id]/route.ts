import { NextRequest, NextResponse } from 'next/server';
import { getProductById, getProductBySlug, saveProduct, deleteProduct, getCategories, getSuppliers } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = getProductById(params.id) || getProductBySlug(params.id);
    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
      const { costPrice, ...safeProduct } = product;
      return NextResponse.json({ product: safeProduct });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب بيانات المنتج' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'الصلاحية للمدير فقط' }, { status: 403 });
    }

    const existing = getProductById(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    const body = await req.json();
    const categories = getCategories();
    const suppliers = getSuppliers();

    const category = categories.find((c) => c.id === (body.categoryId || existing.categoryId));
    const supplier = suppliers.find((s) => s.id === (body.supplierId || existing.supplierId));

    const updated = {
      ...existing,
      ...body,
      price: body.price !== undefined ? Number(body.price) : existing.price,
      costPrice: body.costPrice !== undefined ? Number(body.costPrice) : existing.costPrice,
      originalPrice: body.originalPrice !== undefined ? (body.originalPrice ? Number(body.originalPrice) : undefined) : existing.originalPrice,
      categoryName: category?.name || existing.categoryName,
      supplierName: supplier?.name || existing.supplierName,
      updatedAt: new Date().toISOString(),
    };

    saveProduct(updated);
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ error: 'فشل تحديث المنتج' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'الصلاحية للمدير فقط' }, { status: 403 });
    }

    const deleted = deleteProduct(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    return NextResponse.json({ error: 'فشل حذف المنتج' }, { status: 500 });
  }
}
