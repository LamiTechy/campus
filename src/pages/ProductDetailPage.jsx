// src/pages/ProductDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, MapPin, Clock, Shield, Package, Loader2, Share2, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatNaira } from '../lib/flutterwave';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';
import CheckoutModal from '../components/CheckoutModal';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { user, profile } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchProduct(); }, [productId]);

  async function fetchProduct() {
    const { data } = await supabase.from('products')
      .select('*, profiles(full_name, is_verified, whatsapp_number, university)')
      .eq('id', productId).single();
    setProduct(data); setLoading(false);
  }

  const handleShare = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const timeAgo = (date) => { const s = Math.floor((new Date() - new Date(date)) / 1000); if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s/60)}m ago`; if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; };

  if (loading) return <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={28} color="#16a34a" style={{ animation: 'spin 0.8s linear infinite' }} /></div>;
  if (!product) return <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}><Package size={48} color={th.textMuted} /><p style={{ color: th.textSub, fontWeight: 600 }}>Product not found</p><button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontWeight: 700 }}>← Back</button></div>;

  const images = product.images?.filter(Boolean) || [];
  const isOwner = user?.id === product.seller_id;
  const isOutOfStock = product.quantity === 0;
  const COND = { 'new': { label: 'Brand New', bg: 'rgba(22,163,74,0.15)', color: '#4ade80' }, 'fairly-used': { label: 'Fairly Used', bg: 'rgba(234,179,8,0.15)', color: '#fbbf24' }, 'used': { label: 'Used', bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' } };
  const cond = COND[product.condition] || COND['used'];

  return (
    <>
      <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: th.textSub, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginBottom: 24, fontSize: 14 }}>
            <ChevronLeft size={18} /> Back
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            {/* Images */}
            <div>
              <div style={{ position: 'relative', aspectRatio: '1/1', background: th.bgCard, borderRadius: 20, overflow: 'hidden', marginBottom: 12, border: `1px solid ${th.border}` }}>
                {images.length > 0 ? <img src={images[imgIndex]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={48} color={th.textMuted} /></div>}
                {images.length > 1 && (<>
                  <button onClick={() => setImgIndex(p => (p - 1 + images.length) % images.length)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ChevronLeft size={18} /></button>
                  <button onClick={() => setImgIndex(p => (p + 1) % images.length)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ChevronRight size={18} /></button>
                </>)}
                <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 100, background: cond.bg, color: cond.color, fontSize: 11, fontWeight: 700 }}>{cond.label}</div>
              </div>
              {images.length > 1 && <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>{images.map((img, i) => <button key={i} onClick={() => setImgIndex(i)} style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 12, overflow: 'hidden', border: `2px solid ${i === imgIndex ? '#16a34a' : 'transparent'}`, cursor: 'pointer', padding: 0 }}><img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></button>)}</div>}
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{product.category}</p>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: th.text, lineHeight: 1.2 }}>{product.name}</h1>
                </div>
                <button onClick={handleShare} style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${th.border}`, background: th.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  {copied ? <CheckCircle size={16} color="#4ade80" /> : <Share2 size={16} color={th.textSub} />}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4ade80' }}>{formatNaira(product.price)}</span>
                {isOutOfStock ? <span style={{ fontSize: 12, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '4px 12px', borderRadius: 100 }}>Out of Stock</span>
                  : product.quantity <= 3 ? <span style={{ fontSize: 12, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '4px 12px', borderRadius: 100 }}>⚠️ Only {product.quantity} left</span>
                  : <span style={{ fontSize: 12, color: th.textMuted, background: th.bgHover, padding: '4px 12px', borderRadius: 100 }}>{product.quantity} available</span>}
              </div>

              {product.description && <div style={{ background: th.bgHover, borderRadius: 14, padding: '14px 16px' }}><p style={{ fontWeight: 700, color: th.text, fontSize: 13, marginBottom: 6 }}>Description</p><p style={{ fontSize: 13, color: th.textSub, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{product.description}</p></div>}

              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: th.textMuted }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{timeAgo(product.created_at)}</span>
                {product.quantity_sold > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Package size={12} />{product.quantity_sold} sold</span>}
              </div>

              <Link to={`/seller/${product.seller_id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 16, textDecoration: 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: th.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: th.greenText, fontWeight: 900, fontSize: 14 }}>{product.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 800, color: th.text, fontSize: 14 }}>{product.profiles?.full_name || 'Seller'}</span>
                    {product.profiles?.is_verified && <CheckCircle size={13} color="#4ade80" />}
                  </div>
                  {product.profiles?.university && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: th.textMuted, marginTop: 2 }}><MapPin size={10} />{product.profiles.university}</div>}
                </div>
                <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 700 }}>View all →</span>
              </Link>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 14 }}>
                <Shield size={16} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: th.greenText, lineHeight: 1.6 }}><strong>Secure Payment</strong> — Your money is held safely until you confirm delivery. 3% service charge added at checkout.</p>
              </div>

              {isOwner ? (
                <div style={{ padding: '16px', background: th.bgHover, borderRadius: 14, textAlign: 'center', fontSize: 14, fontWeight: 700, color: th.textMuted }}>This is your listing</div>
              ) : isOutOfStock ? (
                <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#f87171' }}>Out of Stock</div>
              ) : !user ? (
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', background: '#16a34a', color: '#fff', borderRadius: 14, fontWeight: 900, fontSize: 14, textDecoration: 'none' }}>Login to Buy · {formatNaira(product.price)}</Link>
              ) : (
                <button onClick={() => setCheckoutOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 900, fontSize: 14, cursor: 'pointer', width: '100%' }}>
                  <Shield size={16} /> Buy Now · {formatNaira(product.price)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {checkoutOpen && <CheckoutModal product={product} onClose={() => setCheckoutOpen(false)} />}
    </>
  );
}