import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getAllProductsAdmin, saveProduct, getCategories, getSuppliers } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Product } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sortBy = (searchParams.get('sortBy') as any) || undefined;
    const isAdminView = searchParams.get('admin') === 'true';

    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === 'admin';

    if (isAdminView && isAdmin) {
      const all = getAllProductsAdmin();
      return NextResponse.json({ products: all });
    }

    const products = getProducts({
      categoryId,
      search,
      status,
      featured,
      minPrice,
      maxPrice,
      sortBy,
    });

    // Strip costPrice for non-admin to safeguard internal supplier data
    const safeProducts = products.map((p) => {
      if (isAdmin) return p;
      const { costPrice, ...rest } = p;
      return rest;
    });

    return NextResponse.json({ products: safeProducts });
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب المنتجات' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'غير مصرح لك بإضافة منتجات، الصلاحية للمدير فقط' },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.name || !body.price || !body.costPrice || !body.categoryId) {
      return NextResponse.json(
        { error: 'يرجى استكمال البيانات الأساسية للمنتج (الاسم، السعر، سعر التكلفة، القسم)' },
        { status: 400 }
      );
    }

    const categories = getCategories();
    const suppliers = getSuppliers();

    const category = categories.find((c) => c.id === body.categoryId);
    const supplier = suppliers.find((s) => s.id === body.supplierId);

    const now = new Date().toISOString();
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: body.name.trim(),
      slug: body.slug || `prod-${Date.now()}`,
      description: body.description || '',
      shortDescription: body.shortDescription || '',
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      costPrice: Number(body.costPrice),
      categoryId: body.categoryId,
      categoryName: category?.name,
      weightVolume: body.weightVolume || '1 عبوة',
      ingredients: body.ingredients || '',
      nutritionalInfo: body.nutritionalInfo || '',
      origin: body.origin || 'مصر',
      supplierId: body.supplierId || '',
      supplierName: supplier?.name,
      status: body.status || 'AVAILABLE',
      stockQuantity: Number(body.stockQuantity || 10),
      images: body.images && body.images.length > 0 ? body.images : [
        '/images/honey/prod-honey-plain.jpg'
      ],
      videoUrl: body.videoUrl || undefined,
      isFeatured: Boolean(body.isFeatured),
      isNew: Boolean(body.isNew),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      rating: 5.0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    saveProduct(newProduct);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ المنتج' }, { status: 500 });
  }
}
