// src/pages/OrdersPage.jsx
import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, AlertTriangle, Loader2, MessageCircle, ShoppingBag, Store } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { formatNaira } from '../lib/flutterwave';

const STATUS_CONFIG = {
  pending:   { label: 'Pending Payment', color: 'bg-gray-100 text-gray-600',    icon: Clock },
  paid:      { label: 'Paid · Awaiting Delivery', color: 'bg-blue-100 text-blue-700',  icon: Package },
  delivered: { label: 'Delivery Confirmed', color: 'bg-amber-100 text-amber-700', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  disputed:  { label: 'Disputed', color: 'bg-red-100 text-red-700',     icon: AlertTriangle },
};

function OrderCard({ order, mode, onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    setConfirmOpen(false);

    // Update UI instantly
    onConfirm(order.id);

    // Run all DB operations in background
    (async () => {
      await supabase.from('orders')
        .update({ status: 'completed', delivery_confirmed_at: new Date().toISOString() })
        .eq('id', order.id);

      // Trigger transfer to seller
      try {
        await supabase.functions.invoke('send-seller-payment', {
          body: { order_id: order.id },
        });
      } catch (err) {
        console.warn('Transfer trigger failed:', err);
      }

      // Notify seller
      try {
        const amount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(order.seller_amount);
        await supabase.from('notifications').insert({
          user_id: order.seller_id,
          type: 'success',
          title: '💰 Payment Sent!',
          message: `${order.buyer?.full_name || 'Buyer'} confirmed delivery of "${order.products?.name}". ${amount} is being transferred to your bank account now.`,
          link: '/orders',
        });
      } catch (err) {
        console.warn('Notification error:', err);
      }
    })();

    setConfirming(false);
  };

  const handleWhatsApp = () => {
    // Buying: contact seller using product whatsapp number
    // Selling: contact buyer using their profile whatsapp number
    const rawContact = mode === 'buying'
      ? (order.products?.whatsapp_number || order.seller?.whatsapp_number)
      : order.buyer?.whatsapp_number;

    if (!rawContact) {
      alert('WhatsApp number not available for this user.');
      return;
    }

    const number = rawContact.replace(/\D/g, '').replace(/^0/, '234');
    const msg = encodeURIComponent(mode === 'buying'
      ? `Hi! I just paid for *${order.products?.name}* on CampusPlug (Ref: ${order.paystack_reference}). When can we arrange pickup?`
      : `Hi! I can confirm your payment of *${order.products?.name}* on CampusPlug has been received. When can we arrange delivery?`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Status bar */}
      <div className={`px-4 py-2 flex items-center gap-2 text-xs font-bold ${status.color}`}>
        <StatusIcon size={12} />
        {status.label}
      </div>

      <div className="p-4">
        {/* Product info */}
        <div className="flex gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
            {order.products?.images?.[0]
              ? <img src={order.products.images[0]} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm line-clamp-1">{order.products?.name || 'Product'}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {mode === 'buying' ? `Seller: ${order.seller?.full_name || 'Unknown'}` : `Buyer: ${order.buyer?.full_name || 'Unknown'}`}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Money breakdown */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Amount paid</span>
            <span className="font-semibold">{formatNaira(order.amount)}</span>
          </div>
          {mode === 'selling' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Platform fee (2%)</span>
                <span className="text-red-500 font-semibold">- {formatNaira(order.platform_fee)}</span>
              </div>
              <div className="border-t border-gray-200 pt-1 flex justify-between">
                <span className="font-bold text-gray-900">
                  {order.status === 'completed' ? 'You received' : 'You will receive'}
                </span>
                <span className="font-black text-green-600">{formatNaira(order.seller_amount)}</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {/* Buyer: confirm delivery */}
          {mode === 'buying' && order.status === 'paid' && (
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={confirming}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {confirming ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              I Received This Item
            </button>
          )}

          {/* Confirm delivery modal */}
          {confirmOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-green-600" />
                </div>
                <h3 className="font-black text-gray-900 text-lg text-center mb-2">Confirm Delivery?</h3>
                <p className="text-gray-500 text-sm text-center leading-relaxed mb-2">
                  Only confirm if you have <strong>physically received</strong> your item and are satisfied with it.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
                  <p className="text-amber-700 text-xs text-center font-medium">
                    ⚠️ Once confirmed, payment is released to the seller and <strong>cannot be reversed.</strong>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelivery}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors">
                    Yes, I Got It ✓
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* WhatsApp contact */}
          {['paid', 'delivered'].includes(order.status) && (
            <button onClick={handleWhatsApp}
              className="w-full py-2.5 border border-green-200 text-green-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-50 transition-colors">
              <MessageCircle size={14} />
              {mode === 'buying' ? 'Contact Seller' : 'Contact Buyer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('buying');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, [tab, user]);

  async function fetchOrders() {
    if (!user) return;
    setLoading(true);

    const field = tab === 'buying' ? 'buyer_id' : 'seller_id';
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        products(name, images, whatsapp_number, category),
        buyer:profiles!orders_buyer_id_fkey(full_name, whatsapp_number),
        seller:profiles!orders_seller_id_fkey(full_name, whatsapp_number, email, bank_name)
      `)
      .eq(field, user.id)
      .neq('status', 'pending')
      .order('created_at', { ascending: false });

    setOrders(data || []);
    setLoading(false);
  }

  const handleConfirm = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'completed' } : o));
  };

  const pendingConfirmation = orders.filter(o => o.status === 'paid' && tab === 'buying').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'buying', label: 'Buying', icon: ShoppingBag },
            { key: 'selling', label: 'Selling', icon: Store },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === key ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Pending confirmation alert */}
        {pendingConfirmation > 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
            <p className="text-amber-700 text-sm font-medium">
              You have <strong>{pendingConfirmation}</strong> order{pendingConfirmation > 1 ? 's' : ''} waiting for delivery confirmation. Confirm once you receive your item to release payment.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="text-green-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {tab === 'buying' ? <ShoppingBag size={28} className="text-gray-400" /> : <Store size={28} className="text-gray-400" />}
            </div>
            <p className="font-bold text-gray-600">No {tab === 'buying' ? 'purchases' : 'sales'} yet</p>
            <p className="text-gray-400 text-sm mt-1">
              {tab === 'buying' ? 'Browse items and make your first purchase!' : 'List items to start selling!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} mode={tab} onConfirm={handleConfirm} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}