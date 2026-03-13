// src/pages/ResetPasswordPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useTheme, t } from '../context/ThemeContext';

export default function ResetPasswordPage() {
  const { dark } = useTheme();
  const th = t(dark);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true); setTimeout(() => navigate('/login'), 2500);
  };

  const inp = { width: '100%', padding: '13px 16px', borderRadius: 12, border: `1px solid ${th.inputBorder}`, background: th.input, color: th.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  if (done) return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: 'rgba(22,163,74,0.15)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CheckCircle size={36} color="#4ade80" /></div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: th.text, marginBottom: 6 }}>Password updated! 🎉</h1>
        <p style={{ color: th.textSub, fontSize: 14 }}>Redirecting you to login...</p>
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
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: th.text, marginBottom: 6 }}>Set new password</h1>
          <p style={{ color: th.textSub, fontSize: 14 }}>Choose a strong password for your account</p>
        </div>
        <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: 24 }}>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>New Password</label>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" style={{ ...inp, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: th.textMuted }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>Confirm Password</label>
            <input type={showPw ? 'text' : 'password'} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" style={{ ...inp, marginBottom: 14 }} />
            {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 14 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />} Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}