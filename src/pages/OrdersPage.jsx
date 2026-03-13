// src/pages/OrdersPage.jsx
import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, AlertTriangle, Loader2, MessageCircle, ShoppingBag, Store } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';
import { formatNaira } from '../lib/flutterwave';

const STATUS_CONFIG = {
  pending:   { label: 'Pending Payment',        icon: Clock,          bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
  paid:      { label: 'Paid · Awaiting Delivery', icon: Package,       bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  delivered: { label: 'Delivery Confirmed',     icon: CheckCircle,    bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  completed: { label: 'Completed',              icon: CheckCircle,    bg: 'rgba(22,163,74,0.15)',  color: '#4ade80' },
  disputed:  { label: 'Disputed',               icon: AlertTriangle,  bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
};

function OrderCard({ order, mode, onConfirm, th }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    setConfirmOpen(false);
    onConfirm(order.id);
    (async () => {
      await supabase.from('orders').update({ status: 'completed', delivery_confirmed_at: new Date().toISOString() }).eq('id', order.id);
      try { await supabase.functions.invoke('send-seller-payment', { body: { order_id: order.id } }); } catch (e) {}
      try {
        const amount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(order.seller_amount);
        await supabase.from('notifications').insert({ user_id: order.seller_id, type: 'success', title: '💰 Payment Sent!', message: `${order.buyer?.full_name || 'Buyer'} confirmed delivery of "${order.products?.name}". ${amount} is being transferred.`, link: '/orders' });
      } catch (e) {}
    })();
    setConfirming(false);
  };

  const handleWhatsApp = () => {
    const rawContact = mode === 'buying' ? (order.products?.whatsapp_number || order.seller?.whatsapp_number) : order.buyer?.whatsapp_number;
    if (!rawContact) return alert('WhatsApp number not available.');
    const number = rawContact.replace(/\D/g, '').replace(/^0/, '234');
    const msg = encodeURIComponent(mode === 'buying'
      ? `Hi! I just paid for *${order.products?.name}* on CampusPlug. When can we arrange pickup?`
      : `Hi! Your payment for *${order.products?.name}* on CampusPlug has been received. When can we arrange delivery?`);
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  };

  return (
    <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: th.shadow }}>
      {/* Status bar */}
      <div style={{ padding: '8px 16px', background: status.bg, display: 'flex', alignItems: 'center', gap: 6 }}>
        <StatusIcon size={12} color={status.color} />
        <span style={{ fontSize: 12, fontWeight: 700, color: status.color }}>{status.label}</span>
      </div>

      <div style={{ padding: 16 }}>
        {/* Product info */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: th.bgHover, overflow: 'hidden', flexShrink: 0 }}>
            {order.products?.images?.[0]
              ? <img src={order.products.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📦</div>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 800, color: th.text, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.products?.name || 'Product'}</p>
            <p style={{ fontSize: 12, color: th.textSub }}>{mode === 'buying' ? `Seller: ${order.seller?.full_name || 'Unknown'}` : `Buyer: ${order.buyer?.full_name || 'Unknown'}`}</p>
            <p style={{ fontSize: 11, color: th.textMuted, marginTop: 2 }}>{new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Money breakdown */}
        <div style={{ background: th.bgHover, borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: mode === 'selling' ? 6 : 0 }}>
            <span style={{ fontSize: 13, color: th.textSub }}>Amount paid</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: th.text }}>{formatNaira(order.amount)}</span>
          </div>
          {mode === 'selling' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: th.textSub }}>Platform fee</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>- {formatNaira(order.platform_fee)}</span>
              </div>
              <div style={{ borderTop: `1px solid ${th.border}`, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: th.text }}>{order.status === 'completed' ? 'You received' : 'You will receive'}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#4ade80' }}>{formatNaira(order.seller_amount)}</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mode === 'buying' && order.status === 'paid' && (
            <button onClick={() => setConfirmOpen(true)} disabled={confirming} style={{
              width: '100%', padding: '11px', background: '#16a34a', color: '#fff', border: 'none',
              borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {confirming ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={14} />}
              I Received This Item
            </button>
          )}
          {['paid', 'delivered'].includes(order.status) && (
            <button onClick={handleWhatsApp} style={{
              width: '100%', padding: '11px', background: 'transparent', border: `1px solid rgba(22,163,74,0.4)`,
              color: th.greenText, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <MessageCircle size={14} /> {mode === 'buying' ? 'Contact Seller' : 'Contact Buyer'}
            </button>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: th.bgCard, borderRadius: 24, maxWidth: 360, width: '100%', padding: 28, border: `1px solid ${th.border}` }}>
            <div style={{ width: 56, height: 56, background: 'rgba(22,163,74,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={26} color="#4ade80" />
            </div>
            <h3 style={{ fontWeight: 900, color: th.text, fontSize: 18, textAlign: 'center', marginBottom: 10 }}>Confirm Delivery?</h3>
            <p style={{ color: th.textSub, fontSize: 14, textAlign: 'center', lineHeight: 1.7, marginBottom: 12 }}>Only confirm if you have <strong>physically received</strong> your item.</p>
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 20 }}>
              <p style={{ color: '#fbbf24', fontSize: 12, textAlign: 'center', fontWeight: 600 }}>⚠️ Once confirmed, payment is released and cannot be reversed.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmOpen(false)} style={{ flex: 1, padding: '12px', border: `1px solid ${th.border}`, background: 'transparent', color: th.text, borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={handleConfirmDelivery} style={{ flex: 1, padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>Yes, I Got It ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
  const [tab, setTab] = useState('buying');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, [tab, user]);

  async function fetchOrders() {
    if (!user) return;
    setLoading(true);
    const field = tab === 'buying' ? 'buyer_id' : 'seller_id';
    const { data } = await supabase.from('orders')
      .select('*, products(name, images, whatsapp_number, category), buyer:profiles!orders_buyer_id_fkey(full_name, whatsapp_number), seller:profiles!orders_seller_id_fkey(full_name, whatsapp_number, email, bank_name)')
      .eq(field, user.id).neq('status', 'pending').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  const handleConfirm = (id) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'completed' } : o));
  const pendingConfirmation = orders.filter(o => o.status === 'paid' && tab === 'buying').length;

  return (
    <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px', marginBottom: 24 }}>My Orders</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[{ key: 'buying', label: 'Buying', icon: ShoppingBag }, { key: 'selling', label: 'Selling', icon: Store }].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: tab === key ? '#16a34a' : th.bgCard,
              color: tab === key ? '#fff' : th.textSub,
              boxShadow: tab === key ? '0 2px 8px rgba(22,163,74,0.3)' : th.shadow,
            }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Pending alert */}
        {pendingConfirmation > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, marginBottom: 20 }}>
            <AlertTriangle size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>You have <strong>{pendingConfirmation}</strong> order{pendingConfirmation > 1 ? 's' : ''} waiting for delivery confirmation.</p>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader2 size={28} color="#16a34a" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 24, padding: '64px 32px', textAlign: 'center', boxShadow: th.shadow }}>
            <div style={{ width: 56, height: 56, background: th.bgHover, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {tab === 'buying' ? <ShoppingBag size={26} color={th.textMuted} /> : <Store size={26} color={th.textMuted} />}
            </div>
            <p style={{ fontWeight: 800, color: th.text, marginBottom: 6 }}>No {tab === 'buying' ? 'purchases' : 'sales'} yet</p>
            <p style={{ color: th.textSub, fontSize: 14 }}>{tab === 'buying' ? 'Browse items and make your first purchase!' : 'List items to start selling!'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => <OrderCard key={order.id} order={order} mode={tab} onConfirm={handleConfirm} th={th} />)}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}