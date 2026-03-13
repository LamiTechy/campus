// src/pages/SubscriptionPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, Star, ArrowRight, Crown, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useTheme, t } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
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
  const { dark } = useTheme();
  const th = t(dark);
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

  function handleSubscribe() {
    if (!user) return navigate('/login');
    setLoading(true);

    const run = () => {
      const ref = 'CP_SUB_' + user.id.slice(0, 8) + '_' + Date.now();
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: 150000,
        currency: 'NGN',
        ref,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        metadata: {
          user_id: user.id,
          plan: 'pro',
          custom_fields: [{ display_name: 'Plan', variable_name: 'plan', value: 'Pro Seller' }],
        },
        callback: function(response) {
          setLoading(true);
          supabase.functions.invoke('verify-subscription', {
            body: { reference: response.reference, user_id: user.id },
          }).then(() => refreshProfile())
            .then(() => fetchSubscription())
            .then(() => { setLoading(false); navigate('/dashboard'); })
            .catch(() => { setLoading(false); navigate('/dashboard'); });
        },
        onClose: function() { setLoading(false); },
      });
      handler.openIframe();
    };

    if (window.PaystackPop) {
      run();
    } else {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = run;
      script.onerror = () => {
        setLoading(false);
        alert('Failed to load payment. Check your connection.');
      };
      document.body.appendChild(script);
    }
  }

  const isPro = subscription?.status === 'active' || profile?.is_pro;
  const daysLeft = subscription?.expires_at
    ? Math.ceil((new Date(subscription.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div style={{ minHeight: "100vh", background: th.bg, padding: "40px 16px", transition: "background 0.3s" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(22,163,74,0.12)", color: "#4ade80", padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
            <Crown size={14} /> CampusPlug Pro
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: th.text, marginBottom: 8, letterSpacing: "-0.5px" }}>Sell More. Earn More.</h1>
          <p style={{ color: th.textSub, fontSize: 15 }}>Upgrade to Pro and get unlimited listings + verified badge</p>
        </div>

        {/* Active subscription banner */}
        {isPro && (
          <div style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.25)", borderRadius: 20, padding: "14px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <CheckCircle className="text-green-600 shrink-0" size={20} />
            <div>
              <p style={{ fontWeight: 800, color: th.text, marginBottom: 2 }}>You're on Pro! 🎉</p>
              {daysLeft !== null && (
                <p style={{ color: th.textSub, fontSize: 13 }}>{daysLeft} days remaining · renews automatically</p>
              )}
            </div>
          </div>
        )}

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{ background: th.bgCard, border: `2px solid ${plan.id === "pro" ? "#16a34a" : th.border}`, borderRadius: 24, padding: 24, position: "relative", boxShadow: plan.id === "pro" ? "0 8px 32px rgba(22,163,74,0.2)" : th.shadow }}
            >
              {plan.badge && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#16a34a", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 100 }}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  {plan.id === 'pro' ? <Crown size={18} className="text-green-600" /> : <Zap size={18} className="text-gray-400" />}
                  <span style={{ fontWeight: 900, color: th.text, fontSize: 17 }}>{plan.name}</span>
                </div>
                <div className="flex items-end gap-1">
                  <span style={{ fontSize: "1.8rem", fontWeight: 900, color: th.text }}>
                    {plan.price === 0 ? 'Free' : '₦' + plan.price.toLocaleString()}
                  </span>
                  {plan.price > 0 && <span style={{ color: th.textMuted, fontSize: 13, marginBottom: 4 }}>/month</span>}
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: th.text, marginBottom: 8 }}>
                    <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.limits.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: th.textMuted, marginBottom: 8 }}>
                    <Lock size={15} className="mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.id === 'free' ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{ width: "100%", padding: "12px", borderRadius: 14, border: `1px solid ${th.border}`, background: "transparent", color: th.textSub, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                >
                  Continue Free
                </button>
              ) : isPro ? (
                <button style={{ width: "100%", padding: "12px", borderRadius: 14, background: "rgba(22,163,74,0.12)", color: "#4ade80", fontWeight: 800, fontSize: 14, border: "none", cursor: "default" }}>
                  ✅ Current Plan
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  style={{ width: "100%", padding: "12px", borderRadius: 14, background: "#16a34a", color: "#fff", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
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
        <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 24, padding: 24 }}>
          <h3 style={{ fontWeight: 900, color: th.text, marginBottom: 16 }}>Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              { q: 'How do payments work?', a: 'Sellers and buyers handle payments directly between themselves via WhatsApp, cash or bank transfer. CampusPlug only charges the monthly subscription.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Your Pro plan stays active until the end of the month. After that it reverts to the free plan automatically.' },
              { q: 'What is the verified badge?', a: 'A green ✅ badge on your profile and listings showing buyers you are a trusted Pro seller on CampusPlug.' },
              { q: 'Is my payment secure?', a: 'Yes. Payments are processed by Paystack, a trusted Nigerian payment provider used by thousands of businesses.' },
            ].map((faq, i) => (
              <div key={i}>
                <p style={{ fontWeight: 800, color: th.text, fontSize: 13, marginBottom: 4 }}>{faq.q}</p>
                <p style={{ color: th.textSub, fontSize: 13, lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}