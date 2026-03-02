// src/pages/AdminPage.jsx
// Access at /admin-kyc-panel-9x2z  (keep this URL secret)
import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock, Eye, LogIn, Loader2, AlertTriangle, ExternalLink, Users, FileCheck, FileX } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ── Change these credentials to something only you know ──
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@campusplug.ng';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'changeme123!';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',  color: 'bg-amber-100 text-amber-700',  icon: Clock },
  verified:   { label: 'Verified', color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  rejected:   { label: 'Rejected', color: 'bg-red-100 text-red-700',      icon: XCircle },
  unverified: { label: 'None',     color: 'bg-gray-100 text-gray-500',    icon: Shield },
};

// ── Admin Login Screen ──
function AdminLogin({ onLogin }) {
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (creds.email !== ADMIN_EMAIL || creds.password !== ADMIN_PASSWORD) {
      setError('Invalid admin credentials.');
      setLoading(false);
      return;
    }
    // Also sign in to Supabase so we can make authenticated queries
    const { error } = await supabase.auth.signInWithPassword({
      email: creds.email,
      password: creds.password,
    });
    if (error) setError('Supabase auth failed: ' + error.message);
    else onLogin();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/50">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">CampusPlug KYC Management</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Admin Email</label>
              <input
                type="email" required
                value={creds.email}
                onChange={e => setCreds(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500 transition-colors"
                placeholder="admin@campusplug.ng"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Password</label>
              <input
                type="password" required
                value={creds.password}
                onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-xl px-3 py-2">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Access Admin Panel
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-600 mt-4">🔒 Restricted access. Authorised personnel only.</p>
      </div>
    </div>
  );
}

// ── KYC Card ──
function KYCCard({ profile, onAction }) {
  const [loading, setLoading] = useState(null);
  const [imgOpen, setImgOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState(null);
  const [actionDone, setActionDone] = useState(null);
  const [localStatus, setLocalStatus] = useState(profile.verification_status);
  const status = STATUS_CONFIG[localStatus] || STATUS_CONFIG.unverified;
  const StatusIcon = status.icon;

  // Generate signed URL for private bucket image
  useEffect(() => {
    if (!profile.student_id_url) return;
    async function getSignedUrl() {
      try {
        // Extract just the file path after the bucket name
        // URL format: .../storage/v1/object/public/student-ids/USER_ID/filename.ext
        // OR: .../storage/v1/object/sign/student-ids/USER_ID/filename.ext
        const url = profile.student_id_url;
        
        // Try to extract path from URL
        let filePath = null;
        const patterns = [
          /storage\/v1\/object\/(?:public|sign|authenticated)\/student-ids\/(.+?)(?:\?|$)/,
          /student-ids\/(.+?)(?:\?|$)/,
        ];
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) { filePath = decodeURIComponent(match[1]); break; }
        }

        if (!filePath) {
          console.warn('Could not extract file path from:', url);
          setSignedUrl(url);
          return;
        }

        console.log('Generating signed URL for path:', filePath);
        const { data, error } = await supabase.storage
          .from('student-ids')
          .createSignedUrl(filePath, 3600);
        
        if (error) {
          console.error('Signed URL error:', error);
          setSignedUrl(url); // fallback
        } else {
          console.log('Signed URL generated:', data.signedUrl);
          setSignedUrl(data.signedUrl);
        }
      } catch (err) {
        console.error('Error generating signed URL:', err);
        setSignedUrl(profile.student_id_url);
      }
    }
    getSignedUrl();
  }, [profile.student_id_url]);

  const handleAction = async (action) => {
    setLoading(action);
    const updates = action === 'verify'
      ? { is_verified: true,  verification_status: 'verified' }
      : { is_verified: false, verification_status: 'rejected' };

    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    if (!error) {
      const newStatus = action === 'verify' ? 'verified' : 'rejected';
      setLocalStatus(newStatus);
      onAction(profile.id, action);
      setActionDone(action);
      setTimeout(() => setActionDone(null), 1500);

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: action === 'verify' ? 'success' : 'warning',
        title: action === 'verify' ? '🎉 Student ID Verified!' : 'Verification Update',
        message: action === 'verify'
          ? 'Your student ID has been verified. You can now buy and sell on CampusPlug!'
          : 'Your student ID was not approved. Please upload a clearer photo and try again.',
        link: '/profile',
      });
    } else {
      alert('Update failed: ' + error.message);
    }
    setLoading(null);
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Student ID Image */}
      <div
        className="relative h-48 bg-gray-800 cursor-pointer group overflow-hidden"
        onClick={() => profile.student_id_url && setImgOpen(true)}
      >
        {profile.student_id_url ? (
          <>
            {signedUrl && profile.student_id_url.toLowerCase().includes('.pdf') ? (
              // PDF preview
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-800">
                <div className="w-14 h-14 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center">
                  <span className="text-red-400 font-black text-lg">PDF</span>
                </div>
                <p className="text-gray-400 text-xs">Student ID Document</p>
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  <ExternalLink size={12} /> Open PDF
                </a>
              </div>
            ) : signedUrl ? (
              // Image preview
              <>
                <img
                  src={signedUrl}
                  alt="Student ID"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Eye size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </>
            ) : (
              // Loading
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 size={28} className="text-green-500 animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-600">
            <FileX size={36} />
            <span className="text-xs">No ID uploaded</span>
          </div>
        )}
        <div className={`absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
          <StatusIcon size={11} />
          {status.label}
        </div>
      </div>

      {/* Success overlay */}
      {actionDone && (
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl ${
          actionDone === 'verify' ? 'bg-green-900/95' : 'bg-red-900/95'
        }`}>
          {actionDone === 'verify'
            ? <CheckCircle size={40} className="text-green-400 mb-2" />
            : <XCircle size={40} className="text-red-400 mb-2" />
          }
          <p className="text-white font-black text-sm">
            {actionDone === 'verify' ? 'Student Verified!' : 'Application Rejected'}
          </p>
          <p className="text-gray-300 text-xs mt-1">Profile updated successfully</p>
        </div>
      )}

    {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-bold text-white text-sm">{profile.full_name || 'Unknown'}</h3>
            <p className="text-gray-500 text-xs mt-0.5">{profile.email}</p>
          </div>
        </div>
        {profile.university && (
          <p className="text-gray-600 text-xs mb-1">🎓 {profile.university}</p>
        )}
        {profile.whatsapp_number && (
          <p className="text-gray-600 text-xs mb-3">📱 {profile.whatsapp_number}</p>
        )}
        <p className="text-gray-700 text-xs mb-4">
          Submitted: {new Date(profile.updated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>

        {/* Actions — always show if ID uploaded so admin can change status anytime */}
        {profile.student_id_url ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('verify')}
                disabled={!!loading}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${
                  localStatus === 'verified'
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-green-600/20 hover:bg-green-600 hover:text-white text-green-400 border border-green-700'
                }`}
              >
                {loading === 'verify' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                {localStatus === 'verified' ? 'Verified ✓' : 'Verify'}
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={!!loading}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${
                  localStatus === 'rejected'
                    ? 'bg-red-600 text-white cursor-default'
                    : 'bg-red-600/20 hover:bg-red-600 hover:text-white text-red-400 border border-red-800'
                }`}
              >
                {loading === 'reject' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                {localStatus === 'rejected' ? 'Rejected ✗' : 'Reject'}
              </button>
            </div>
            {(localStatus === 'verified' || localStatus === 'rejected') && (
              <p className="text-center text-gray-600 text-xs">Click to change status</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2.5 bg-gray-800 rounded-xl text-gray-500 text-xs">
            Awaiting ID upload
          </div>
        )}
      </div>

      {/* Full image modal — images only, PDFs open directly */}
      {imgOpen && signedUrl && !profile.student_id_url.toLowerCase().includes('.pdf') && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImgOpen(false)}
        >
          <img
            src={signedUrl}
            alt="Student ID Full"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setImgOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
          >
            ✕
          </button>
          <a
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white text-sm hover:bg-white/20"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={14} /> Open Original
          </a>
        </div>
      )}
    </div>
  );
}

