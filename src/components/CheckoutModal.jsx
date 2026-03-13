// src/components/CheckoutModal.jsx
import { useState } from 'react';
import { X, Shield, Lock, AlertCircle, Loader2, CheckCircle, MessageCircle, Phone, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { calculateFees, formatNaira, initializeFlutterwave } from '../lib/flutterwave';

export default function CheckoutModal({ product, onClose }) {
  const { user, profile } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sellerProfile, setSellerProfile] = useState(null);
  const fees = calculateFees(product.price);

  const handleWhatsApp = () => {
    const number = (sellerProfile?.whatsapp_number || product.whatsapp_number)?.replace(/\D/g, '').replace(/^0/, '234');
    const msg = encodeURIComponent(`Hi ${sellerProfile?.full_name || ''}! 👋\n\nI just paid *${formatNaira(fees.price)}* for your *${product.name}* on CampusPlug.\n\nPayment Reference: *${paid}*\n\nLet's arrange pickup/delivery. When are you free?`);
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  };

  const handlePay = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setLoading(true); setError('');
    try {
      const reference = `CP_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const { data: seller } = await supabase.from('profiles').select('full_name, email, whatsapp_number, account_number, bank_code, bank_name, bank_verified').eq('id', product.seller_id).single();
      setSellerProfile(seller);
      if (!seller?.account_number || !seller?.bank_code) { setError("This seller hasn't added bank details yet."); setLoading(false); return; }
      const { data: order, error: orderError } = await supabase.from('orders').insert({ product_id: product.id, buyer_id: user.id, seller_id: product.seller_id, amount: fees.buyerTotal, seller_amount: fees.sellerAmount, platform_fee: fees.serviceCharge, paystack_reference: reference, status: 'pending', auto_release_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() }).select().single();
      if (orderError) throw orderError;
      setLoading(false);
      initializeFlutterwave({
        email: user.email, amount: fees.buyerTotal, reference, name: profile?.full_name || user.email, phone: profile?.whatsapp_number || '',
        onSuccess: async () => {
          setPaid(reference);
          (async () => {
            await supabase.from('orders').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('paystack_reference', reference);
            try {
              await Promise.all([
                supabase.from('notifications').insert({ user_id: user.id, type: 'order', title: '✅ Payment Successful!', message: `Your payment for "${product.name}" (${formatNaira(fees.buyerTotal)}) is held securely. Confirm delivery to release payment.`, link: '/orders' }),
                supabase.from('notifications').insert({ user_id: product.seller_id, type: 'order', title: '🛍️ New Sale!', message: `Someone just bought "${product.name}" for ${formatNaira(fees.price)}.`, link: '/orders' }),
              ]);
            } catch {}
            try { await supabase.rpc('reduce_product_quantity', { product_id: product.id }); } catch {}
          })();
        },
        onClose: () => { supabase.from('orders').delete().eq('id', order.id).eq('status', 'pending'); },
      });
    } catch (err) { setError(err.message || 'Something went wrong.'); setLoading(false); }
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' };
  const modal = { background: th.bgCard, borderRadius: 24, maxWidth: 380, width: '100%', overflow: 'hidden', marginTop: 16, border: `1px solid ${th.border}` };

  if (paid) return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ background: '#16a34a', padding: '24px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><CheckCircle size={30} color="#fff" /></div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>Payment Successful! 🎉</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{formatNaira(fees.buyerTotal)} paid & secured</p>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10 }}>
            <Shield size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: th.text, lineHeight: 1.6 }}><strong>Your money is safely held 🔒</strong> — Once you confirm delivery in <strong>My Orders</strong>, the seller receives payment.</p>
          </div>
          <div style={{ background: th.bgHover, border: `1px solid ${th.border}`, borderRadius: 14, padding: '12px 14px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: th.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Contact Seller</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: th.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: th.greenText, fontWeight: 900, fontSize: 12 }}>{(sellerProfile?.full_name || 'S').charAt(0).toUpperCase()}</span>
              </div>
              <span style={{ fontWeight: 700, color: th.text, fontSize: 14 }}>{sellerProfile?.full_name || 'Seller'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 10, padding: '8px 12px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={13} color="#4ade80" /><span style={{ fontWeight: 700, color: th.text, fontSize: 13 }}>{sellerProfile?.whatsapp_number || product.whatsapp_number}</span></div>
              <button onClick={() => { navigator.clipboard.writeText(sellerProfile?.whatsapp_number || product.whatsapp_number); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: 'none', border: 'none', color: th.textMuted, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Copy size={11} />{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <button onClick={handleWhatsApp} style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><MessageCircle size={15} /> Chat on WhatsApp</button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: th.textMuted }}>Reference: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: th.textSub }}>{paid}</span></p>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', border: `1px solid ${th.border}`, background: 'transparent', color: th.textSub, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>View in My Orders</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${th.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={16} color="#4ade80" /><h3 style={{ fontWeight: 800, color: th.text, fontSize: 15 }}>Secure Checkout</h3></div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: th.bgHover, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} color={th.textSub} /></button>
        </div>

        <div style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: `1px solid ${th.border}` }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', background: th.bgHover, flexShrink: 0 }}>
            {product.images?.[0] ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📦</div>}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, color: th.text, fontSize: 14, marginBottom: 2 }}>{product.name}</p>
            <p style={{ color: th.textMuted, fontSize: 12, marginBottom: 4 }}>{product.category}</p>
            <p style={{ fontWeight: 900, color: '#4ade80', fontSize: 15 }}>{formatNaira(product.price)}</p>
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${th.border}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: th.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Payment Summary</p>
          {[['Item price', formatNaira(fees.price), th.text], ['Service charge (3%)', `+ ${formatNaira(fees.serviceCharge)}`, '#fbbf24']].map(([label, val, col]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: th.textSub }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: col }}>{val}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${th.border}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, color: th.text, fontSize: 14 }}>Total you pay</span>
            <span style={{ fontWeight: 900, color: '#4ade80', fontSize: 14 }}>{formatNaira(fees.buyerTotal)}</span>
          </div>
        </div>

        <div style={{ padding: '14px 20px', background: 'rgba(22,163,74,0.06)', borderBottom: `1px solid ${th.border}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>How it works</p>
          {[['1','You pay securely via Flutterwave'],['2',"Money is held — seller can't access it yet"],['3','Contact seller on WhatsApp for pickup'],['4','Once received, confirm in My Orders'],['5','Seller gets paid ✅']].map(([step, text]) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#16a34a', color: '#fff', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step}</div>
              <span style={{ fontSize: 12, color: th.greenText }}>{text}</span>
            </div>
          ))}
        </div>

        {error && <div style={{ margin: '14px 20px 0', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, display: 'flex', gap: 8, color: '#f87171', fontSize: 13 }}><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{error}</div>}

        <div style={{ padding: 20 }}>
          {!profile?.is_verified ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, display: 'flex', gap: 10 }}>
                <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
                <div><p style={{ fontWeight: 800, color: th.text, fontSize: 13 }}>Verification Required</p><p style={{ color: th.textSub, fontSize: 12, marginTop: 2 }}>Verify your student ID before making purchases.</p></div>
              </div>
              <a href="/profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: '#d97706', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}><Shield size={15} /> Verify My Student ID</a>
              <button onClick={onClose} style={{ padding: '12px', border: `1px solid ${th.border}`, background: 'transparent', color: th.textSub, borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            </div>
          ) : (
            <>
              <button onClick={handlePay} disabled={loading} style={{ width: '100%', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Lock size={15} />}
                {loading ? 'Processing...' : `Pay ${formatNaira(fees.buyerTotal)} Securely`}
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: th.textMuted, marginTop: 8 }}>Powered by Flutterwave · 256-bit SSL encrypted</p>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}