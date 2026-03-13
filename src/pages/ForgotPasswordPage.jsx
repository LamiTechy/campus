// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Mail, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useTheme, t } from '../context/ThemeContext';

export default function ForgotPasswordPage() {
  const { dark } = useTheme();
  const th = t(dark);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/reset-password` });
    if (error) setError(error.message); else setSent(true);
    setLoading(false);
  };

  const inp = { width: '100%', padding: '13px 16px', borderRadius: 12, border: `1px solid ${th.inputBorder}`, background: th.input, color: th.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  if (sent) return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: 'rgba(22,163,74,0.15)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Mail size={36} color="#4ade80" /></div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: th.text, marginBottom: 8 }}>Check your email!</h1>
        <p style={{ color: th.textSub, fontSize: 14, lineHeight: 1.7, marginBottom: 4 }}>We sent a password reset link to</p>
        <p style={{ fontWeight: 800, color: th.text, marginBottom: 24 }}>{email}</p>
        <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: 20, marginBottom: 24 }}>
          {[['1','Open the email from CampusPlug'],['2','Click the "Reset my password" button'],['3','Set your new password']].map(([step, text]) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step}</div>
              <span style={{ fontSize: 14, color: th.textSub }}>{text}</span>
            </div>
          ))}
        </div>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#16a34a', color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}><CheckCircle size={16} /> Back to Login</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, background: '#16a34a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Store size={20} color="#fff" /></div>
            <span style={{ fontWeight: 900, fontSize: 18, color: th.text }}>Campus<span style={{ color: '#4ade80' }}>Plug</span></span>
          </Link>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: th.text, marginBottom: 6 }}>Forgot password?</h1>
          <p style={{ color: th.textSub, fontSize: 14 }}>Enter your email and we'll send a reset link</p>
        </div>
        <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: 24 }}>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ ...inp, marginBottom: 14 }} />
            {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 14 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />} Send Reset Link
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 13, color: th.textSub, marginTop: 16 }}>Remember it? <Link to="/login" style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}