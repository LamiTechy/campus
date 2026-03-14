// src/pages/OrdersPage.jsx
import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, AlertTriangle, Loader2, MessageCircle, ShoppingBag, Store, MapPin, ArrowLeftRight, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';
import { formatNaira } from '../lib/flutterwave';

// Timeline steps for WhatsApp-based orders
const TIMELINE = [
  { status: 'pending',   label: 'Order Created',      desc: 'Buyer contacted seller on WhatsApp',   icon: '📋' },
  { status: 'meetup',    label: 'Meetup Arranged',     desc: 'Both agreed on location & time',       icon: '📍' },
  { status: 'delivered', label: 'Item Handed Over',    desc: 'Seller gave item to buyer',            icon: '🤝' },
  { status: 'completed', label: 'Deal Completed',      desc: 'Buyer confirmed & paid seller',        icon: '✅' },
];

const STATUS_CONFIG = {
  pending:   { label: 'Awaiting Meetup',    color: '#94a3b8', bg: 'rgba(100,116,139,0.15)' },
  meetup:    { label: 'Meetup Arranged',    color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
  paid:      { label: 'Paid · In Progress', color: '#a78bfa', bg: 'rgba(139,92,246,0.15)' },
  delivered: { label: 'Item Handed Over',   color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  completed: { label: 'Completed ✅',       color: '#4ade80', bg: 'rgba(22,163,74,0.15)'  },
  cancelled: { label: 'Cancelled',          color: '#f87171', bg: 'rgba(239,68,68,0.15)'  },
  disputed:  { label: 'Disputed ⚠️',        color: '#f87171', bg: 'rgba(239,68,68,0.15)'  },
};

const TIMELINE_ORDER = ['pending', 'meetup', 'delivered', 'completed'];

function OrderTimeline({ status, th }) {
  const currentIdx = TIMELINE_ORDER.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 16, paddingTop: 4 }}>
      {TIMELINE.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Connector line */}
            {i < TIMELINE.length - 1 && (
              <div style={{ position: 'absolute', top: 14, left: '50%', width: '100%', height: 2, background: i < currentIdx ? '#16a34a' : th.border, zIndex: 0 }} />
            )}
            {/* Dot */}
            <div style={{ width: 28, height: 28, borderRadius: '50%', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, background: done ? (active ? '#16a34a' : 'rgba(22,163,74,0.2)') : th.bgHover, border: `2px solid ${done ? '#16a34a' : th.border}`, boxShadow: active ? '0 0 0 4px rgba(22,163,74,0.15)' : 'none', transition: 'all 0.3s', marginBottom: 6 }}>
              {done ? (active ? step.icon : '✓') : <span style={{ fontSize: 9, color: th.textMuted }}>{i + 1}</span>}
            </div>
            <p style={{ fontSize: 9, fontWeight: 700, color: done ? (active ? '#4ade80' : th.textSub) : th.textMuted, textAlign: 'center', lineHeight: 1.3 }}>{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, mode, onUpdate, th, dark }) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  const updateStatus = async (newStatus, notifData) => {
    setLoading(newStatus);
    await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', order.id);
    if (notifData) {
      try { await supabase.from('notifications').insert(notifData); } catch {}
    }
    // Send email notification
    const emailEvent = { meetup: 'meetup', delivered: 'delivered', completed: 'completed', cancelled: null }[newStatus];
    if (emailEvent) {
      try { await supabase.functions.invoke('send-order-email', { body: { order_id: order.id, event: emailEvent } }); } catch {}
    }
    onUpdate(order.id, newStatus);
    setLoading(false);
    setConfirmOpen(false);
  };

  const handleMeetupArranged = () => updateStatus('meetup', {
    user_id: mode === 'selling' ? order.buyer_id : order.seller_id,
    type: 'order',
    title: '📍 Meetup Arranged!',
    message: `Your order for "${order.products?.title || order.products?.name}" has a meetup arranged. Get ready!`,
    link: '/orders',
  });

  const handleHandedOver = () => updateStatus('delivered', {
    user_id: order.buyer_id,
    type: 'order',
    title: '🤝 Item Handed Over!',
    message: `The seller has marked "${order.products?.title || order.products?.name}" as handed over. Please confirm when you're happy.`,
    link: '/orders',
  });

  const handleConfirmReceived = async () => {
    setLoading('completing');
    await supabase.from('orders').update({ status: 'completed', delivery_confirmed_at: new Date().toISOString() }).eq('id', order.id);
    try { await supabase.functions.invoke('send-seller-payment', { body: { order_id: order.id } }); } catch {}
    try { await supabase.functions.invoke('send-order-email', { body: { order_id: order.id, event: 'completed' } }); } catch {}
    try {
      await supabase.from('notifications').insert({
        user_id: order.seller_id, type: 'success',
        title: '💰 Deal Complete!',
        message: `Buyer confirmed receipt of "${order.products?.title || order.products?.name}". Payment is on the way!`,
        link: '/orders',
      });
    } catch {}
    onUpdate(order.id, 'completed');
    setLoading(false);
    setConfirmOpen(false);
  };

  const handleCancel = () => updateStatus('cancelled', {
    user_id: mode === 'selling' ? order.buyer_id : order.seller_id,
    type: 'warning',
    title: '❌ Order Cancelled',
    message: `The order for "${order.products?.title || order.products?.name}" was cancelled.`,
    link: '/orders',
  });

  const openWhatsApp = () => {
    const contact = mode === 'buying' ? order.seller?.whatsapp_number : order.buyer?.whatsapp_number;
    if (!contact) return;
    const number = contact.replace(/\D/g, '').replace(/^0/, '234');
    const name = mode === 'buying' ? order.seller?.full_name?.split(' ')[0] : order.buyer?.full_name?.split(' ')[0];
    const msg = encodeURIComponent(`Hi ${name || 'there'}! 👋 Regarding the *${order.products?.title || order.products?.name}* order on CampusPlug — `);
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  };

  const showTimeline = ['pending', 'meetup', 'delivered'].includes(order.status);

  return (
    <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: th.shadow }}>
      {/* Status bar */}
      <div style={{ padding: '8px 16px', background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: status.color }}>{status.label}</span>
        <span style={{ fontSize: 11, color: status.color, opacity: 0.7 }}>{new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
      </div>

      <div style={{ padding: 16 }}>
        {/* Product row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: th.bgHover, overflow: 'hidden', flexShrink: 0 }}>
            {order.products?.images?.[0]
              ? <img src={order.products.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📦</div>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 800, color: th.text, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.products?.title || order.products?.name || 'Product'}</p>
            <p style={{ fontSize: 12, color: th.textSub, marginBottom: 2 }}>{mode === 'buying' ? `Seller: ${order.seller?.full_name || '—'}` : `Buyer: ${order.buyer?.full_name || '—'}`}</p>
            <p style={{ fontSize: 14, fontWeight: 900, color: '#4ade80' }}>{formatNaira(order.amount)}</p>
          </div>
          <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: th.textMuted, alignSelf: 'flex-start', padding: 4 }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Timeline */}
        {showTimeline && <OrderTimeline status={order.status} th={th} />}

        {/* Expanded details */}
        {expanded && (
          <div style={{ background: th.bgHover, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: th.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Order Details</p>
            {[
              ['Order ID', order.id?.slice(0, 8).toUpperCase()],
              ['Amount', formatNaira(order.amount)],
              ['Date', new Date(order.created_at).toLocaleString('en-NG')],
              mode === 'selling' ? ['Buyer contact', order.buyer?.whatsapp_number || '—'] : ['Seller contact', order.seller?.whatsapp_number || '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: th.textSub }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: th.text }}>{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* SELLER actions */}
          {mode === 'selling' && order.status === 'pending' && (
            <button onClick={handleMeetupArranged} disabled={!!loading} style={{ width: '100%', padding: '11px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {loading === 'meetup' ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <MapPin size={14} />}
              Mark Meetup Arranged
            </button>
          )}
          {mode === 'selling' && order.status === 'meetup' && (
            <button onClick={handleHandedOver} disabled={!!loading} style={{ width: '100%', padding: '11px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {loading === 'delivered' ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ArrowLeftRight size={14} />}
              Mark Item Handed Over
            </button>
          )}

          {/* BUYER actions */}
          {mode === 'buying' && order.status === 'delivered' && (
            <button onClick={() => setConfirmOpen(true)} style={{ width: '100%', padding: '11px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <CheckCircle size={14} /> I Received This Item ✓
            </button>
          )}

          {/* WhatsApp */}
          {!['completed', 'cancelled'].includes(order.status) && (
            <button onClick={openWhatsApp} style={{ width: '100%', padding: '11px', background: 'transparent', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <MessageCircle size={14} /> {mode === 'buying' ? 'Message Seller' : 'Message Buyer'}
            </button>
          )}

          {/* Cancel — only early stage */}
          {['pending', 'meetup'].includes(order.status) && (
            <button onClick={handleCancel} disabled={!!loading} style={{ width: '100%', padding: '9px', background: 'transparent', border: `1px solid ${th.border}`, color: th.textMuted, borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Confirm received modal */}
      {confirmOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: th.bgCard, borderRadius: 24, maxWidth: 360, width: '100%', padding: 28, border: `1px solid ${th.border}` }}>
            <div style={{ width: 56, height: 56, background: 'rgba(22,163,74,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={26} color="#4ade80" />
            </div>
            <h3 style={{ fontWeight: 900, color: th.text, fontSize: 17, textAlign: 'center', marginBottom: 8 }}>Confirm You Received It?</h3>
            <p style={{ color: th.textSub, fontSize: 13, textAlign: 'center', lineHeight: 1.7, marginBottom: 12 }}>Only confirm if you have <strong>physically received</strong> your item and are happy with it.</p>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '10px 14px', marginBottom: 20 }}>
              <p style={{ color: '#fbbf24', fontSize: 12, textAlign: 'center', fontWeight: 600 }}>⚠️ This completes the order permanently.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmOpen(false)} style={{ flex: 1, padding: '12px', border: `1px solid ${th.border}`, background: 'transparent', color: th.text, borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={handleConfirmReceived} disabled={loading === 'completing'} style={{ flex: 1, padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {loading === 'completing' ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                Yes, Got It ✓
              </button>
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
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchOrders(); }, [tab, user]);

  async function fetchOrders() {
    if (!user) return;
    setLoading(true);
    const field = tab === 'buying' ? 'buyer_id' : 'seller_id';
    const { data } = await supabase.from('orders')
      .select('*, products(title, name, images, category), buyer:profiles!orders_buyer_id_fkey(full_name, whatsapp_number), seller:profiles!orders_seller_id_fkey(full_name, whatsapp_number)')
      .eq(field, user.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  const handleUpdate = (id, newStatus) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const actionNeeded = orders.filter(o =>
    (tab === 'buying' && o.status === 'delivered') ||
    (tab === 'selling' && ['pending', 'meetup'].includes(o.status))
  ).length;

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'meetup', label: 'Meetup' },
    { key: 'delivered', label: 'Handed Over' },
    { key: 'completed', label: 'Done' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px', marginBottom: 4 }}>My Orders</h1>
          <p style={{ color: th.textSub, fontSize: 13 }}>Track and manage your deals</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[{ key: 'buying', label: '🛍️ Buying', icon: ShoppingBag }, { key: 'selling', label: '🏷️ Selling', icon: Store }].map(({ key, label }) => (
            <button key={key} onClick={() => { setTab(key); setFilter('all'); }} style={{
              flex: 1, padding: '11px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: tab === key ? '#16a34a' : th.bgCard,
              color: tab === key ? '#fff' : th.textSub,
              boxShadow: tab === key ? '0 2px 8px rgba(22,163,74,0.3)' : th.shadow,
            }}>{label}</button>
          ))}
        </div>

        {/* Action needed alert */}
        {actionNeeded > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, marginBottom: 16 }}>
            <AlertTriangle size={15} color="#fbbf24" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>
              {tab === 'buying'
                ? `${actionNeeded} order${actionNeeded > 1 ? 's' : ''} waiting for your confirmation`
                : `${actionNeeded} order${actionNeeded > 1 ? 's' : ''} need${actionNeeded === 1 ? 's' : ''} your action`}
            </p>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', border: `1px solid ${filter === f.key ? '#16a34a' : th.border}`,
              background: filter === f.key ? 'rgba(22,163,74,0.12)' : 'transparent',
              color: filter === f.key ? '#4ade80' : th.textMuted, whiteSpace: 'nowrap', flexShrink: 0,
            }}>{f.label}</button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader2 size={28} color="#16a34a" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 24, padding: '60px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{tab === 'buying' ? '🛍️' : '🏷️'}</div>
            <p style={{ fontWeight: 800, color: th.text, marginBottom: 6 }}>No {filter !== 'all' ? filter : ''} orders yet</p>
            <p style={{ color: th.textSub, fontSize: 14 }}>{tab === 'buying' ? 'Find something you like and contact the seller!' : 'List items to start getting orders!'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(order => <OrderCard key={order.id} order={order} mode={tab} onUpdate={handleUpdate} th={th} dark={dark} />)}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}