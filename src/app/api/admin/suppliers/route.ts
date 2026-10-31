import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSuppliers, saveSupplier, getDb } from '@/lib/db';
import { Supplier } from '@/lib/types';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'الصلاحية للمدير فقط' }, { status: 403 });
    }

    const suppliers = getSuppliers();
    const db = getDb();

    // Attach supplied products count
    const enriched = suppliers.map((s) => ({
      ...s,
      productsCount: db.products.filter((p) => p.supplierId === s.id).length,
    }));

    return NextResponse.json({ suppliers: enriched });
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب بيانات الموردين' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'الصلاحية للمدير فقط' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name || !body.contactPerson || !body.phone) {
      return NextResponse.json({ error: 'اسم المورد والشخص المسؤول ورقم الهاتف حقول إلزامية' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const supplier: Supplier = {
      id: body.id || `sup-${Date.now()}`,
      name: body.name.trim(),
      contactPerson: body.contactPerson.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || '',
      address: body.address?.trim() || 'مصر',
      productsSupplied: body.productsSupplied?.trim() || '',
      notes: body.notes?.trim() || '',
      lastVerifiedAt: now,
      createdAt: body.createdAt || now,
    };

    saveSupplier(supplier);
    return NextResponse.json({ success: true, supplier });
  } catch (error) {
    return NextResponse.json({ error: 'فشل حفظ بيانات المورد' }, { status: 500 });
  }
}
