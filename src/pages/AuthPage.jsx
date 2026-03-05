// src/pages/AuthPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Eye, EyeOff, Loader2, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Verify email notice shown after successful signup ──
function VerifyEmailScreen({ email }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Mail size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Check your inbox!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          We sent a verification link to <br />
          <span className="font-bold text-gray-800">{email}</span>
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left space-y-4 mb-6">
          {[
            { step: '1', text: 'Open the email from CampusPlug' },
            { step: '2', text: 'Click the "Confirm your email" button' },
            { step: '3', text: 'You\'ll be redirected to log in' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <span className="text-sm text-gray-700">{text}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Didn't get it? Check your spam folder or{' '}
          <Link to="/signup" className="text-green-600 font-semibold hover:underline">try again</Link>.
        </p>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors"
        >
          <CheckCircle size={16} /> Go to Login
        </Link>
      </div>
    </div>
  );
}

function AuthForm({ mode }) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', fullName: '', university: '', whatsapp: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyScreen, setVerifyScreen] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const { error } = await signIn(form.email, form.password);
      if (error) {
        // Friendly error messages
        if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email first. Check your inbox for the confirmation link.');
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
      const { error } = await signUp(form.email, form.password, form.fullName, form.university, form.whatsapp);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Show verify email screen instead of navigating
        setVerifyScreen(true);
      }
    }
  };

  if (verifyScreen) return <VerifyEmailScreen email={form.email} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Store size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900">
            Campus<span className="text-green-600">Plug</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isLogin ? 'Welcome back 👋' : 'Join thousands of Nigerian students buying & selling on campus'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm outline-none transition-all"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  value={form.whatsapp}
                  onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="e.g. 08012345678"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm outline-none transition-all"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">University</label>
                <select
                  required
                  value={form.university}
                  onChange={e => setForm(p => ({ ...p, university: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm outline-none transition-all bg-white"
                >
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
                  <option>Moshood Abiola Polytechnic (MAPOLY)</option>
                  <option>Rivers State University</option>
                  <option>Other</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@university.edu.ng"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-green-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/signup' : '/login'} className="text-green-600 font-semibold hover:underline">
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