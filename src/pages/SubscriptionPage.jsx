// src/pages/SubscriptionPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, Star, ArrowRight, Crown, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    color: 'border-gray-200',
    badge: null,
    features: [
      'List up to 3 products',
      'Basic seller profile',
      'WhatsApp contact button',
      'Campus marketplace visibility',
    ],
    limits: [
      'No verified badge',
      'No featured listings',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Seller',
    price: 1500,
    color: 'border-green-500',
    badge: 'Most Popular',
    features: [
      'Unlimited product listings',
      '✅ Verified seller badge',
      'Featured on homepage',
      'Priority in search results',
      'Sales analytics dashboard',
      'WhatsApp contact button',
      'Full campus marketplace visibility',
    ],
    limits: [],
  },
];

export default function SubscriptionPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (user) fetchSubscription();
  }, [user]);

  async function fetchSubscription() {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    setSubscription(data);
  }

  function loadPaystack(callback) {
    if (window.PaystackPop) return callback();
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = callback;
    document.body.appendChild(script);
  }

  function handleSubscribe() {
    if (!user) return navigate('/login');
    setLoading(true);

    loadPaystack(() => {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: 150000,
        currency: 'NGN',
        ref: 'CP_SUB_' + user.id.slice(0, 8) + '_' + Date.now(),
        metadata: {
          user_id: user.id,
          plan: 'pro',
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: 'Pro Seller' },
          ],
        },
        callback: function(response) {
          setLoading(true);
          supabase.functions.invoke('verify-subscription', {
            body: { reference: response.reference, user_id: user.id },
          }).then(() => {
            return refreshProfile();
          }).then(() => {
            return fetchSubscription();
          }).then(() => {
            setLoading(false);
            navigate('/dashboard');
          });
        },
        onClose: function() { setLoading(false); },
      });
      handler.openIframe();
    });
  }

  const isPro = subscription?.status === 'active' || profile?.is_pro;
  const daysLeft = subscription?.expires_at
    ? Math.ceil((new Date(subscription.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Crown size={14} /> CampusPlug Pro
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Sell More. Earn More.</h1>
          <p className="text-gray-500 text-base">Upgrade to Pro and get unlimited listings + verified badge</p>
        </div>

        {/* Active subscription banner */}
        {isPro && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="text-green-600 shrink-0" size={20} />
            <div>
              <p className="font-bold text-green-800">You're on Pro! 🎉</p>
              {daysLeft !== null && (
                <p className="text-green-700 text-sm">{daysLeft} days remaining · renews automatically</p>
              )}
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 ${plan.color} p-6 relative ${plan.id === 'pro' ? 'shadow-lg' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  {plan.id === 'pro' ? <Crown size={18} className="text-green-600" /> : <Zap size={18} className="text-gray-400" />}
                  <span className="font-black text-gray-900 text-lg">{plan.name}</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-gray-900">
                    {plan.price === 0 ? 'Free' : '₦' + plan.price.toLocaleString()}
                  </span>
                  {plan.price > 0 && <span className="text-gray-400 text-sm mb-1">/month</span>}
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.limits.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <Lock size={15} className="mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.id === 'free' ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
                >
                  Continue Free
                </button>
              ) : isPro ? (
                <button className="w-full py-3 rounded-xl bg-green-50 text-green-700 font-bold text-sm cursor-default">
                  ✅ Current Plan
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-60"
                >
                  {loading ? 'Processing...' : (
                    <><Star size={15} /> Upgrade to Pro <ArrowRight size={15} /></>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-black text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              { q: 'How do payments work?', a: 'Sellers and buyers handle payments directly between themselves via WhatsApp, cash or bank transfer. CampusPlug only charges the monthly subscription.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Your Pro plan stays active until the end of the month. After that it reverts to the free plan automatically.' },
              { q: 'What is the verified badge?', a: 'A green ✅ badge on your profile and listings showing buyers you are a trusted Pro seller on CampusPlug.' },
              { q: 'Is my payment secure?', a: 'Yes. Payments are processed by Paystack, a trusted Nigerian payment provider used by thousands of businesses.' },
            ].map((faq, i) => (
              <div key={i}>
                <p className="font-semibold text-gray-800 text-sm">{faq.q}</p>
                <p className="text-gray-500 text-sm mt-0.5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}