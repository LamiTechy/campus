// src/pages/AuthPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Eye, EyeOff, Loader2, Mail, CheckCircle, ShoppingBag, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';

// ── Verify email notice ──
function VerifyEmailScreen({ email }) {
  const { dark } = useTheme();
  const th = t(dark);
  return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(22,163,74,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Mail size={40} color="#16a34a" />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: th.text, marginBottom: 8 }}>Check your inbox!</h1>
        <p style={{ color: th.textSub, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          We sent a verification link to<br />
          <span style={{ fontWeight: 700, color: th.text }}>{email}</span>
        </p>
        <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 16, padding: 20, textAlign: 'left', marginBottom: 24 }}>
          {['Open the email from CampusPlug', 'Click "Confirm your email"', "You'll be redirected to log in"].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 2 ? 14 : 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: th.text }}>{text}</span>
            </div>
          ))}
        </div>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#16a34a', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          <CheckCircle size={16} /> Go to Login
        </Link>
      </div>
    </div>
  );
}

// ── Role selection screen ──
function RoleScreen({ onSelect, dark, th }) {
  return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 20px rgba(22,163,74,0.3)' }}>
            <Store size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px' }}>
            Campus<span style={{ color: '#4ade80' }}>Plug</span>
          </h1>
          <p style={{ color: th.textSub, fontSize: 14, marginTop: 6 }}>How do you want to use CampusPlug?</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Buyer */}
          <button onClick={() => onSelect('buyer')} style={{
            background: th.bgCard, border: `2px solid ${th.border}`, borderRadius: 20,
            padding: '22px 24px', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 18,
            transition: 'border-color 0.15s, background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = dark ? 'rgba(22,163,74,0.07)' : '#f0fdf4'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = th.border; e.currentTarget.style.background = th.bgCard; }}
          >
            <div style={{ width: 52, height: 52, background: dark ? 'rgba(22,163,74,0.12)' : '#dcfce7', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShoppingBag size={24} color="#16a34a" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, color: th.text, marginBottom: 4 }}>I want to Buy</p>
              <p style={{ fontSize: 13, color: th.textSub, lineHeight: 1.5 }}>Browse listings from sellers on your campus</p>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 20, color: th.textMuted }}>›</div>
          </button>

          {/* Seller */}
          <button onClick={() => onSelect('seller')} style={{
            background: th.bgCard, border: `2px solid ${th.border}`, borderRadius: 20,
            padding: '22px 24px', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 18,
            transition: 'border-color 0.15s, background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = dark ? 'rgba(22,163,74,0.07)' : '#f0fdf4'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = th.border; e.currentTarget.style.background = th.bgCard; }}
          >
            <div style={{ width: 52, height: 52, background: dark ? 'rgba(22,163,74,0.12)' : '#dcfce7', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Tag size={24} color="#16a34a" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, color: th.text, marginBottom: 4 }}>I want to Sell</p>
              <p style={{ fontSize: 13, color: th.textSub, lineHeight: 1.5 }}>List your items and reach campus buyers fast</p>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 20, color: th.textMuted }}>›</div>
          </button>

          {/* Both */}
          <button onClick={() => onSelect('both')} style={{
            background: th.bgCard, border: `2px solid ${th.border}`, borderRadius: 20,
            padding: '22px 24px', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 18,
            transition: 'border-color 0.15s, background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = dark ? 'rgba(22,163,74,0.07)' : '#f0fdf4'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = th.border; e.currentTarget.style.background = th.bgCard; }}
          >
            <div style={{ width: 52, height: 52, background: dark ? 'rgba(22,163,74,0.12)' : '#dcfce7', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24 }}>
              🔄
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, color: th.text, marginBottom: 4 }}>I want to do Both</p>
              <p style={{ fontSize: 13, color: th.textSub, lineHeight: 1.5 }}>Buy from others and also list your own items</p>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 20, color: th.textMuted }}>›</div>
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: th.textMuted, marginTop: 4 }}>
            You can always switch roles later in your profile
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: th.textSub, marginTop: 24 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

