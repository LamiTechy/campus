// src/components/ProductForm.jsx
import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImagePlus, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { supabase, uploadFile } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { calculateFees, formatNaira, SERVICE_CHARGE_RATE } from '../lib/flutterwave';

const CATEGORIES = [
  'Electronics', 'Books & Stationery', 'Fashion & Clothing',
  'Food & Drinks', 'Furniture', 'Services', 'Beauty & Health',
  'Sports & Fitness', 'Others',
];

const UNIVERSITIES = [
  'University of Lagos (UNILAG)', 'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)', 'University of Nigeria Nsukka (UNN)',
  'Ahmadu Bello University (ABU)', 'Lagos State University (LASU)',
  'Covenant University', 'Babcock University',
  'University of Benin (UNIBEN)', 'Rivers State University','Moshood Abiola Polytechnic (MAPOLY)', 'Other',
];

export default function ProductForm({ onSuccess, onCancel }) {
  const { user, profile } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    condition: 'fairly-used',
    description: '',
    whatsapp_number: profile?.whatsapp_number || '',
    university: profile?.university || '',
    accepts_online_payment: true,
    quantity: 1,
  });
  const [images, setImages] = useState([]);
  const [feeConsent, setFeeConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Live fee calculation
  const price = Number(form.price) || 0;
  const fees = price > 0 ? calculateFees(price) : null;

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.slice(0, 4 - images.length).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 4));
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = 'Enter a valid price';
    if (!form.category) errs.category = 'Select a category';
    if (!form.whatsapp_number.trim()) errs.whatsapp_number = 'WhatsApp number is required';
    if (!feeConsent) errs.consent = 'You must agree to the fee terms to list your item';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }



    setUploading(true);
    setErrors({});

    try {
      const imageUrls = [];
      for (const img of images) {
        const ext = img.file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const url = await uploadFile('product-images', path, img.file);
        imageUrls.push(url);
      }

      const { error } = await supabase.from('products').insert({
        seller_id: user.id,
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        description: form.description.trim(),
        whatsapp_number: form.whatsapp_number.trim(),
        university: form.university,
        images: imageUrls,
        accepts_online_payment: form.accepts_online_payment,
        quantity: Number(form.quantity) || 1,
        fee_consent: feeConsent,
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to list item. Try again.' });
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="text-green-600" size={36} />
        </div>
        <h3 className="font-bold text-xl text-gray-900">Listed Successfully!</h3>
        <p className="text-gray-500 text-sm">Your item is now live on CampusPlug</p>
      </div>
    );
  }

  const InputError = ({ field }) => errors[field] ? (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
      <AlertCircle size={11} /> {errors[field]}
    </p>
  ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Images */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Photos <span className="text-gray-400 font-normal">(up to 4)</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img src={img.preview} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
          {images.length < 4 && (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-green-300 flex flex-col items-center justify-center gap-1 text-green-600 hover:bg-green-50 transition-colors">
              <ImagePlus size={20} />
              <span className="text-xs font-medium">Add</span>
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Name *</label>
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="e.g. iPhone 13 Pro, Calculus Textbook..."
          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-green-500'}`}
        />
        <InputError field="name" />
      </div>

      {/* Price + Condition */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₦) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₦</span>
            <input
              type="number"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="0"
              min="0"
              className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-green-500'}`}
            />
          </div>
          <InputError field="price" />
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

      {/* Live Fee Breakdown — shows as soon as price is entered */}
      {fees && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-green-800 uppercase tracking-wide flex items-center gap-1.5">
            <Info size={12} /> Price Breakdown for Buyer
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Your listing price</span>
              <span className="font-semibold text-gray-900">{formatNaira(fees.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service charge ({Math.round(SERVICE_CHARGE_RATE * 100)}%) — paid by buyer</span>
              <span className="font-semibold text-amber-600">+ {formatNaira(fees.serviceCharge)}</span>
            </div>
            <div className="border-t border-green-200 pt-1.5 flex justify-between">
              <span className="font-bold text-gray-900 text-sm">Buyer pays</span>
              <span className="font-black text-gray-800 text-base">{formatNaira(fees.buyerTotal)}</span>
            </div>
            <div className="flex justify-between text-sm bg-green-100 rounded-lg px-2 py-1.5">
              <span className="font-bold text-green-800">You receive</span>
              <span className="font-black text-green-700">{formatNaira(fees.sellerAmount)} ✅</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            The service charge is added on top and paid by the buyer — you keep your full listing price.
          </p>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity Available</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set('quantity', Math.max(1, Number(form.quantity) - 1))}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <span className="text-2xl font-black text-gray-900">{form.quantity}</span>
            <p className="text-xs text-gray-400 mt-0.5">{form.quantity === 1 ? 'item' : 'items'} available</p>
          </div>
          <button
            type="button"
            onClick={() => set('quantity', Math.min(99, Number(form.quantity) + 1))}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
        <select value={form.category} onChange={e => set('category', e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none bg-white transition-colors ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-green-500'}`}>
          <option value="">Select a category...</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <InputError field="category" />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          placeholder="Describe your item — condition, specs, reason for selling..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none resize-none transition-colors"
        />
      </div>

      {/* WhatsApp + University */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Number *</label>
          <input
            value={form.whatsapp_number}
            onChange={e => set('whatsapp_number', e.target.value)}
            placeholder="e.g. 08012345678"
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${errors.whatsapp_number ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-green-500'}`}
          />
          <InputError field="whatsapp_number" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">University</label>
          <select value={form.university} onChange={e => set('university', e.target.value)}
            className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none bg-white">
            <option value="">Select university...</option>
            {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Accept Online Payment toggle */}
      <div className={`rounded-xl border p-4 transition-colors ${form.accepts_online_payment ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="flex-shrink-0 mt-0.5">
            <div
              onClick={() => set('accepts_online_payment', !form.accepts_online_payment)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${form.accepts_online_payment ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.accepts_online_payment ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Accept in-app payments</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Let buyers pay securely through CampusPlug. Money is held safely until they confirm delivery.
              {!profile?.paystack_subaccount_code && form.accepts_online_payment && (
                <span className="text-amber-600 font-semibold"> ⚠️ You need to add your bank account in Profile first.</span>
              )}
            </p>
          </div>
        </label>
      </div>

      {/* ── FEE CONSENT CHECKBOX — must check to submit ── */}
      <div className={`rounded-xl border-2 p-4 transition-all ${feeConsent ? 'border-green-400 bg-green-50' : errors.consent ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
        <label className="flex items-start gap-3 cursor-pointer" onClick={() => setFeeConsent(!feeConsent)}>
          <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5 ${feeConsent ? 'bg-green-600 border-green-600' : errors.consent ? 'border-red-400' : 'border-gray-300'}`}>
            {feeConsent && <CheckCircle size={12} className="text-white" />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">I understand and agree to the fee terms</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              I acknowledge that <strong>CampusPlug adds a {Math.round(SERVICE_CHARGE_RATE * 100)}% service charge</strong> on top of my listing price, paid by the buyer.
              I will receive my full listing price on every successful sale.
              {fees && (
                <span className="text-green-700 font-semibold"> For this listing, the buyer pays {formatNaira(fees.buyerTotal)} and I receive {formatNaira(fees.sellerAmount)}.</span>
              )}
            </p>
          </div>
        </label>
        <InputError field="consent" />
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {errors.submit}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        )}
        <button type="submit" disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
          {uploading ? <><Loader2 size={16} className="animate-spin" /> Listing...</> : <><Upload size={16} /> List Item</>}
        </button>
      </div>
    </form>
  );
}