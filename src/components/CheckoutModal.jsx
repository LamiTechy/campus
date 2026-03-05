// src/components/CheckoutModal.jsx
import { useState } from 'react';
import { X, Shield, Lock, AlertCircle, Loader2, CheckCircle, MessageCircle, Phone, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { calculateFees, formatNaira, initializeFlutterwave } from '../lib/flutterwave';

export default function CheckoutModal({ product, onClose }) {
  const { user, profile } = useAuth();
  const isVerified = profile?.is_verified || false;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sellerProfile, setSellerProfile] = useState(null);

  const fees = calculateFees(product.price);

  const formatWhatsApp = (num) => num?.replace(/\D/g, '').replace(/^0/, '234');

  const handleWhatsApp = () => {
    const number = formatWhatsApp(sellerProfile?.whatsapp_number || product.whatsapp_number);
    const msg = encodeURIComponent(
      `Hi ${sellerProfile?.full_name || ''}! 👋\n\nI just paid *${formatNaira(fees.price)}* for your *${product.name}* on CampusPlug.\n\nPayment Reference: *${paid}*\n\nLet's arrange pickup/delivery. When are you free?`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  };

  const copyNumber = () => {
    const num = sellerProfile?.whatsapp_number || product.whatsapp_number;
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setLoading(true);
    setError('');

    try {
      const reference = `CP_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      // Fetch seller profile
      const { data: seller } = await supabase
        .from('profiles')
        .select('full_name, email, whatsapp_number, account_number, bank_code, bank_name, bank_verified')
        .eq('id', product.seller_id)
        .single();

      setSellerProfile(seller);

      // Block if seller has no bank details
      if (!seller?.account_number || !seller?.bank_code) {
        setError("This seller hasn't added bank details yet and can't receive online payments.");
        setLoading(false);
        return;
      }

      // Create pending order
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        product_id: product.id,
        buyer_id: user.id,
        seller_id: product.seller_id,
        amount: fees.buyerTotal,
        seller_amount: fees.sellerAmount,
        platform_fee: fees.serviceCharge,
        paystack_reference: reference,
        status: 'pending',
        auto_release_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      }).select().single();

      if (orderError) throw orderError;

      setLoading(false);

      // Open Flutterwave
      initializeFlutterwave({
        email: user.email,
        amount: fees.buyerTotal,
        reference,
        name: profile?.full_name || user.email,
        phone: profile?.whatsapp_number || '',
        onSuccess: async (response) => {
          // ── Show success screen IMMEDIATELY — don't wait for DB ──
          setPaid(reference);

          // ── Run all DB operations in background ──
          (async () => {
            // Update order to paid
            await supabase.from('orders')
              .update({ status: 'paid', updated_at: new Date().toISOString() })
              .eq('paystack_reference', reference);

            // Send in-app notifications + emails
            try {
              await Promise.all([
                supabase.from('notifications').insert({
                  user_id: user.id,
                  type: 'order',
                  title: '✅ Payment Successful!',
                  message: `Your payment for "${product.name}" (${formatNaira(fees.buyerTotal)}) is held securely. Once you confirm delivery, the seller gets paid the next business day.`,
                  link: '/orders',
                }),
                supabase.from('notifications').insert({
                  user_id: product.seller_id,
                  type: 'order',
                  title: '🛍️ New Sale! Money Coming Tomorrow',
                  message: `Someone just bought "${product.name}" for ${formatNaira(fees.price)}. Once the buyer confirms delivery, your money will be sent to your bank the next business day.`,
                  link: '/orders',
                }),
                // Email buyer
                supabase.functions.invoke('send-email', {
                  body: {
                    type: 'order_confirmed',
                    to: user.email,
                    data: {
                      name: user.user_metadata?.full_name || 'there',
                      product: product.name,
                      amount: formatNaira(fees.buyerTotal),
                      reference,
                    },
                  },
                }),
                // Push to seller
                seller && supabase.functions.invoke('send-push', {
                  body: {
                    user_id: product.seller_id,
                    notification: {
                      title: '🛍️ New Sale!',
                      body: `Someone just bought "${product.name}" for ${formatNaira(fees.price)}`,
                      url: '/orders',
                      type: 'new_sale',
                    },
                  },
                }),
                // Email seller
                seller?.email && supabase.functions.invoke('send-email', {
                  body: {
                    type: 'new_sale',
                    to: seller.email,
                    data: {
                      name: seller.full_name || 'Seller',
                      product: product.name,
                      amount: formatNaira(fees.sellerAmount),
                      buyer_name: user.user_metadata?.full_name || 'A buyer',
                    },
                  },
                }),
              ].filter(Boolean));
            } catch (notifErr) {
              console.warn('Notification error:', notifErr);
            }

            // Reduce quantity
            try {
              const { error: qtyErr } = await supabase.rpc('reduce_product_quantity', {
                product_id: product.id,
              });
            if (qtyErr) console.error('Quantity reduce error:', qtyErr.message);
            else console.log('Quantity reduced for product:', product.id);
          } catch (qtyErr) {
            console.error('Quantity error:', qtyErr);
          }
          })(); // end background async
        },
        onClose: () => {
          supabase.from('orders').delete().eq('id', order.id).eq('status', 'pending');
        },
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // ── SUCCESS SCREEN ──
  if (paid) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden my-4">
          <div className="bg-green-600 px-6 py-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-white">Payment Successful! 🎉</h3>
            <p className="text-green-100 text-sm mt-1">{formatNaira(fees.buyerTotal)} paid & secured</p>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 text-sm">Your money is safely held 🔒</p>
                  <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                    <strong>{formatNaira(fees.buyerTotal)}</strong> is held by CampusPlug.
                    Once you confirm delivery in <strong>My Orders</strong>, the seller receives their money the <strong>next business day</strong> via Flutterwave.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Contact Seller</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 font-black text-xs">
                    {(sellerProfile?.full_name || 'S').charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-bold text-gray-900 text-sm">{sellerProfile?.full_name || 'Seller'}</p>
              </div>

              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-green-600" />
                  <span className="font-bold text-gray-900 text-sm">
                    {sellerProfile?.whatsapp_number || product.whatsapp_number}
                  </span>
                </div>
                <button onClick={copyNumber} className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600">
                  <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <button onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors">
                <MessageCircle size={16} /> Chat on WhatsApp
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400">Reference: <span className="font-mono font-semibold">{paid}</span></p>
            </div>

            <button onClick={onClose}
              className="w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
              View in My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CHECKOUT SCREEN ──
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-green-600" />
            <h3 className="font-bold text-gray-900">Secure Checkout</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 flex gap-3 border-b border-gray-100">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {product.images?.[0]
              ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm line-clamp-2">{product.name}</p>
            <p className="text-gray-500 text-xs mt-0.5">{product.category}</p>
            <p className="text-green-600 font-black mt-1">{formatNaira(product.price)}</p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-2 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Payment Summary</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Item price</span>
              <span className="font-semibold">{formatNaira(fees.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service charge (3%)</span>
              <span className="font-semibold text-amber-600">+ {formatNaira(fees.serviceCharge)}</span>
            </div>
            <div className="border-t border-gray-100 pt-1.5 flex justify-between">
              <span className="font-bold text-gray-900">Total you pay</span>
              <span className="font-black text-green-700">{formatNaira(fees.buyerTotal)}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 bg-green-50 border-b border-green-100 space-y-2">
          <p className="text-xs font-bold text-green-800 uppercase tracking-wide">How it works</p>
          {[
            { step: '1', text: 'You pay securely via Flutterwave' },
            { step: '2', text: "Money is held — seller can't access it yet" },
            { step: '3', text: 'Contact seller on WhatsApp to arrange pickup' },
            { step: '4', text: 'Once you receive item, confirm in My Orders' },
            { step: '5', text: 'Seller gets paid next business day ✅' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <span className="text-xs text-green-800">{text}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <div className="p-5">
          {!isVerified ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-bold text-sm">Verification Required</p>
                  <p className="text-amber-700 text-xs mt-0.5">You need to verify your student ID before making purchases.</p>
                </div>
              </div>
              <a href="/profile" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                <Shield size={15} /> Verify My Student ID
              </a>
              <button onClick={onClose} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button onClick={handlePay} disabled={loading}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-md shadow-green-200">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
                {loading ? 'Processing...' : `Pay ${formatNaira(fees.buyerTotal)} Securely`}
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">Powered by Flutterwave · 256-bit SSL encrypted</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}