function AuthForm({ mode }) {
  const { signIn, signUp } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // null = role screen not yet shown
  const [form, setForm] = useState({ email: '', password: '', fullName: '', university: '', whatsapp: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyScreen, setVerifyScreen] = useState(false);

  const isLogin = mode === 'login';

  // Show role selection first for signup
  if (!isLogin && role === null) {
    return <RoleScreen onSelect={setRole} dark={dark} th={th} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const { error } = await signIn(form.email, form.password);
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email first. Check your inbox.');
        } else if (error.message.includes('Invalid login')) {
          setError('Incorrect email or password. Please try again.');
        } else {
          setError(error.message);
        }
        setLoading(false);
      } else {
        navigate('/');
      }
    } else {
      const { error } = await signUp(form.email, form.password, form.fullName, form.university, form.whatsapp, role);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setVerifyScreen(true);
      }
    }
  };

  if (verifyScreen) return <VerifyEmailScreen email={form.email} />;

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14, outline: 'none',
    border: `1px solid ${th.inputBorder}`, background: th.input, color: th.text,
    boxSizing: 'border-box',
  };
  const label = { display: 'block', fontSize: 13, fontWeight: 700, color: th.textSub, marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 20px rgba(22,163,74,0.3)' }}>
            <Store size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px' }}>
            Campus<span style={{ color: '#4ade80' }}>Plug</span>
          </h1>
          <p style={{ color: th.textSub, fontSize: 13, marginTop: 4 }}>
            {isLogin ? 'Welcome back 👋' : `Signing up as a ${role === 'seller' ? '🏷️ Seller' : role === 'both' ? '🔄 Buyer & Seller' : '🛍️ Buyer'}`}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: '28px 24px', boxShadow: th.shadow }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: th.text, marginBottom: 20 }}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>

          {/* Role badge for signup */}
          {!isLogin && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: dark ? 'rgba(22,163,74,0.08)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.2)' : '#bbf7d0'}`, borderRadius: 12, padding: '10px 14px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {role === 'seller' ? <Tag size={15} color="#16a34a" /> : role === 'both' ? <span style={{fontSize:13}}>🔄</span> : <ShoppingBag size={15} color="#16a34a" />}
                <span style={{ fontSize: 13, fontWeight: 700, color: th.text }}>Role: {role === 'seller' ? 'Seller' : role === 'both' ? 'Buyer & Seller' : 'Buyer'}</span>
              </div>
              <button onClick={() => setRole(null)} style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Change</button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!isLogin && (
              <div>
                <label style={label}>Full Name</label>
                <input style={inp} type="text" required value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
              </div>
            )}
            {!isLogin && (
              <div>
                <label style={label}>WhatsApp Number</label>
                <input style={inp} type="tel" required value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="e.g. 08012345678" />
              </div>
            )}
            {!isLogin && (
              <div>
                <label style={label}>University</label>
                <select style={{ ...inp, appearance: 'none' }} required value={form.university} onChange={e => setForm(p => ({ ...p, university: e.target.value }))}>
                  <option value="">Select your university...</option>
                  <option>University of Lagos (UNILAG)</option>
                  <option>University of Ibadan (UI)</option>
                  <option>Obafemi Awolowo University (OAU)</option>
                  <option>University of Nigeria Nsukka (UNN)</option>
                  <option>Ahmadu Bello University (ABU)</option>
                  <option>Lagos State University (LASU)</option>
                  <option>Covenant University</option>
                  <option>Babcock University</option>
                  <option>University of Benin (UNIBEN)</option>
                  <option>Rivers State University</option>
                  <option>Other</option>
                </select>
              </div>
            )}
            <div>
              <label style={label}>Email Address</label>
              <input style={inp} type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@university.edu.ng" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={label}>Password</label>
                {isLogin && <Link to="/forgot-password" style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>Forgot password?</Link>}
              </div>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inp, paddingRight: 44 }} type={showPw ? 'text' : 'password'} required minLength={6} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="At least 6 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: th.textMuted, display: 'flex' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="button" onClick={handleSubmit} disabled={loading} style={{
              width: '100%', padding: '14px', background: '#16a34a', color: '#fff',
              borderRadius: 12, fontWeight: 800, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
            }}>
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: th.textSub, marginTop: 20 }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/signup' : '/login'} style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() { return <AuthForm mode="login" />; }
export function SignUpPage() { return <AuthForm mode="signup" />; }

// ── Forgot Password ──
export function ForgotPasswordPage() {
  const { dark } = useTheme();
  const th = t(dark);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { supabase } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  const inp = { width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14, outline: 'none', border: `1px solid ${th.inputBorder}`, background: th.input, color: th.text, boxSizing: 'border-box' };

  if (sent) return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(22,163,74,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Mail size={40} color="#16a34a" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: th.text, marginBottom: 8 }}>Check your email!</h1>
        <p style={{ color: th.textSub, fontSize: 14, marginBottom: 24 }}>Reset link sent to <strong style={{ color: th.text }}>{email}</strong></p>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#16a34a', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Back to Login</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: '#16a34a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Store size={20} color="#fff" /></div>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: th.text }}>Campus<span style={{ color: '#4ade80' }}>Plug</span></span>
          </Link>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: th.text }}>Forgot password?</h1>
          <p style={{ color: th.textSub, fontSize: 13, marginTop: 4 }}>Enter your email and we'll send a reset link</p>
        </div>
        <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: '24px' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>Email Address</label>
            <input style={inp} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', fontSize: 13, marginBottom: 14 }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '13px', background: '#16a34a', color: '#fff', borderRadius: 12, fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
            Send Reset Link
          </button>
          <p style={{ textAlign: 'center', fontSize: 13, color: th.textSub, marginTop: 16 }}>
            Remember it? <Link to="/login" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password ──
export function ResetPasswordPage() {
  const { dark } = useTheme();
  const th = t(dark);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { supabase } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => navigate('/login'), 2500);
  };

  const inp = { width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14, outline: 'none', border: `1px solid ${th.inputBorder}`, background: th.input, color: th.text, boxSizing: 'border-box' };

  if (done) return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(22,163,74,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={40} color="#16a34a" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: th.text, marginBottom: 8 }}>Password updated! 🎉</h1>
        <p style={{ color: th.textSub, fontSize: 14 }}>Redirecting you to login...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: '#16a34a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Store size={20} color="#fff" /></div>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: th.text }}>Campus<span style={{ color: '#4ade80' }}>Plug</span></span>
          </Link>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: th.text }}>Set new password</h1>
          <p style={{ color: th.textSub, fontSize: 13, marginTop: 4 }}>Choose a strong password for your account</p>
        </div>
        <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: '24px' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input style={{ ...inp, paddingRight: 44 }} type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: th.textMuted, display: 'flex' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: th.textSub, marginBottom: 6 }}>Confirm Password</label>
            <input style={inp} type={showPw ? 'text' : 'password'} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" />
          </div>
          {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', fontSize: 13, marginBottom: 14 }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '13px', background: '#16a34a', color: '#fff', borderRadius: 12, fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}