// ── Main Admin Dashboard ──
function AdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchProfiles(); }, []);

  async function fetchProfiles() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .not('student_id_url', 'is', null)
      .order('updated_at', { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  }

  const handleAction = (id, action) => {
    setProfiles(prev => prev.map(p =>
      p.id === id
        ? { ...p, is_verified: action === 'verify', verification_status: action === 'verify' ? 'verified' : 'rejected' }
        : p
    ));
  };

  const counts = {
    all: profiles.length,
    pending: profiles.filter(p => p.verification_status === 'pending').length,
    verified: profiles.filter(p => p.verification_status === 'verified').length,
    rejected: profiles.filter(p => p.verification_status === 'rejected').length,
  };

  const filtered = filter === 'all' ? profiles : profiles.filter(p => p.verification_status === filter);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-white text-lg leading-none">CampusPlug Admin</h1>
              <p className="text-gray-500 text-xs">KYC Verification Panel</p>
            </div>
          </div>
          <button
            onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { key: 'all',      label: 'Total Submissions', icon: Users,       color: 'text-blue-400' },
            { key: 'pending',  label: 'Pending Review',    icon: Clock,       color: 'text-amber-400' },
            { key: 'verified', label: 'Verified',          icon: FileCheck,   color: 'text-green-400' },
            { key: 'rejected', label: 'Rejected',          icon: FileX,       color: 'text-red-400' },
          ].map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <Icon size={20} className={`${color} mb-2`} />
              <p className="text-2xl font-black text-white">{counts[key]}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['pending', 'all', 'verified', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                filter === f ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f} {f !== 'all' && `(${counts[f]})`}
            </button>
          ))}
        </div>

        {/* Pending alert */}
        {counts.pending > 0 && filter !== 'pending' && (
          <div className="flex items-center gap-3 p-4 bg-amber-900/20 border border-amber-800/50 rounded-xl mb-6">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-sm">
              <strong>{counts.pending}</strong> student{counts.pending > 1 ? 's' : ''} waiting for verification.
              <button onClick={() => setFilter('pending')} className="ml-2 underline hover:no-underline">Review now</button>
            </p>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="text-green-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <FileCheck size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No submissions in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(profile => (
              <KYCCard key={profile.id} profile={profile} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root: gate behind login ──
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === ADMIN_EMAIL) setAuthed(true);
    });
  }, []);

  return authed ? <AdminDashboard /> : <AdminLogin onLogin={() => setAuthed(true)} />;
}