// src/pages/AdminPage.jsx
// Access at /admin-kyc-panel-9x2z  (keep this URL secret)
import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock, Eye, LogIn, Loader2, AlertTriangle,
         ExternalLink, Users, FileCheck, FileX, BarChart2, MessageSquare,
         ShoppingBag, TrendingUp, Wallet, CheckSquare, Ticket, Package,
         MapPin, Handshake, Ban, RefreshCw, Mail } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatNaira } from '../lib/flutterwave';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@campusplug.ng';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'changeme123!';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',  color: 'bg-amber-100 text-amber-700',  icon: Clock },
  verified:   { label: 'Verified', color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  rejected:   { label: 'Rejected', color: 'bg-red-100 text-red-700',      icon: XCircle },
  unverified: { label: 'None',     color: 'bg-gray-100 text-gray-500',    icon: Shield },
};

// ── Admin Login ──
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
    const { error } = await supabase.auth.signInWithPassword({ email: creds.email, password: creds.password });
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
          <p className="text-gray-500 text-sm mt-1">CampusPlug Management</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Admin Email</label>
              <input type="email" required value={creds.email}
                onChange={e => setCreds(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500"
                placeholder="admin@campusplug.ng" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">Password</label>
              <input type="password" required value={creds.password}
                onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500"
                placeholder="••••••••" />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-xl px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Access Admin Panel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── KYC Tab ──
function KYCCard({ profile, onAction }) {
  const [loading, setLoading] = useState(null);
  const [imgOpen, setImgOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState(null);
  const [actionDone, setActionDone] = useState(null);
  const [localStatus, setLocalStatus] = useState(profile.verification_status);
  const status = STATUS_CONFIG[localStatus] || STATUS_CONFIG.unverified;
  const StatusIcon = status.icon;

  useEffect(() => {
    if (!profile.student_id_url) return;
    async function getSignedUrl() {
      const url = profile.student_id_url;
      let filePath = null;
      const patterns = [
        /storage\/v1\/object\/(?:public|sign|authenticated)\/student-ids\/(.+?)(?:\?|$)/,
        /student-ids\/(.+?)(?:\?|$)/,
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) { filePath = decodeURIComponent(match[1]); break; }
      }
      if (!filePath) { setSignedUrl(url); return; }
      const { data, error } = await supabase.storage.from('student-ids').createSignedUrl(filePath, 3600);
      setSignedUrl(error ? url : data.signedUrl);
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
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden relative">
      <div className="relative h-48 bg-gray-800 cursor-pointer group overflow-hidden" onClick={() => profile.student_id_url && setImgOpen(true)}>
        {profile.student_id_url ? (
          signedUrl && profile.student_id_url.toLowerCase().includes('.pdf') ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-800">
              <div className="w-14 h-14 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center">
                <span className="text-red-400 font-black text-lg">PDF</span>
              </div>
              <a href={signedUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl">
                <ExternalLink size={12} /> Open PDF
              </a>
            </div>
          ) : signedUrl ? (
            <>
              <img src={signedUrl} alt="Student ID" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Eye size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Loader2 size={28} className="text-green-500 animate-spin" /></div>
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-600">
            <FileX size={36} /><span className="text-xs">No ID uploaded</span>
          </div>
        )}
        <div className={`absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
          <StatusIcon size={11} /> {status.label}
        </div>
      </div>

      {actionDone && (
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl ${actionDone === 'verify' ? 'bg-green-900/95' : 'bg-red-900/95'}`}>
          {actionDone === 'verify' ? <CheckCircle size={40} className="text-green-400 mb-2" /> : <XCircle size={40} className="text-red-400 mb-2" />}
          <p className="text-white font-black text-sm">{actionDone === 'verify' ? 'Student Verified!' : 'Application Rejected'}</p>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-bold text-white text-sm">{profile.full_name || 'Unknown'}</h3>
        <p className="text-gray-500 text-xs mt-0.5">{profile.email}</p>
        {profile.university && <p className="text-gray-600 text-xs mt-1">🎓 {profile.university}</p>}
        {profile.whatsapp_number && <p className="text-gray-600 text-xs">📱 {profile.whatsapp_number}</p>}
        <p className="text-gray-700 text-xs mt-2 mb-3">
          {new Date(profile.updated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        {profile.student_id_url ? (
          <div className="flex gap-2">
            <button onClick={() => handleAction('verify')} disabled={!!loading}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${localStatus === 'verified' ? 'bg-green-600 text-white' : 'bg-green-600/20 hover:bg-green-600 hover:text-white text-green-400 border border-green-700'}`}>
              {loading === 'verify' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              {localStatus === 'verified' ? 'Verified ✓' : 'Verify'}
            </button>
            <button onClick={() => handleAction('reject')} disabled={!!loading}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${localStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-600/20 hover:bg-red-600 hover:text-white text-red-400 border border-red-800'}`}>
              {loading === 'reject' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
              {localStatus === 'rejected' ? 'Rejected ✗' : 'Reject'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2.5 bg-gray-800 rounded-xl text-gray-500 text-xs">Awaiting ID upload</div>
        )}
      </div>

      {imgOpen && signedUrl && !profile.student_id_url.toLowerCase().includes('.pdf') && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setImgOpen(false)}>
          <img src={signedUrl} alt="Student ID Full" className="max-w-full max-h-full rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
          <button onClick={() => setImgOpen(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20">✕</button>
          <a href={signedUrl} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white text-sm hover:bg-white/20" onClick={e => e.stopPropagation()}>
            <ExternalLink size={14} /> Open Original
          </a>
        </div>
      )}
    </div>
  );
}

// ── Disputes Tab ──
function DisputesPanel() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const [filter, setFilter] = useState('open');

  useEffect(() => { fetchDisputes(); }, []);

  async function fetchDisputes() {
    const { data } = await supabase
      .from('disputes')
      .select('*, order:orders(*, products(name, images), buyer:profiles!orders_buyer_id_fkey(full_name, whatsapp_number), seller:profiles!orders_seller_id_fkey(full_name, whatsapp_number))')
      .order('created_at', { ascending: false });
    setDisputes(data || []);
    setLoading(false);
  }

  const handleResolve = async (status) => {
    setResolving(true);
    await supabase.from('disputes').update({
      status,
      admin_note: adminNote,
      updated_at: new Date().toISOString(),
    }).eq('id', selected.id);

    // Notify both parties
    const msg = `Your dispute for "${selected.order?.products?.name}" has been ${status}. ${adminNote ? 'Admin note: ' + adminNote : ''}`;
    await Promise.all([
      supabase.from('notifications').insert({ user_id: selected.raised_by, type: 'order', title: `Dispute ${status}`, message: msg, link: '/transactions' }),
    ]);

    setDisputes(prev => prev.map(d => d.id === selected.id ? { ...d, status, admin_note: adminNote } : d));
    setSelected(null);
    setAdminNote('');
    setResolving(false);
  };

  const DISPUTE_REASONS = {
    item_not_received: 'Item not received',
    item_not_as_described: 'Item not as described',
    wrong_item: 'Wrong item sent',
    payment_not_received: 'Payment not received',
    other: 'Other',
  };

  const STATUS_COLORS = {
    open: 'bg-red-900/30 text-red-400 border-red-800',
    reviewing: 'bg-amber-900/30 text-amber-400 border-amber-800',
    resolved: 'bg-green-900/30 text-green-400 border-green-800',
    closed: 'bg-gray-800 text-gray-500 border-gray-700',
  };

  const filtered = filter === 'all' ? disputes : disputes.filter(d => d.status === filter);

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['open', 'reviewing', 'resolved', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {f} {f !== 'all' && `(${disputes.filter(d => d.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-green-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>No {filter} disputes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <div key={d.id} onClick={() => { setSelected(d); setAdminNote(d.admin_note || ''); }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 cursor-pointer hover:border-green-700 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[d.status] || STATUS_COLORS.open}`}>
                      {d.status}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(d.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <p className="font-bold text-white text-sm">{d.order?.products?.name || 'Unknown product'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{DISPUTE_REASONS[d.reason] || d.reason}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{d.message}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-white text-sm">{formatNaira(d.amount || 0)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dispute Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full shadow-2xl my-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="font-bold text-white">Dispute Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Product */}
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
                  {selected.order?.products?.images?.[0]
                    ? <img src={selected.order.products.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                  }
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{selected.order?.products?.name}</p>
                  <p className="text-xs text-gray-400">{formatNaira(selected.amount || 0)}</p>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Buyer</p>
                  <p className="text-white text-sm font-semibold">{selected.order?.buyer?.full_name}</p>
                  <p className="text-gray-500 text-xs">{selected.order?.buyer?.whatsapp_number}</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Seller</p>
                  <p className="text-white text-sm font-semibold">{selected.order?.seller?.full_name}</p>
                  <p className="text-gray-500 text-xs">{selected.order?.seller?.whatsapp_number}</p>
                </div>
              </div>

              {/* Reason + Message */}
              <div className="p-3 bg-gray-800 rounded-xl space-y-2">
                <p className="text-xs font-bold text-gray-400">REASON</p>
                <p className="text-white text-sm">{DISPUTE_REASONS[selected.reason] || selected.reason}</p>
                <p className="text-xs font-bold text-gray-400 mt-2">MESSAGE</p>
                <p className="text-gray-300 text-sm leading-relaxed">{selected.message}</p>
              </div>

              {/* Ref */}
              <p className="text-xs text-gray-600 font-mono">{selected.reference}</p>

              {/* Admin note */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">Admin Note (sent to user)</label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                  rows={3} placeholder="Explain resolution or request more info..."
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500 resize-none" />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleResolve('reviewing')} disabled={resolving}
                  className="py-2.5 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-800 rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                  Reviewing
                </button>
                <button onClick={() => handleResolve('resolved')} disabled={resolving}
                  className="py-2.5 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-800 rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                  {resolving ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Resolve ✓'}
                </button>
                <button onClick={() => handleResolve('closed')} disabled={resolving}
                  className="py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Transactions Tab ──
function TransactionsPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('orders')
      .select('*, products(name, images), buyer:profiles!orders_buyer_id_fkey(full_name), seller:profiles!orders_seller_id_fkey(full_name)')
      .neq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, []);

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.platform_fee || 0), 0);
  const totalVolume = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.amount || 0), 0);
  const pending = orders.filter(o => o.status === 'paid').reduce((s, o) => s + (o.seller_amount || 0), 0);

  const STATUS_COLORS = {
    paid: 'bg-blue-900/30 text-blue-400',
    completed: 'bg-green-900/30 text-green-400',
    disputed: 'bg-red-900/30 text-red-400',
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Platform Revenue', value: formatNaira(totalRevenue), icon: TrendingUp, color: 'text-green-400' },
          { label: 'Total Volume', value: formatNaira(totalVolume), icon: BarChart2, color: 'text-blue-400' },
          { label: 'Pending Payouts', value: formatNaira(pending), icon: Wallet, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <Icon size={18} className={`${color} mb-2`} />
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-black text-white text-lg mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-green-500 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {orders.map(o => (
            <div key={o.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                {o.products?.images?.[0]
                  ? <img src={o.products.images[0]} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm line-clamp-1">{o.products?.name}</p>
                <p className="text-xs text-gray-500">{o.buyer?.full_name} → {o.seller?.full_name}</p>
                <p className="text-xs text-gray-600">{new Date(o.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-white text-sm">{formatNaira(o.amount)}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] || 'bg-gray-800 text-gray-400'}`}>
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Users Tab ──
function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search users..."
        className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white text-sm outline-none focus:border-green-500 mb-4" />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-green-500 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-900/40 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-black text-sm">{u.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{u.full_name || 'No name'}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
                {u.university && <p className="text-xs text-gray-600">🎓 {u.university}</p>}
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                {u.is_verified && <div className="text-xs bg-green-900/30 text-green-400 border border-green-800 px-2 py-0.5 rounded-full">✓ Verified</div>}
                {u.bank_verified && <div className="text-xs bg-blue-900/30 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full">🏦 Bank Added</div>}
                <p className="text-xs text-gray-600">{new Date(u.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Support Tickets Panel ──
function TicketsPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');

  useEffect(() => {
    supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setTickets(data || []); setLoading(false); });
  }, []);

  const updateStatus = async (id, status) => {
    await supabase.from('support_tickets').update({ status }).eq('id', id);
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
  const counts = { open: tickets.filter(t => t.status === 'open').length, in_progress: tickets.filter(t => t.status === 'in_progress').length, resolved: tickets.filter(t => t.status === 'resolved').length };

  const STATUS_COLORS = { open: 'text-red-400 bg-red-900/20 border-red-800/50', in_progress: 'text-amber-400 bg-amber-900/20 border-amber-800/50', resolved: 'text-green-400 bg-green-900/20 border-green-800/50' };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ key: 'open', label: 'Open', color: 'text-red-400' }, { key: 'in_progress', label: 'In Progress', color: 'text-amber-400' }, { key: 'resolved', label: 'Resolved', color: 'text-green-400' }].map(({ key, label, color }) => (
          <div key={key} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className={`text-2xl font-black ${color}`}>{counts[key]}</p>
            <p className="text-gray-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'open', 'in_progress', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-green-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20"><Ticket size={48} className="text-gray-700 mx-auto mb-4" /><p className="text-gray-500">No tickets in this category</p></div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(ticket => (
            <div key={ticket.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[ticket.status] || STATUS_COLORS.open}`}>{ticket.status.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">{ticket.subject}</h3>
                  <p className="text-gray-400 text-xs">{ticket.name} · {ticket.email}</p>
                </div>
                <a href={`mailto:${ticket.email}?subject=Re: ${ticket.subject}`} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 flex-shrink-0">
                  <Mail size={13} /> Reply
                </a>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed bg-gray-800/50 rounded-xl p-3 mb-4">{ticket.message}</p>
              <div className="flex gap-2">
                {ticket.status !== 'in_progress' && <button onClick={() => updateStatus(ticket.id, 'in_progress')} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/30 border border-amber-800/50 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-900/50 transition-colors"><RefreshCw size={11} /> In Progress</button>}
                {ticket.status !== 'resolved' && <button onClick={() => updateStatus(ticket.id, 'resolved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 border border-green-800/50 text-green-400 rounded-lg text-xs font-bold hover:bg-green-900/50 transition-colors"><CheckCircle size={11} /> Resolve</button>}
                {ticket.status === 'resolved' && <button onClick={() => updateStatus(ticket.id, 'open')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs font-bold hover:bg-gray-700 transition-colors"><RefreshCw size={11} /> Reopen</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Admin Orders Panel ──
function AdminOrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('orders')
      .select('*, products(title, name, images), buyer:profiles!orders_buyer_id_fkey(full_name, email), seller:profiles!orders_seller_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, []);

  const STATUS_COLORS = { pending: 'text-gray-400', meetup: 'text-blue-400', delivered: 'text-amber-400', completed: 'text-green-400', cancelled: 'text-red-400', disputed: 'text-red-400', paid: 'text-purple-400' };
  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (o.products?.title || o.products?.name || '').toLowerCase().includes(q) ||
        (o.buyer?.full_name || '').toLowerCase().includes(q) ||
        (o.seller?.full_name || '').toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {};
  ['pending','meetup','delivered','completed','cancelled'].forEach(s => { counts[s] = orders.filter(o => o.status === s).length; });

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {Object.entries(counts).map(([key, val]) => (
          <div key={key} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className={`text-xl font-black ${STATUS_COLORS[key] || 'text-white'}`}>{val}</p>
            <p className="text-gray-500 text-xs mt-1 capitalize">{key}</p>
          </div>
        ))}
      </div>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product, buyer, seller..." className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500" />
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'meetup', 'delivered', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${filter === f ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{f}</button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-green-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20"><Package size={48} className="text-gray-700 mx-auto mb-4" /><p className="text-gray-500">No orders found</p></div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-left">
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs">Product</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs hidden sm:table-cell">Buyer</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs hidden sm:table-cell">Seller</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs">Amount</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs">Status</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                        {o.products?.images?.[0] ? <img src={o.products.images[0]} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-sm">📦</span>}
                      </div>
                      <span className="text-white font-medium text-xs truncate max-w-24">{o.products?.title || o.products?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{o.buyer?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{o.seller?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-green-400 font-bold text-xs">₦{(o.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold capitalize ${STATUS_COLORS[o.status] || 'text-gray-400'}`}>{o.status}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{new Date(o.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Admin Dashboard ──
function AdminDashboard() {
  const [tab, setTab] = useState('kyc');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [disputeCount, setDisputeCount] = useState(0);

  useEffect(() => {
    supabase.from('profiles').select('*').not('student_id_url', 'is', null)
      .order('updated_at', { ascending: false })
      .then(({ data }) => { setProfiles(data || []); setLoading(false); });

    supabase.from('disputes').select('id', { count: 'exact' }).eq('status', 'open')
      .then(({ count }) => setDisputeCount(count || 0));
  }, []);

  const handleAction = (id, action) => {
    setProfiles(prev => prev.map(p => p.id === id
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

  const [ticketCount, setTicketCount] = useState(0);
  useEffect(() => {
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open').then(({ count }) => setTicketCount(count || 0));
  }, []);

  const TABS = [
    { key: 'kyc',          label: 'KYC',          icon: FileCheck,    badge: counts.pending },
    { key: 'tickets',      label: 'Tickets',       icon: Ticket,       badge: ticketCount },
    { key: 'orders',       label: 'Orders',        icon: Package,      badge: 0 },
    { key: 'disputes',     label: 'Disputes',      icon: MessageSquare, badge: disputeCount },
    { key: 'transactions', label: 'Transactions',  icon: BarChart2,    badge: 0 },
    { key: 'users',        label: 'Users',         icon: Users,        badge: 0 },
  ];

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
              <p className="text-gray-500 text-xs">Management Panel</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors">
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0">
          {TABS.map(({ key, label, icon: Icon, badge }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap relative ${tab === key ? 'border-green-500 text-green-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
              <Icon size={15} /> {label}
              {badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-black">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* KYC Tab */}
        {tab === 'kyc' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { key: 'all', label: 'Total', icon: Users, color: 'text-blue-400' },
                { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-400' },
                { key: 'verified', label: 'Verified', icon: FileCheck, color: 'text-green-400' },
                { key: 'rejected', label: 'Rejected', icon: FileX, color: 'text-red-400' },
              ].map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <Icon size={20} className={`${color} mb-2`} />
                  <p className="text-2xl font-black text-white">{counts[key]}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto">
              {['pending', 'all', 'verified', 'rejected'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {f} {f !== 'all' && `(${counts[f]})`}
                </button>
              ))}
            </div>

            {counts.pending > 0 && filter !== 'pending' && (
              <div className="flex items-center gap-3 p-4 bg-amber-900/20 border border-amber-800/50 rounded-xl mb-6">
                <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
                <p className="text-amber-300 text-sm">
                  <strong>{counts.pending}</strong> student{counts.pending > 1 ? 's' : ''} waiting for verification.
                  <button onClick={() => setFilter('pending')} className="ml-2 underline hover:no-underline">Review now</button>
                </p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 size={32} className="text-green-500 animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <FileCheck size={48} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">No submissions in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(profile => <KYCCard key={profile.id} profile={profile} onAction={handleAction} />)}
              </div>
            )}
          </>
        )}

        {tab === 'tickets' && <TicketsPanel />}
        {tab === 'orders' && <AdminOrdersPanel />}
        {tab === 'disputes' && <DisputesPanel />}
        {tab === 'transactions' && <TransactionsPanel />}
        {tab === 'users' && <UsersPanel />}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === ADMIN_EMAIL) setAuthed(true);
    });
  }, []);
  return authed ? <AdminDashboard /> : <AdminLogin onLogin={() => setAuthed(true)} />;
}