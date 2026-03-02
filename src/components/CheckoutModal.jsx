// src/components/CheckoutModal.jsx
import { useState } from 'react';
import { X, Shield, Lock, AlertCircle, Loader2, CheckCircle, MessageCircle, Phone, Mail, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { calculateFees, formatNaira, initializePaystack } from '../lib/paystack';

// ── Send notification emails via Supabase Edge Function ──
async function sendPaymentEmails({ buyerEmail, buyerName, sellerEmail, sellerName, productName, amount, sellerPhone, buyerPhone, reference }) {
  try {
    await supabase.functions.invoke('send-payment-emails', {
      body: { buyerEmail, buyerName, sellerEmail, sellerName, productName, amount, sellerPhone, buyerPhone, reference },
    });
  } catch (err) {
    // Non-blocking — don't fail the whole payment if email fails
    console.warn('Email notification failed:', err.message);
  }
}

export default function CheckoutModal({ product, onClose }) {
  const { user, profile } = useAuth();
  const isVerified = profile?.is_verified || false;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sellerProfile, setSellerProfile] = useState(null);

  const fees = calculateFees(product.price);

  // Format WhatsApp number
  const formatWhatsApp = (num) => num?.replace(/\D/g, '').replace(/^0/, '234');

  const handleWhatsApp = () => {
    const number = formatWhatsApp(product.whatsapp_number);
    const msg = encodeURIComponent(
      `Hi ${sellerProfile?.full_name || ''}! 👋\n\nI just paid *${formatNaira(fees.price)}* for your *${product.name}* on CampusPlug.\n\nPayment Reference: *${paid}*\n\nLet's arrange pickup/delivery. When are you free?`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(product.whatsapp_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setLoading(true);
    setError('');

    try {
      const reference = `CP_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      // Fetch seller profile for email + phone
      const { data: seller } = await supabase
        .from('profiles')
        .select('full_name, email, whatsapp_number')
        .eq('id', product.seller_id)
        .single();

      setSellerProfile(seller);

      // Create pending order
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        product_id: product.id,
        buyer_id: user.id,
        seller_id: product.seller_id,
        amount: fees.price,
        seller_amount: fees.sellerAmount,
        platform_fee: fees.platformFee,
        paystack_reference: reference,
        paystack_subaccount: product.profiles?.paystack_subaccount_code,
        status: 'pending',
        auto_release_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      }).select().single();

      if (orderError) throw orderError;

      setLoading(false);

      // Open Paystack
      initializePaystack({
        email: user.email,
        amount: fees.buyerTotal, // buyer pays item + service charge
        reference,
        subaccountCode: product.profiles?.paystack_subaccount_code,
        onSuccess: async (response) => {
          // Update order to paid
          await supabase.from('orders')
            .update({ status: 'paid', updated_at: new Date().toISOString() })
            .eq('paystack_reference', response.reference);

          // Send email notifications to both buyer and seller
          await sendPaymentEmails({
            buyerEmail: user.email,
            buyerName: profile?.full_name || 'Buyer',
            sellerEmail: seller?.email,
            sellerName: seller?.full_name || 'Seller',
            productName: product.name,
            amount: formatNaira(fees.price),
            sellerPhone: seller?.whatsapp_number || product.whatsapp_number,
            buyerPhone: profile?.whatsapp_number || 'Not provided',
            reference: response.reference,
          });

          setPaid(response.reference);
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">

          {/* Success header */}
          <div className="bg-green-600 px-6 py-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-white">Payment Successful! 🎉</h3>
            <p className="text-green-100 text-sm mt-1">{formatNaira(fees.price)} paid & secured</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Money held notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 text-sm">Your money is safely held 🔒</p>
                  <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                    <strong>{formatNaira(fees.buyerTotal)}</strong> is being held by CampusPlug.
                    The seller will NOT receive it until you tap <strong>"I Received This Item"</strong> in My Orders after getting your item.
                  </p>
                </div>
              </div>
            </div>

            {/* Seller contact — Option 1: Show number clearly */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Contact Seller to Arrange Pickup</p>

              {/* Seller name */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 font-black text-xs">
                    {(sellerProfile?.full_name || product.profiles?.full_name || 'S').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{sellerProfile?.full_name || product.profiles?.full_name || 'Seller'}</p>
                  <p className="text-gray-500 text-xs">{product.university || 'Campus Seller'}</p>
                </div>
              </div>

              {/* Phone number displayed clearly */}
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-green-600" />
                  <span className="font-bold text-gray-900 text-sm">{product.whatsapp_number}</span>
                </div>
                <button onClick={copyNumber}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition-colors">
                  <Copy size={12} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* WhatsApp button — Option 1 + WhatsApp */}
              <button onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors">
                <MessageCircle size={16} />
                Chat on WhatsApp
              </button>
            </div>

            {/* Email sent notice — Option 3 */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail size={13} className="text-gray-400 flex-shrink-0" />
              <span>Confirmation emails sent to you and the seller with each other's contact details.</span>
            </div>

            {/* Reference */}
            <div className="text-center">
              <p className="text-xs text-gray-400">Reference: <span className="font-mono font-semibold">{paid}</span></p>
            </div>

            {/* Go to orders */}
            <button onClick={onClose}
              className="w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              View in My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CHECKOUT SCREEN ──
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-green-600" />
            <h3 className="font-bold text-gray-900">Secure Checkout</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Product summary */}
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

        {/* Fee breakdown */}
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

        {/* How it works steps */}
        <div className="px-5 py-4 bg-green-50 border-b border-green-100 space-y-2">
          <p className="text-xs font-bold text-green-800 uppercase tracking-wide">How it works</p>
          {[
            { step: '1', text: 'You pay securely via Paystack' },
            { step: '2', text: "Money is held — seller can't access it yet" },
            { step: '3', text: 'You contact seller on WhatsApp to arrange pickup' },
            { step: '4', text: 'Once you receive item, confirm in My Orders' },
            { step: '5', text: 'Money is released to seller ✅' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <span className="text-xs text-green-800">{text}</span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* Pay button */}
        <div className="p-5">
          <button onClick={handlePay} disabled={loading}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-md shadow-green-200">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
            {loading ? 'Processing...' : `Pay ${formatNaira(fees.buyerTotal)} Securely`}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">Powered by Paystack · 256-bit SSL encrypted</p>
        </div>
      </div>
    </div>
  );
}