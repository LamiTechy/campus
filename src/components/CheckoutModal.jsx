// src/components/CheckoutModal.jsx
import { useState } from 'react';
import { X, MessageCircle, Phone, Copy, CheckCircle, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { formatNaira } from '../lib/flutterwave';

export default function CheckoutModal({ product, onClose }) {
  const { user, profile } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
  const [step, setStep] = useState('confirm'); // confirm | whatsapp
  const [loading, setLoading] = useState(false);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(4px)', zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
  };
  const modal = {
    background: th.bgCard, borderRadius: 24, maxWidth: 380,
    width: '100%', overflow: 'hidden', border: `1px solid ${th.border}`,
    maxHeight: '90vh', overflowY: 'auto',
  };

  const openWhatsApp = (seller) => {
    const raw = (seller?.whatsapp_number || '').replace(/\D/g, '').replace(/^0/, '234');
    const number = raw.startsWith('234') ? raw : '234' + raw;
    const msg = encodeURIComponent(
      `Hi ${seller?.full_name?.split(' ')[0] || 'there'}! 👋\n\nI'm interested in buying your *${product.title || product.name}* listed for *${formatNaira(product.price)}* on CampusPlug.\n\nAre you still available? Let's arrange a meetup on campus. 🎓`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  };

  const handleProceed = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setLoading(true);
    try {
      // Fetch seller profile
      const { data: seller } = await supabase
        .from('profiles')
        .select('full_name, whatsapp_number')
        .eq('id', product.seller_id)
        .single();
      setSellerProfile(seller);

      // Create a pending order to track interest
      const { data: order } = await supabase.from('orders').insert({
        product_id: product.id,
        buyer_id: user.id,
        seller_id: product.seller_id,
        amount: product.price,
        seller_amount: product.price,
        platform_fee: 0,
        status: 'pending',
      }).select().single();
      if (order) setOrderId(order.id);

      // Notify seller
      await supabase.from('notifications').insert({
        user_id: product.seller_id,
        type: 'order',
        title: '👀 Someone is interested!',
        message: `A buyer wants to buy "${product.title || product.name}" for ${formatNaira(product.price)}. Check WhatsApp!`,
        link: '/orders',
      }).catch(() => {});

      setStep('whatsapp');
      // Auto-open WhatsApp
      if (seller?.whatsapp_number) openWhatsApp(seller);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Step 1: Confirm purchase ──
  if (step === 'confirm') return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${th.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={16} color="#16a34a" />
            <h3 style={{ fontWeight: 800, color: th.text, fontSize: 15 }}>Buy via WhatsApp</h3>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: th.bgHover, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color={th.textSub} />
          </button>
        </div>

        {/* Product */}
        <div style={{ display: 'flex', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${th.border}` }}>
          <div style={{ width: 68, height: 68, borderRadius: 14, overflow: 'hidden', background: th.bgHover, flexShrink: 0 }}>
            {product.images?.[0]
              ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📦</div>}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, color: th.text, fontSize: 14, marginBottom: 3 }}>{product.title || product.name}</p>
            <p style={{ color: th.textMuted, fontSize: 12, marginBottom: 6 }}>{product.category}</p>
            <p style={{ fontWeight: 900, color: '#4ade80', fontSize: 17 }}>{formatNaira(product.price)}</p>
          </div>
        </div>

        {/* How it works */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${th.border}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: th.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>How it works</p>
          {[
            { emoji: '1️⃣', text: 'Tap the button below to open WhatsApp' },
            { emoji: '2️⃣', text: 'A message is pre-filled — just send it to the seller' },
            { emoji: '3️⃣', text: 'Agree on price, meetup point on campus' },
            { emoji: '4️⃣', text: 'Pay cash on delivery & collect your item ✅' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji}</span>
              <span style={{ fontSize: 13, color: th.textSub, lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div style={{ margin: '0 20px 16px', padding: '12px 14px', background: dark ? 'rgba(22,163,74,0.08)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.2)' : '#bbf7d0'}`, borderRadius: 12 }}>
          <p style={{ fontSize: 12, color: th.text, lineHeight: 1.6 }}>
            💡 <strong>Safety tip:</strong> Always meet in a public place on campus — library, cafeteria, or faculty block. Never send money before seeing the item.
          </p>
        </div>

        {/* CTA */}
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleProceed} disabled={loading} style={{
            width: '100%', padding: '14px', background: '#25D366', color: '#fff',
            border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 15,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading
              ? <span style={{ fontSize: 13 }}>Getting seller info...</span>
              : <><MessageCircle size={18} /> Contact Seller on WhatsApp</>}
          </button>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', border: `1px solid ${th.border}`, background: 'transparent', color: th.textSub, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step 2: WhatsApp opened ──
  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {/* Success header */}
        <div style={{ background: '#25D366', padding: '24px 20px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <MessageCircle size={28} color="#fff" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>WhatsApp Opened! 🎉</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Your message to the seller is ready to send</p>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Seller contact */}
          <div style={{ background: th.bgHover, border: `1px solid ${th.border}`, borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: th.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Seller Contact</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(22,163,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#16a34a', fontWeight: 900, fontSize: 14 }}>{(sellerProfile?.full_name || 'S').charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: th.text, fontSize: 14 }}>{sellerProfile?.full_name || 'Seller'}</p>
                <p style={{ fontSize: 12, color: th.textMuted }}>Campus Seller</p>
              </div>
            </div>
            {sellerProfile?.whatsapp_number && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 10, padding: '9px 12px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={13} color="#25D366" />
                  <span style={{ fontWeight: 700, color: th.text, fontSize: 13 }}>{sellerProfile.whatsapp_number}</span>
                </div>
                <button onClick={() => handleCopy(sellerProfile.whatsapp_number)} style={{ background: 'none', border: 'none', color: th.textMuted, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Copy size={11} /> {copied ? '✅ Copied' : 'Copy'}
                </button>
              </div>
            )}
            <button onClick={() => openWhatsApp(sellerProfile)} style={{ width: '100%', padding: '12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <MessageCircle size={15} /> Open WhatsApp Again
            </button>
          </div>

          {/* Reminder */}
          <div style={{ background: dark ? 'rgba(251,191,36,0.08)' : '#fffbeb', border: `1px solid ${dark ? 'rgba(251,191,36,0.2)' : '#fde68a'}`, borderRadius: 12, padding: '12px 14px' }}>
            <p style={{ fontSize: 12, color: th.text, lineHeight: 1.6 }}>
              🔒 <strong>Remember:</strong> Agree on price & meetup before paying anything. Meet in public. Stay safe!
            </p>
          </div>

          <button onClick={onClose} style={{ width: '100%', padding: '12px', border: `1px solid ${th.border}`, background: 'transparent', color: th.textSub, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Done <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}