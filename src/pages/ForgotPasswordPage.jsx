// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Mail, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  if (sent) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Mail size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Check your email!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          We sent a password reset link to
        </p>
        <p className="font-bold text-gray-800 mb-6">{email}</p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left space-y-4 mb-6">
          {[
            { step: '1', text: 'Open the email from CampusPlug' },
            { step: '2', text: 'Click the "Reset my password" button' },
            { step: '3', text: 'Set your new password' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <span className="text-sm text-gray-700">{text}</span>
            </div>
          ))}
        </div>
        <Link to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors">
          <CheckCircle size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <span className="font-black text-xl text-gray-900">Campus<span className="text-green-600">Plug</span></span>
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Forgot password?</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send a reset link</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm outline-none transition-all" />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Send Reset Link
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Remember it? <Link to="/login" className="text-green-600 font-semibold hover:underline">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}