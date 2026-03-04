// src/components/EditProductModal.jsx
import { useState, useRef } from 'react';
import { X, Loader2, Upload, ImagePlus, Trash2, CheckCircle } from 'lucide-react';
import { supabase, uploadFile } from '../lib/supabaseClient';
import { formatNaira } from '../lib/flutterwave';

const CATEGORIES = [
  'Electronics', 'Books & Stationery', 'Fashion & Clothing',
  'Food & Drinks', 'Furniture', 'Services', 'Beauty & Health',
  'Sports & Fitness', 'Others',
];

export default function EditProductModal({ product, onClose, onSave }) {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: product.name || '',
    price: product.price || '',
    category: product.category || '',
    condition: product.condition || 'fairly-used',
    description: product.description || '',
    quantity: product.quantity || 1,
    whatsapp_number: product.whatsapp_number || '',
    is_available: product.is_available !== false,
  });
  const [images, setImages] = useState(product.images || []);
  const [newImages, setNewImages] = useState([]); // new uploads
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + newImages.length + files.length > 4) {
      setError('Maximum 4 images allowed');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const ext = file.name.split('.').pop();
        const path = `${product.seller_id}/${product.id}_${Date.now()}.${ext}`;
        return await uploadFile('product-images', path, file);
      }));
      setImages(prev => [...prev, ...uploaded]);
    } catch (err) {
      setError('Image upload failed. Try again.');
    }
    setUploading(false);
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setError('');
    if (!form.name || !form.price || !form.category) {
      setError('Name, price and category are required');
      return;
    }
    setSaving(true);
    try {
      const updates = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        images,
        updated_at: new Date().toISOString(),
      };
      const { error: dbErr } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id);

      if (dbErr) throw dbErr;

      setSuccess(true);
      setTimeout(() => {
        onSave(updates);
        onClose();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Edit Listing</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Photos <span className="text-gray-400 font-normal">({images.length}/4)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors"
                >
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                  <span className="text-xs">Add</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none" />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₦)</label>
            <input value={form.price} onChange={e => set('price', e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none" />
            {form.price > 0 && (
              <p className="text-xs text-gray-400 mt-1">Buyer pays {formatNaira(Math.round(Number(form.price) * 1.03))} (includes 4% fee)</p>
            )}
          </div>

          {/* Category + Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none bg-white">
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Condition</label>
              <select value={form.condition} onChange={e => set('condition', e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none bg-white">
                <option value="new">Brand New</option>
                <option value="fairly-used">Fairly Used</option>
                <option value="used">Used</option>
              </select>
            </div>
          </div>

          {/* Quantity + Availability */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity</label>
              <input value={form.quantity} onChange={e => set('quantity', e.target.value.replace(/\D/g, '') || 1)}
                type="number" min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <button type="button"
                onClick={() => set('is_available', !form.is_available)}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${form.is_available ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                {form.is_available ? '✅ Available' : '⏸ Unavailable'}
              </button>
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Number</label>
            <input value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)}
              placeholder="08012345678"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Describe your item..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none resize-none" />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || success}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 size={15} className="animate-spin" /> : success ? <CheckCircle size={15} /> : null}
              {success ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}