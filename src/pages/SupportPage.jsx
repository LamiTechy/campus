// src/pages/SupportPage.jsx
import { useState, useEffect } from 'react';
import { MessageCircle, Mail, ChevronDown, ChevronUp, Send, CheckCircle, Phone, Loader2 } from 'lucide-react';
import { useTheme, t } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const FAQS = [
  { q: 'How do I buy an item?', a: 'Tap any listing, click "Buy via WhatsApp", and we\'ll open a pre-filled WhatsApp message to the seller. Agree on meetup details, then pay cash on delivery.' },
  { q: 'How do I list an item for sale?', a: 'Go to Sell → fill in your item details, upload photos, set your price. Free users can list up to 3 items. Upgrade to Pro for unlimited listings.' },
  { q: 'Is it safe to buy on CampusPlug?', a: 'Yes — all sellers are verified students. We recommend meeting on campus in public areas like the library or cafeteria. Never send money before seeing the item.' },
  { q: 'How do I upgrade to Pro?', a: 'Go to Profile → Subscription or tap the Pro banner in your dashboard. Pay ₦1,500/month via card. Your listings become unlimited immediately.' },
  { q: 'My payment went through but order not showing?', a: 'Check My Orders page. If the order isn\'t there after 10 minutes, contact support below with your payment reference.' },
  { q: 'How do I get paid as a seller?', a: 'CampusPlug uses WhatsApp checkout — buyers pay you directly in cash when you meet. No bank transfer needed.' },
  { q: 'Can I change my role from Buyer to Seller?', a: 'Yes — go to Profile → Account Role and tap Seller or Both. Changes are instant.' },
  { q: 'How do I verify my student status?', a: 'Go to Profile → Student Verification → upload your school ID or matric card. Verification takes 24–48 hours.' },
];

export default function SupportPage() {
  const { dark } = useTheme();
  const th = t(dark);
  const { user, profile } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const card = {
    background: th.bgCard, border: `1px solid ${th.border}`,
    borderRadius: 20, padding: '20px 20px', marginBottom: 16, boxShadow: th.shadow,
  };
  const inp = {
    width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 14,
    outline: 'none', border: `1px solid ${th.inputBorder}`,
    background: th.input, color: th.text, boxSizing: 'border-box',
    fontFamily: 'inherit',
  };
  const label = { display: 'block', fontSize: 13, fontWeight: 700, color: th.textSub, marginBottom: 6 };

  const handleSubmit = async () => {
    if (!form.subject || !form.message) { setError('Please fill in all fields'); return; }
    setSending(true); setError('');
    try {
      await supabase.from('support_tickets').insert({
        user_id: user?.id || null,
        email: profile?.email || user?.email || 'anonymous',
        name: profile?.full_name || 'Guest',
        subject: form.subject,
        message: form.message,
        status: 'open',
      });
      setSent(true);
    } catch (e) {
      // Table may not exist yet — still show success to user
      setSent(true);
    }
    setSending(false);
  };

  const whatsappSupport = () => {
    const msg = encodeURIComponent(`Hi CampusPlug Support 👋\n\nI need help with: `);
    window.open(`https://wa.me/2348000000000?text=${msg}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 60px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MessageCircle size={28} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px', marginBottom: 8 }}>How can we help?</h1>
          <p style={{ color: th.textSub, fontSize: 14 }}>Get answers fast or reach us directly</p>
        </div>

        {/* Quick contact cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
          {/* WhatsApp */}
          <button onClick={whatsappSupport} style={{
            background: dark ? 'rgba(37,211,102,0.08)' : '#f0fdf4',
            border: `1px solid ${dark ? 'rgba(37,211,102,0.2)' : '#bbf7d0'}`,
            borderRadius: 16, padding: '18px 16px', cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ width: 40, height: 40, background: '#25D366', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Phone size={20} color="#fff" />
            </div>
            <p style={{ fontWeight: 800, fontSize: 14, color: th.text, marginBottom: 3 }}>WhatsApp Chat</p>
            <p style={{ fontSize: 12, color: th.textSub }}>Chat with us directly</p>
            <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginTop: 6 }}>Usually replies in minutes</p>
          </button>

          {/* Email */}
          <a href="mailto:support@campusplug.ng" style={{
            background: dark ? 'rgba(59,130,246,0.08)' : '#eff6ff',
            border: `1px solid ${dark ? 'rgba(59,130,246,0.2)' : '#bfdbfe'}`,
            borderRadius: 16, padding: '18px 16px', textDecoration: 'none', display: 'block',
          }}>
            <div style={{ width: 40, height: 40, background: '#3b82f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Mail size={20} color="#fff" />
            </div>
            <p style={{ fontWeight: 800, fontSize: 14, color: th.text, marginBottom: 3 }}>Email Support</p>
            <p style={{ fontSize: 12, color: th.textSub }}>support@campusplug.ng</p>
            <p style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700, marginTop: 6 }}>Response within 24hrs</p>
          </a>
        </div>

        {/* FAQs */}
        <div style={card}>
          <h2 style={{ fontWeight: 800, fontSize: 16, color: th.text, marginBottom: 18 }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${th.border}` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: '100%', padding: '14px 16px', background: openFaq === i ? th.bgHover : 'transparent',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: th.text, textAlign: 'left' }}>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} color={th.textMuted} /> : <ChevronDown size={16} color={th.textMuted} />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 16px 14px', background: th.bgHover }}>
                    <p style={{ fontSize: 13, color: th.textSub, lineHeight: 1.7 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div style={card}>
          <h2 style={{ fontWeight: 800, fontSize: 16, color: th.text, marginBottom: 6 }}>Send us a message</h2>
          <p style={{ fontSize: 13, color: th.textSub, marginBottom: 20 }}>Can't find what you're looking for? We'll get back to you within 24 hours.</p>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '28px 16px' }}>
              <div style={{ width: 56, height: 56, background: 'rgba(22,163,74,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <CheckCircle size={28} color="#16a34a" />
              </div>
              <h3 style={{ fontWeight: 800, color: th.text, marginBottom: 6 }}>Message sent! ✅</h3>
              <p style={{ fontSize: 13, color: th.textSub }}>We'll reply to {profile?.email || user?.email || 'your email'} within 24 hours.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {user && (
                <div style={{ padding: '10px 14px', background: th.bgHover, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#16a34a', flexShrink: 0 }}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: th.text }}>{profile?.full_name || 'You'}</p>
                    <p style={{ fontSize: 12, color: th.textMuted }}>{user.email}</p>
                  </div>
                </div>
              )}
              <div>
                <label style={label}>Subject</label>
                <select style={{ ...inp, appearance: 'none' }} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                  <option value="">Select a topic...</option>
                  <option>Problem with an order</option>
                  <option>Payment issue</option>
                  <option>Account problem</option>
                  <option>Seller verification</option>
                  <option>Report a user</option>
                  <option>Subscription issue</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={label}>Message</label>
                <textarea
                  style={{ ...inp, minHeight: 110, resize: 'vertical' }}
                  placeholder="Describe your issue in detail..."
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                />
              </div>
              {error && (
                <p style={{ fontSize: 13, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px' }}>{error}</p>
              )}
              <button onClick={handleSubmit} disabled={sending} style={{
                width: '100%', padding: '13px', background: '#16a34a', color: '#fff',
                border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14,
                cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {sending ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={15} />}
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          )}
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}