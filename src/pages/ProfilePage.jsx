// src/pages/ProfilePage.jsx
import { useState, useRef } from 'react';
import { CheckCircle, Upload, Shield, User, Phone, GraduationCap, Loader2, AlertCircle, Clock, Building, CreditCard, RefreshCw } from 'lucide-react';
import { supabase, uploadFile } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { NIGERIAN_BANKS } from '../lib/paystack';

const UNIVERSITIES = [
  'University of Lagos (UNILAG)', 'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)', 'University of Nigeria Nsukka (UNN)',
  'Ahmadu Bello University (ABU)', 'Lagos State University (LASU)',
  'Covenant University', 'Babcock University',
  'University of Benin (UNIBEN)', 'Rivers State University', 'Other',
];

const VERIFICATION_STATUS = {
  unverified: { label: 'Not Verified', icon: AlertCircle, color: 'text-gray-500 bg-gray-100' },
  pending:    { label: 'Under Review', icon: Clock,         color: 'text-amber-600 bg-amber-50' },
  verified:   { label: 'Verified Student', icon: CheckCircle, color: 'text-green-700 bg-green-50' },
  rejected:   { label: 'Verification Failed', icon: AlertCircle, color: 'text-red-600 bg-red-50' },
};

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  // --- Form States ---
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    whatsapp_number: profile?.whatsapp_number || '',
    university: profile?.university || '',
  });

  const [bank, setBank] = useState({
    bank_name: profile?.bank_name || '',
    bank_code: '',
    account_number: profile?.account_number || '',
    account_name: profile?.account_name || '',
  });

  // --- Loading & Status States ---
  const [saving, setSaving] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false); // New State
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bankSuccess, setBankSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [bankError, setBankError] = useState('');

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setB = (key, val) => setBank(p => ({ ...p, [key]: val }));

  // --- Functions ---

  // Verify account number with Flutterwave via Edge Function
  const verifyAccountNumber = async () => {
    if (!bank.account_number || bank.account_number.length < 10) {
      setBankError('Enter a valid 10-digit account number');
      return;
    }
    if (!bank.bank_code) {
      setBankError('Select your bank first');
      return;
    }

    setVerifyingAccount(true);
    setBankError('');
    
    try {
      // Calls your Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('verify-bank-account', {
        body: {
          account_number: bank.account_number,
          account_bank: bank.bank_code,
        },
      });

      if (error || (data && data.status === 'error')) {
        throw new Error(data?.message || 'Could not verify account. Please check details.');
      }

      // If successful, data.data.account_name contains the name from the bank
      setB('account_name', data.data.account_name);
      setBankSuccess(true);
      setTimeout(() => setBankSuccess(false), 3000);
      
    } catch (err) {
      setBankError(err.message || 'Failed to verify account.');
      setB('account_name', ''); // Reset name on error
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error } = await supabase.from('profiles')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) setError(error.message);
    else { setSaveSuccess(true); await refreshProfile(); setTimeout(() => setSaveSuccess(false), 2500); }
    setSaving(false);
  };

  const handleSaveBankAccount = async (e) => {
    e.preventDefault();
    setBankError('');
    if (!bank.account_number || !bank.bank_name || !bank.account_name) {
      setBankError('Verify your account number before saving');
      return;
    }
    setSavingBank(true);
    try {
      const { error } = await supabase.from('profiles').update({
        bank_name: bank.bank_name,
        account_number: bank.account_number,
        account_name: bank.account_name,
        bank_verified: true,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);

      if (error) throw error;

      // Trigger subaccount creation
      try {
        await supabase.functions.invoke('create-flw-subaccount', {
          body: {
            user_id: user.id,
            account_bank: bank.bank_code,
            account_number: bank.account_number,
            business_name: bank.account_name,
            business_email: user.email,
          },
        });
      } catch (subErr) {
        console.warn('Subaccount logic failed:', subErr.message);
      }

      await refreshProfile();
      setBankSuccess(true);
      setTimeout(() => setBankSuccess(false), 3000);
    } catch (err) {
      setBankError(err.message || 'Failed to save bank account.');
    }
    setSavingBank(false);
  };

  const handleStudentIdUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/student_id.${ext}`;
      const url = await uploadFile('student-ids', path, file);
      await supabase.from('profiles').update({
        student_id_url: url,
        verification_status: 'pending',
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
      await refreshProfile();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setError('Upload failed. Please try again.');
    }
    setUploading(false);
  };

  const status = VERIFICATION_STATUS[profile?.verification_status || 'unverified'];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
              <span className="text-green-700 font-black text-2xl">
                {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">{profile?.full_name || 'Your Profile'}</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <div className={`inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                <StatusIcon size={12} /> {status.label}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <User size={16} className="text-green-600" />
            </div>
            <h2 className="font-bold text-gray-900">Personal Info</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Phone size={13} /> WhatsApp Number
              </label>
              <input value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)}
                placeholder="e.g. 08012345678"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <GraduationCap size={13} /> University
              </label>
              <select value={form.university} onChange={e => set('university', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none bg-white">
                <option value="">Select your university...</option>
                {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
            <button type="submit" disabled={saving}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saveSuccess ? '✓ Saved!' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Bank Account for Payouts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <CreditCard size={16} className="text-green-600" />
            </div>
            <h2 className="font-bold text-gray-900">Bank Account for Payouts</h2>
          </div>
          <p className="text-gray-500 text-sm mb-5 leading-relaxed">
            Add your bank account to receive payments.
          </p>

          {profile?.bank_verified && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">{profile.bank_name} · {profile.account_number}</p>
                <p className="text-green-600 text-xs">{profile.account_name}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveBankAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Building size={13} /> Bank Name
              </label>
              <select
                value={bank.bank_code}
                onChange={e => {
                  const selected = NIGERIAN_BANKS.find(b => b.code === e.target.value);
                  setB('bank_code', e.target.value);
                  setB('bank_name', selected?.name || '');
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none bg-white"
              >
                <option value="">Select your bank...</option>
                {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Number</label>
              <div className="flex flex-col gap-2">
                <input
                  value={bank.account_number}
                  onChange={e => setB('account_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit account number"
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 text-sm outline-none"
                />
                <button 
                  type="button" 
                  onClick={verifyAccountNumber}
                  disabled={verifyingAccount || !bank.bank_code || bank.account_number.length < 10}
                  className="w-full py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border border-green-200 disabled:opacity-50"
                >
                  {verifyingAccount ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {verifyingAccount ? 'Verifying...' : 'Verify Account Number'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Name</label>
              <input
                value={bank.account_name}
                readOnly // Prevents user from editing the name once verified
                placeholder="Verify account to see name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm outline-none"
              />
              <p className="text-xs text-gray-400 mt-1 italic">This name is automatically fetched from your bank record.</p>
            </div>

            {bankError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-start gap-2">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                {bankError}
              </div>
            )}

            <button type="submit" disabled={savingBank || !bank.account_name}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
              {savingBank && <Loader2 size={16} className="animate-spin" />}
              {bankSuccess ? '✓ Bank Account Saved!' : 'Save Bank Account'}
            </button>
          </form>
        </div>

        {/* KYC Verification */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-green-600" />
            </div>
            <h2 className="font-bold text-gray-900">Student Verification</h2>
          </div>
          <p className="text-gray-500 text-sm mb-5 leading-relaxed">
            Upload your student ID to get a Verified badge.
          </p>

          {profile?.verification_status === 'verified' ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <p className="font-semibold text-green-800">You're verified! 🎉</p>
              </div>
            </div>
          ) : profile?.verification_status === 'pending' ? (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Clock className="text-amber-600 flex-shrink-0" size={24} />
              <div>
                <p className="font-semibold text-amber-800">Under Review</p>
              </div>
            </div>
          ) : (
            <>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleStudentIdUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="w-full py-4 border-2 border-dashed border-green-300 rounded-xl flex flex-col items-center gap-2 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-60">
                {uploading
                  ? <><Loader2 size={24} className="animate-spin" /><span className="text-sm font-medium">Uploading...</span></>
                  : <><Upload size={24} /><span className="font-semibold text-sm">Upload Student ID</span></>
                }
              </button>
              {uploadSuccess && <p className="text-center text-green-600 text-sm font-medium mt-3">✓ Uploaded!</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}