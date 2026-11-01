'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  AlertCircle,
  ShoppingBag,
  Eye,
  EyeOff,
  UploadCloud,
  Image as ImageIcon,
  Video,
  Film,
  X,
} from 'lucide-react';
import { Product, Category, Supplier } from '@/lib/types';
import { formatPrice, SUPPLIER_STATUS_MAP } from '@/lib/utils';
import SupplierStatusBadge from '@/components/products/SupplierStatusBadge';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [weightVolume, setWeightVolume] = useState('500 جرام');
  const [origin, setOrigin] = useState('مصر');
  const [status, setStatus] = useState<'AVAILABLE' | 'NEEDS_CONFIRMATION' | 'UNAVAILABLE'>('AVAILABLE');
  const [stockQuantity, setStockQuantity] = useState('25');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const fetchProducts = () => {
    fetch('/api/products?admin=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .finally(() => setLoading(false));

    fetch('/api/admin/suppliers')
      .then((res) => res.json())
      .then((data) => {
        if (data.suppliers) setSuppliers(data.suppliers);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
      setUploadingImage(false);
    };
    reader.onerror = () => {
      alert('تعذر قراءة الصورة من الجهاز');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('يرجى اختيار ملف فيديو صالح (MP4, WebM, MOV)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('حجم الفيديو يتجاوز 25 ميجابايت، يُفضل اختيار مقطع فيديو أقصر أو بحجم أصغر');
      return;
    }

    setUploadingVideo(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setVideoUrl(event.target.result as string);
      }
      setUploadingVideo(false);
    };
    reader.onerror = () => {
      alert('تعذر قراءة الفيديو من الجهاز');
      setUploadingVideo(false);
    };
    reader.readAsDataURL(file);
  };

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setCostPrice('');
    setOriginalPrice('');
    setCategoryId('cat-honey');
    setSupplierId(suppliers[0]?.id || 'sup-1');
    setWeightVolume('500 جرام');
    setOrigin('مزارع الواحات');
    setStatus('AVAILABLE');
    setStockQuantity('25');
    setDescription('');
    setShortDescription('');
    setIngredients('');
    setImageUrl('');
    setVideoUrl('');
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(String(p.price));
    setCostPrice(String(p.costPrice));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
    setCategoryId(p.categoryId);
    setSupplierId(p.supplierId);
    setWeightVolume(p.weightVolume);
    setOrigin(p.origin);
    setStatus(p.status);
    setStockQuantity(String(p.stockQuantity));
    setDescription(p.description);
    setShortDescription(p.shortDescription);
    setIngredients(p.ingredients || '');
    setImageUrl(p.images[0] || '');
    setVideoUrl(p.videoUrl || '');
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !costPrice) {
      alert('يرجى ملء الحقول الإلزامية');
      return;
    }

    const payload = {
      name,
      price: Number(price),
      costPrice: Number(costPrice),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      categoryId,
      supplierId,
      weightVolume,
      origin,
      status,
      stockQuantity: Number(stockQuantity),
      description,
      shortDescription,
      ingredients,
      images: [imageUrl || '/images/honey/prod-honey-plain.jpg'],
      videoUrl: videoUrl || undefined,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        fetchProducts();
      } else {
        alert(data.error || 'فشل حفظ المنتج');
      }
    } catch {
      alert('حدث خطأ');
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج: "${prodName}"؟`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('تعذر حذف المنتج');
      }
    } catch {
      alert('حدث خطأ');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return p.name.toLowerCase().includes(q) || p.origin.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-950 font-cairo">
            إدارة المنتجات والأسعار والتكلفة
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            إضافة وتعديل المنتجات، أسعار البيع، وسعر التكلفة من الموردين
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 shadow-premium"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-subtle flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم المنتج أو المنشأ..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-ivory-50 border border-ivory-300 rounded-xl focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-gray-500 font-bold">{filteredProducts.length} منتج</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-ivory-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-ivory-50/70 border-b border-ivory-200 text-gray-500 font-bold">
                <th className="py-3.5 px-4">الصورة</th>
                <th className="py-3.5 px-4">اسم المنتج والوزن</th>
                <th className="py-3.5 px-4">المنشأ / المورد</th>
                <th className="py-3.5 px-4">سعر البيع للعميل</th>
                <th className="py-3.5 px-4">تكلفة المورد (Cost)</th>
                <th className="py-3.5 px-4">هامش الربح</th>
                <th className="py-3.5 px-4">حالة التوفر لدى المورد</th>
                <th className="py-3.5 px-4">المخزون</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {filteredProducts.map((p) => {
                const margin = p.price - p.costPrice;

                return (
                  <tr key={p.id} className="hover:bg-ivory-50/50">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl bg-ivory-100 overflow-hidden relative border border-ivory-200">
                        <Image
                          src={p.images[0] || '/images/honey/prod-honey-plain.jpg'}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-forest-950">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{p.weightVolume}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{p.origin}</td>
                    <td className="py-3 px-4 font-black text-forest-950">{formatPrice(p.price)}</td>
                    <td className="py-3 px-4 font-bold text-amber-800">{formatPrice(p.costPrice)}</td>
                    <td className="py-3 px-4 font-black text-emerald-700">+{formatPrice(margin)}</td>
                    <td className="py-3 px-4">
                      <SupplierStatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-700">{p.stockQuantity} عبوة</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-ivory-100 hover:bg-forest-100 text-forest-800"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-ivory-200 shadow-floating text-right my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-forest-950 border-b border-ivory-100 pb-3 mb-4">
              {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-forest-950 mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-forest-950 mb-1">سعر البيع للعميل (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-900 mb-1">سعر شراء المورد (التكلفة) *</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 font-bold text-amber-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-500 mb-1">السعر السابق (للخصم)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-forest-950 mb-1">القسم *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                  >
                    <option value="cat-honey">عسل نحل طبيعي</option>
                    <option value="cat-olive-oil">زيت زيتون بكر ممتاز</option>
                    <option value="cat-dates">تمور وفاكهة مجففة</option>
                    <option value="cat-nuts-spreads">زبدة مكسرات وشوكولاتة</option>
                    <option value="cat-pantry">تموين البيت الطبيعي</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-forest-950 mb-1">حالة التوفر لدى المورد *</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 font-bold"
                  >
                    <option value="AVAILABLE">متاح للطلب المباشر</option>
                    <option value="NEEDS_CONFIRMATION">حسب الطلب (يتطلب تأكيد التوفر)</option>
                    <option value="UNAVAILABLE">غير متوفر حالياً</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-forest-950 mb-1">الوزن / الحجم</label>
                  <input
                    type="text"
                    value={weightVolume}
                    onChange={(e) => setWeightVolume(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-forest-950 mb-1">المنشأ / المزرعة</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-forest-950 mb-1">الكمية المتوفرة حالياً</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                  />
                </div>
              </div>

              {/* Device Media Uploaders: Images & Videos */}
              <div className="space-y-4 p-4 rounded-2xl bg-ivory-50/80 border border-ivory-200">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  style={{ display: 'none' }}
                />

                <div className="flex items-center justify-between border-b border-ivory-200 pb-2">
                  <span className="font-bold text-forest-950 flex items-center gap-1.5 text-sm">
                    <UploadCloud className="w-4 h-4 text-forest-800" />
                    <span>رفع وسائط المنتج من جهازك (موبايل أو كمبيوتر)</span>
                  </span>
                  <span className="text-[11px] text-emerald-800 font-bold">✓ بدون الحاجة لأي روابط خارجية</span>
                </div>

                {/* Photo Upload Card */}
                <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-forest-950 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-forest-800" />
                      <span>صورة المنتج الرئيسية *</span>
                    </span>
                    {uploadingImage && (
                      <span className="text-xs text-amber-700 font-bold animate-pulse">
                        جارٍ معالجة الصورة من الجهاز...
                      </span>
                    )}
                  </div>

                  {imageUrl ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-ivory-300 shrink-0 bg-white shadow-sm">
                        <Image src={imageUrl} alt="" fill className="object-cover" />
                      </div>
                      <div className="flex-1 text-center sm:text-right space-y-2">
                        <p className="font-bold text-forest-950 text-xs">تم اختيار صورة المنتج بنجاح ✓</p>
                        <p className="text-[11px] text-gray-500">جاهزة للعرض والحفظ في المتجر والطلبات.</p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>تغيير الصورة من الجهاز</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 border border-rose-200 transition-all"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-forest-600/40 hover:border-forest-800 bg-forest-50/30 hover:bg-forest-50/60 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-900 mx-auto flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-xs shadow-sm hover:bg-forest-800"
                        >
                          📷 اضغط هنا لاختيار صورة من جهازك أو الكاميرا
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        يدعم ملفات JPG, PNG, WebP مباشرة من استوديو الموبايل أو الكمبيوتر
                      </p>
                    </div>
                  )}
                </div>

                {/* Video Upload Card */}
                <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-forest-950 text-xs flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-forest-800" />
                      <span>فيديو توضيحي للمنتج (اختياري)</span>
                    </span>
                    {uploadingVideo && (
                      <span className="text-xs text-amber-700 font-bold animate-pulse">
                        جارٍ معالجة مقطع الفيديو...
                      </span>
                    )}
                  </div>

                  {videoUrl ? (
                    <div className="space-y-3 p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                      <video
                        src={videoUrl}
                        controls
                        playsInline
                        className="w-full max-h-56 rounded-xl bg-black object-contain shadow-inner"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800">
                          تم تحميل مقطع الفيديو بنجاح ✓
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="px-3.5 py-1.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800"
                          >
                            تغيير الفيديو
                          </button>
                          <button
                            type="button"
                            onClick={() => setVideoUrl('')}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 border border-rose-200"
                          >
                            إزالة الفيديو
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-amber-500/40 hover:border-amber-600 bg-amber-50/20 hover:bg-amber-50/50 rounded-2xl p-5 text-center cursor-pointer transition-all space-y-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-forest-950 font-bold text-xs shadow-sm"
                        >
                          🎬 اضغط هنا لاختيار فيديو من جهازك أو الكاميرا
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        مقطع فيديو لقوام العسل أو التعبئة (MP4, MOV, WebM حتى 25 ميجابايت)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-forest-950 mb-1">وصف المنتج الكامل</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-ivory-50 border border-ivory-300"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-ivory-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-forest-900 text-white font-bold hover:bg-forest-800 shadow-sm"
                >
                  حفظ المنتج
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-3 px-5 rounded-xl bg-ivory-100 text-gray-700 font-bold hover:bg-ivory-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
