// src/pages/ProfilePage.jsx
import { useState, useRef } from 'react';
import { CheckCircle, Upload, Shield, User, Phone, GraduationCap, Loader2, AlertCircle, Clock, Building, CreditCard, Crown } from 'lucide-react';
import { supabase, uploadFile } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';
import { NIGERIAN_BANKS } from '../lib/flutterwave';
import ThemeToggle from '../components/ThemeToggle';

const VERIFICATION_STATUS = {
  unverified: { label: 'Not Verified',       icon: AlertCircle, bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
  pending:    { label: 'Under Review',        icon: Clock,       bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
  verified:   { label: 'Verified Student',    icon: CheckCircle, bg: 'rgba(22,163,74,0.15)',   color: '#4ade80' },
  rejected:   { label: 'Verification Failed', icon: AlertCircle, bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
};

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ whatsapp_number: profile?.whatsapp_number || '' });
  const [bank, setBank] = useState({ bank_name: profile?.bank_name || '', bank_code: '', account_number: profile?.account_number || '', account_name: profile?.account_name || '' });
  const [saving, setSaving] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bankSuccess, setBankSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [bankError, setBankError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const setB = (key, val) => setBank(p => ({ ...p, [key]: val }));

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    const { error } = await supabase.from('profiles').update({ whatsapp_number: form.whatsapp_number, updated_at: new Date().toISOString() }).eq('id', user.id);
    if (error) setError(error.message);
    else { setSaveSuccess(true); await refreshProfile(); setTimeout(() => setSaveSuccess(false), 2500); }
    setSaving(false);
  };

  const handleSaveBankAccount = async (e) => {
    e.preventDefault(); setBankError('');
    if (!bank.account_number || !bank.bank_name || !bank.account_name) { setBankError('Please fill in all bank account fields'); return; }
    setSavingBank(true);
    try {
      const { error } = await supabase.from('profiles').update({ bank_name: bank.bank_name, bank_code: bank.bank_code, account_number: bank.account_number, account_name: bank.account_name, bank_verified: true, updated_at: new Date().toISOString() }).eq('id', user.id);
      if (error) throw error;
      await refreshProfile(); setBankSuccess(true); setTimeout(() => setBankSuccess(false), 3000);
    } catch (err) { setBankError(err.message || 'Failed to save bank account.'); }
    setSavingBank(false);
  };

  const handleStudentIdUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setError('');
    try {
      const ext = file.name.split('.').pop();
      const url = await uploadFile('student-ids', `${user.id}/student_id.${ext}`, file);
      await supabase.from('profiles').update({ student_id_url: url, verification_status: 'pending', updated_at: new Date().toISOString() }).eq('id', user.id);
      await refreshProfile(); setUploadSuccess(true); setTimeout(() => setUploadSuccess(false), 3000);
    } catch { setError('Upload failed. Please try again.'); }
    setUploading(false);
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Cancel your Pro subscription?')) return;
    setCancelling(true);
    await supabase.from('subscriptions').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('user_id', user.id);
    await supabase.from('profiles').update({ is_pro: false }).eq('id', user.id);
    await refreshProfile(); setCancelSuccess(true); setCancelling(false);
  };

  const vstatus = VERIFICATION_STATUS[profile?.verification_status || 'unverified'];
  const StatusIcon = vstatus.icon;

  // Shared styles
  const card = { background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: th.shadow };
  const inp = { width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${th.inputBorder}`, background: th.input, color: th.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
  const label = { display: 'block', fontSize: 13, fontWeight: 700, color: th.textSub, marginBottom: 6 };
  const btn = { width: '100%', padding: '13px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 };
  const sectionHead = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{ width: 34, height: 34, background: th.greenLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{ fontWeight: 800, color: th.text, fontSize: 15 }}>{title}</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header card */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: th.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${th.border}` }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: th.greenText }}>{profile?.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: th.text, marginBottom: 2 }}>{profile?.full_name || 'Your Profile'}</h1>
              <p style={{ color: th.textSub, fontSize: 13, marginBottom: 6 }}>{user?.email}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: vstatus.bg, color: vstatus.color }}>
                  <StatusIcon size={11} /> {vstatus.label}
                </span>
                {profile?.is_pro ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: 'rgba(234,179,8,0.15)', color: '#ca8a04' }}>
                    <Crown size={11} /> Pro Seller
                  </span>
                ) : (
                  <a href="/subscription" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: th.greenLight, color: th.greenText, textDecoration: 'none' }}>
                    <Crown size={11} /> Upgrade to Pro
                  </a>
                )}
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Personal Info */}
        <div style={card}>
          {sectionHead(<User size={16} color={th.greenText} />, 'Personal Info')}
          <div style={{ marginBottom: 14 }}>
            <label style={label}>Full Name</label>
            <div style={{ ...inp, background: th.bgHover, color: th.textSub }}>{profile?.full_name || '—'}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={label}>University</label>
            <div style={{ ...inp, background: th.bgHover, color: th.textSub }}>{profile?.university || '—'}</div>
          </div>
          <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: '#60a5fa' }}>Name and university are set at signup and cannot be changed. Contact support if you need updates.</p>
          </div>
          <form onSubmit={handleSaveProfile}>
            <label style={label}>WhatsApp Number</label>
            <input value={form.whatsapp_number} onChange={e => setForm(p => ({ ...p, whatsapp_number: e.target.value }))} placeholder="e.g. 08012345678" style={{ ...inp, marginBottom: 12 }} />
            {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <button type="submit" disabled={saving} style={btn}>
              {saving && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
              {saveSuccess ? '✓ Saved!' : 'Update WhatsApp'}
            </button>
          </form>
        </div>

        {/* Bank Account */}
        <div style={card}>
          {sectionHead(<CreditCard size={16} color={th.greenText} />, 'Bank Account for Payouts')}
          <p style={{ color: th.textSub, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>Add your bank account to receive payments. Works with all Nigerian banks including OPay, Moniepoint, Kuda and PalmPay.</p>
          {profile?.bank_verified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 12, marginBottom: 16 }}>
              <CheckCircle size={18} color="#4ade80" />
              <div>
                <p style={{ fontWeight: 700, color: th.text, fontSize: 13 }}>{profile.bank_name} · {profile.account_number}</p>
                <p style={{ color: th.textSub, fontSize: 12 }}>{profile.account_name}</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSaveBankAccount}>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Bank Name</label>
              <select value={bank.bank_code} onChange={e => { const s = NIGERIAN_BANKS.find(b => b.code === e.target.value); setB('bank_code', s?.transferCode || e.target.value); setB('bank_name', s?.name || ''); setB('account_name', ''); setBankError(''); }} style={{ ...inp, cursor: 'pointer' }}>
                <option value="">Select your bank...</option>
                {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Account Number</label>
              <input value={bank.account_number} onChange={e => setB('account_number', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} placeholder="10-digit account number" maxLength={10} style={inp} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Account Name</label>
              <input value={bank.account_name} onChange={e => setB('account_name', e.target.value)} placeholder="Exactly as on your bank account" style={inp} />
              <p style={{ fontSize: 12, color: th.textMuted, marginTop: 5 }}>⚠️ Enter your name exactly as it appears on your bank account.</p>
            </div>
            {bankError && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 12 }}>{bankError}</div>}
            <button type="submit" disabled={savingBank} style={btn}>
              {savingBank && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
              {bankSuccess ? '✓ Bank Account Saved!' : 'Save Bank Account'}
            </button>
          </form>
        </div>

        {/* KYC */}
        <div style={card}>
          {sectionHead(<Shield size={16} color={th.greenText} />, 'Student Verification')}
          <p style={{ color: th.textSub, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>Upload your student ID to get a <strong style={{ color: th.text }}>Verified ✓</strong> badge on all your listings.</p>
          {profile?.verification_status === 'verified' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 14 }}>
              <CheckCircle size={22} color="#4ade80" />
              <div><p style={{ fontWeight: 700, color: th.text, fontSize: 14 }}>You're verified! 🎉</p><p style={{ color: th.textSub, fontSize: 12 }}>Verified badge is showing on all your listings.</p></div>
            </div>
          ) : profile?.verification_status === 'pending' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14 }}>
              <Clock size={22} color="#fbbf24" />
              <div><p style={{ fontWeight: 700, color: th.text, fontSize: 14 }}>Under Review</p><p style={{ color: th.textSub, fontSize: 12 }}>Your student ID is being reviewed. Usually 24-48 hours.</p></div>
            </div>
          ) : (
            <>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleStudentIdUpload} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
                width: '100%', padding: '24px', border: `2px dashed ${dark ? 'rgba(22,163,74,0.3)' : '#bbf7d0'}`, borderRadius: 14, background: 'transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', color: th.greenText,
              }}>
                {uploading ? <><Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Uploading...</span></>
                  : <><Upload size={24} /><span style={{ fontWeight: 700, fontSize: 14 }}>Upload Student ID</span><span style={{ fontSize: 12, color: th.textMuted }}>JPG, PNG or PDF · Max 10MB</span></>}
              </button>
              {uploadSuccess && <p style={{ textAlign: 'center', color: '#4ade80', fontSize: 13, fontWeight: 600, marginTop: 12 }}>✓ Uploaded! Your ID is under review.</p>}
              {profile?.verification_status === 'rejected' && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#f87171', fontSize: 13 }}>
                  Your previous submission was rejected. Please upload a clearer photo of your ID.
                </div>
              )}
            </>
          )}
        </div>

        {/* Pro Subscription */}
        {profile?.is_pro && (
          <div style={card}>
            {sectionHead(<Crown size={16} color="#ca8a04" />, 'Pro Subscription')}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 14, marginBottom: 16 }}>
              <div>
                <p style={{ fontWeight: 700, color: th.text, fontSize: 14 }}>Pro Seller · Active ✅</p>
                <p style={{ color: th.textSub, fontSize: 12, marginTop: 2 }}>Unlimited listings + verified badge</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#ca8a04', background: 'rgba(234,179,8,0.15)', padding: '4px 10px', borderRadius: 8 }}>₦1,500/mo</span>
            </div>
            {cancelSuccess ? (
              <div style={{ padding: '12px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 12, color: '#4ade80', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                Subscription cancelled. Pro features active until end of period.
              </div>
            ) : (
              <button onClick={handleCancelSubscription} disabled={cancelling} style={{ width: '100%', padding: '13px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#f87171', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}