// src/components/EditProductModal.jsx
import { useState, useRef } from 'react';
import { X, Loader2, ImagePlus, CheckCircle } from 'lucide-react';
import { supabase, uploadFile } from '../lib/supabaseClient';
import { useTheme, t } from '../context/ThemeContext';
import { formatNaira } from '../lib/flutterwave';

const CATEGORIES = ['Electronics','Books & Stationery','Fashion & Clothing','Food & Drinks','Furniture','Services','Beauty & Health','Sports & Fitness','Others'];

export default function EditProductModal({ product, onClose, onSave }) {
  const { dark } = useTheme();
  const th = t(dark);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ name: product.name||'', price: product.price||'', category: product.category||'', condition: product.condition||'fairly-used', description: product.description||'', quantity: product.quantity||1, whatsapp_number: product.whatsapp_number||'', is_available: product.is_available !== false });
  const [images, setImages] = useState(product.images || []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + files.length > 4) { setError('Maximum 4 images'); return; }
    setUploading(true); setError('');
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const ext = file.name.split('.').pop();
        return await uploadFile('product-images', `${product.seller_id}/${product.id}_${Date.now()}.${ext}`, file);
      }));
      setImages(prev => [...prev, ...uploaded]);
    } catch { setError('Image upload failed.'); }
    setUploading(false);
  };

  const handleSave = async () => {
    setError('');
    if (!form.name || !form.price || !form.category) { setError('Name, price and category are required'); return; }
    setSaving(true);
    try {
      const updates = { ...form, price: Number(form.price), quantity: Number(form.quantity), images, updated_at: new Date().toISOString() };
      const { error: dbErr } = await supabase.from('products').update(updates).eq('id', product.id);
      if (dbErr) throw dbErr;
      setSuccess(true); setTimeout(() => { onSave(updates); onClose(); }, 800);
    } catch (err) { setError(err.message || 'Failed to save changes'); }
    setSaving(false);
  };

  const inp = { width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${th.inputBorder}`, background: th.input, color: th.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 24, maxWidth: 420, width: '100%', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${th.border}` }}>
          <h3 style={{ fontWeight: 800, color: th.text, fontSize: 15 }}>Edit Listing</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: th.bgHover, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} color={th.textSub} /></button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Images */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: th.textSub, marginBottom: 8 }}>Photos ({images.length}/4)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', border: `1px solid ${th.border}` }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, background: '#ef4444', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={10} color="#fff" /></button>
                </div>
              ))}
              {images.length < 4 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ aspectRatio: '1/1', borderRadius: 12, border: `2px dashed ${th.inputBorder}`, background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: th.textMuted }}>
                  {uploading ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ImagePlus size={18} />}
                  <span style={{ fontSize: 10, marginTop: 4 }}>Add</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
          </div>

          <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>Product Name</label><input value={form.name} onChange={e => set('name', e.target.value)} style={inp} /></div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>Price (₦)</label>
            <input value={form.price} onChange={e => set('price', e.target.value.replace(/\D/g,''))} placeholder="0" style={inp} />
            {form.price > 0 && <p style={{ fontSize: 11, color: th.textMuted, marginTop: 4 }}>Buyer pays {formatNaira(Math.round(Number(form.price) * 1.03))} (includes 3% fee)</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>Category</label><select value={form.category} onChange={e => set('category', e.target.value)} style={inp}><option value="">Select...</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>Condition</label><select value={form.condition} onChange={e => set('condition', e.target.value)} style={inp}><option value="new">Brand New</option><option value="fairly-used">Fairly Used</option><option value="used">Used</option></select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>Quantity</label><input value={form.quantity} onChange={e => set('quantity', e.target.value.replace(/\D/g,'') || 1)} type="number" min="0" style={inp} /></div>
            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>Status</label><button type="button" onClick={() => set('is_available', !form.is_available)} style={{ ...inp, cursor: 'pointer', background: form.is_available ? 'rgba(22,163,74,0.1)' : th.bgHover, border: `1px solid ${form.is_available ? 'rgba(22,163,74,0.3)' : th.inputBorder}`, color: form.is_available ? '#4ade80' : th.textSub, fontWeight: 700 }}>{form.is_available ? '✅ Available' : '⏸ Unavailable'}</button></div>
          </div>
          <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>WhatsApp Number</label><input value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} placeholder="08012345678" style={inp} /></div>
          <div><label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Describe your item..." style={{ ...inp, resize: 'none' }} /></div>

          {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', border: `1px solid ${th.border}`, background: 'transparent', color: th.textSub, borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving || success} style={{ flex: 1, padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : success ? <CheckCircle size={15} /> : null}
              {success ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}