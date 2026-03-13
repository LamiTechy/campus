// src/pages/TransactionsPage.jsx
import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Loader2, Download, Filter, Search, TrendingUp, TrendingDown, Wallet, X, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { formatNaira } from '../lib/flutterwave';
import { useTheme, t } from '../context/ThemeContext';

const STATUS_STYLES = {
  pending:   { label: 'Pending',   class: 'bg-gray-100 text-gray-600' },
  paid:      { label: 'Paid',      class: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', class: 'bg-green-100 text-green-700' },
  disputed:  { label: 'Disputed',  class: 'bg-red-100 text-red-700' },
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
  const [tab, setTab] = useState('all');         // all | buying | selling
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all | 7d | 30d | 90d

  useEffect(() => { fetchAll(); }, [user]);
  useEffect(() => { applyFilters(); }, [orders, tab, search, statusFilter, dateFilter]);

  async function fetchAll() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        products(name, images, category),
        buyer:profiles!orders_buyer_id_fkey(full_name),
        seller:profiles!orders_seller_id_fkey(full_name)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .neq('status', 'pending')
      .order('created_at', { ascending: false });

    setOrders(data || []);
    setLoading(false);
  }

  function applyFilters() {
    let result = [...orders];

    // Tab filter
    if (tab === 'buying') result = result.filter(o => o.buyer_id === user.id);
    if (tab === 'selling') result = result.filter(o => o.seller_id === user.id);

    // Status filter
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);

    // Date filter
    if (dateFilter !== 'all') {
      const days = { '7d': 7, '30d': 30, '90d': 90 }[dateFilter];
      const cutoff = new Date(Date.now() - days * 86400000);
      result = result.filter(o => new Date(o.created_at) >= cutoff);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.products?.name?.toLowerCase().includes(q) ||
        o.paystack_reference?.toLowerCase().includes(q) ||
        o.buyer?.full_name?.toLowerCase().includes(q) ||
        o.seller?.full_name?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }

  // Stats
  const buying = orders.filter(o => o.buyer_id === user?.id);
  const selling = orders.filter(o => o.seller_id === user?.id);
  const totalSpent = buying.filter(o => o.status !== 'pending').reduce((s, o) => s + o.amount, 0);
  const totalEarned = selling.filter(o => o.status === 'completed').reduce((s, o) => s + o.seller_amount, 0);
  const pending = selling.filter(o => o.status === 'paid').reduce((s, o) => s + o.seller_amount, 0);

  // CSV export
  const exportCSV = () => {
    const rows = [
      ['Date', 'Type', 'Product', 'Amount', 'Status', 'Reference'],
      ...filtered.map(o => [
        new Date(o.created_at).toLocaleDateString('en-NG'),
        o.buyer_id === user.id ? 'Purchase' : 'Sale',
        o.products?.name || '',
        o.buyer_id === user.id ? o.amount : o.seller_amount,
        o.status,
        o.paystack_reference || '',
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusplug-transactions-${Date.now()}.csv`;
    a.click();
  };

  const timeAgo = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
    <div style={{ minHeight: "100vh", background: th.bg, transition: "background 0.3s" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: th.text, letterSpacing: "-0.5px" }}>Transaction History</h1>
            <p style={{ color: th.textSub, fontSize: 13, marginTop: 2 }}>All your buys and sales</p>
          </div>
          <button onClick={exportCSV}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `1px solid ${th.border}`, background: "transparent", color: th.textSub, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: 16, boxShadow: th.shadow }}>
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center mb-2">
              <TrendingDown size={16} className="text-red-500" />
            </div>
            <p style={{ fontSize: 11, color: th.textSub, fontWeight: 600 }}>Total Spent</p>
            <p style={{ fontWeight: 900, color: th.text, fontSize: 18, lineHeight: 1.2, marginTop: 2 }}>{formatNaira(totalSpent)}</p>
          </div>
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: 16, boxShadow: th.shadow }}>
            <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center mb-2">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <p style={{ fontSize: 11, color: th.textSub, fontWeight: 600 }}>Total Earned</p>
            <p style={{ fontWeight: 900, color: th.text, fontSize: 18, lineHeight: 1.2, marginTop: 2 }}>{formatNaira(totalEarned)}</p>
          </div>
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: 16, boxShadow: th.shadow }}>
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
              <Wallet size={16} className="text-amber-500" />
            </div>
            <p style={{ fontSize: 11, color: th.textSub, fontWeight: 600 }}>Pending Payout</p>
            <p style={{ fontWeight: 900, color: th.text, fontSize: 18, lineHeight: 1.2, marginTop: 2 }}>{formatNaira(pending)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'buying', label: 'Purchases' },
            { key: 'selling', label: 'Sales' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", border: "none", background: tab === key ? "#16a34a" : th.bgCard, color: tab === key ? "#fff" : th.textSub }}>
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: 14, marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 10, boxShadow: th.shadow }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 160, border: `1px solid ${th.inputBorder}`, borderRadius: 12, padding: "8px 12px" }}>
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search product or name..."
              style={{ fontSize: 13, outline: "none", width: "100%", background: "transparent", color: th.text }}
            />
          </div>
          {/* Status */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ border: `1px solid ${th.inputBorder}`, borderRadius: 12, padding: "8px 12px", fontSize: 13, outline: "none", background: th.input, color: th.textSub, fontWeight: 600, cursor: "pointer" }}>
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
            <option value="disputed">Disputed</option>
          </select>
          {/* Date */}
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            style={{ border: `1px solid ${th.inputBorder}`, borderRadius: 12, padding: "8px 12px", fontSize: 13, outline: "none", background: th.input, color: th.textSub, fontWeight: 600, cursor: "pointer" }}>
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="text-green-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: "64px 32px", textAlign: "center" }}>
            <Wallet size={36} className="text-gray-300 mx-auto mb-3" />
            <p style={{ fontWeight: 700, color: th.textSub }}>No transactions found</p>
            <p style={{ color: th.textMuted, fontSize: 13, marginTop: 4 }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(order => {
              const isBuying = order.buyer_id === user.id;
              const amount = isBuying ? order.amount : order.seller_amount;
              const status = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
              const image = order.products?.images?.[0];

              return (
                <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: th.shadow }}>
                  {/* Direction icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isBuying ? 'bg-red-50' : 'bg-green-50'}`}>
                    {isBuying
                      ? <ArrowUpRight size={18} className="text-red-500" />
                      : <ArrowDownLeft size={18} className="text-green-600" />
                    }
                  </div>

                  {/* Product image */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", background: th.bgHover, flexShrink: 0 }}>
                    {image
                      ? <img src={image} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                    }
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, color: th.text, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.products?.name || 'Product'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isBuying ? `From: ${order.seller?.full_name || 'Seller'}` : `To: ${order.buyer?.full_name || 'Buyer'}`}
                    </p>
                    <p style={{ fontSize: 11, color: th.textMuted }}>{timeAgo(order.created_at)}</p>
                  </div>

                  {/* Amount + Status */}
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black text-base ${isBuying ? 'text-red-500' : 'text-green-600'}`}>
                      {isBuying ? '-' : '+'}{formatNaira(amount)}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.class}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {filtered.length > 0 && (
          <p style={{ textAlign: "center", fontSize: 11, color: th.textMuted, marginTop: 16 }}>
            Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>

    {selectedOrder && (
      <TransactionDetailModal
        order={selectedOrder}
        userId={user.id}
        onClose={() => setSelectedOrder(null)}
      />
    )}
    </>
  );
}

function TransactionDetailModal({ order, userId, onClose }) {
  const { dark } = useTheme();
  const th = t(dark);
  const isBuying = order.buyer_id === userId;
  const amount = isBuying ? order.amount : order.seller_amount;
  const image = order.products?.images?.[0];
  const status = STATUS_STYLES[order.status] || STATUS_STYLES.pending;

  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeMsg, setDisputeMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const copyRef = () => {
    navigator.clipboard.writeText(order.paystack_reference || '');
  };

  const handleDispute = async () => {
    if (!disputeReason || !disputeMsg.trim()) return;
    setSubmitting(true);
    try {
      const DISPUTE_REASON_LABELS = {
        item_not_received: 'Item not received',
        item_not_as_described: 'Item not as described',
        wrong_item: 'Wrong item sent',
        payment_not_received: 'Payment not received',
        other: 'Other',
      };

      await supabase.from('disputes').insert({
        order_id: order.id,
        raised_by: userId,
        reason: disputeReason,
        message: disputeMsg,
        status: 'open',
        reference: order.paystack_reference,
        amount: order.amount,
      });
      await supabase.from('orders').update({ status: 'disputed' }).eq('id', order.id);

      // Email user confirmation + admin alert
      const { data: { user: authUser } } = await supabase.auth.getUser();
      await Promise.all([
        supabase.functions.invoke('send-email', {
          body: {
            type: 'dispute_raised',
            to: authUser?.email,
            data: {
              name: authUser?.user_metadata?.full_name || 'there',
              product: order.products?.name || 'Unknown product',
              amount: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(order.amount),
              reason: DISPUTE_REASON_LABELS[disputeReason] || disputeReason,
              is_admin: false,
            },
          },
        }),
        supabase.functions.invoke('send-email', {
          body: {
            type: 'dispute_raised',
            to: import.meta.env.VITE_ADMIN_EMAIL || 'admin@campusplug.ng',
            data: {
              name: authUser?.user_metadata?.full_name || 'A user',
              product: order.products?.name || 'Unknown product',
              amount: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(order.amount),
              reason: DISPUTE_REASON_LABELS[disputeReason] || disputeReason,
              is_admin: true,
            },
          },
        }),
      ]);

      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 24, maxWidth: 380, width: "100%", marginTop: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${th.border}` }}>
          <h3 style={{ fontWeight: 800, color: th.text }}>Transaction Details</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: th.bgHover, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={18} style={{ color: th.textSub }} />
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Amount hero */}
          <div style={{ borderRadius: 16, padding: 20, textAlign: "center", background: isBuying ? "rgba(239,68,68,0.1)" : "rgba(22,163,74,0.1)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: th.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              {isBuying ? 'You Paid' : 'You Received'}
            </p>
            <p className={`text-3xl font-black ${isBuying ? 'text-red-500' : 'text-green-600'}`}>
              {isBuying ? '-' : '+'}{formatNaira(amount)}
            </p>
            <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${status.class}`}>
              {status.label}
            </span>
          </div>

          {/* Product */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: th.bgHover, borderRadius: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", background: th.bgCard, flexShrink: 0 }}>
              {image
                ? <img src={image} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
              }
            </div>
            <div>
              <p style={{ fontWeight: 800, color: th.text, fontSize: 13 }}>{order.products?.name || 'Product'}</p>
              <p style={{ fontSize: 11, color: th.textSub }}>{order.products?.category}</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2.5">
            <p style={{ fontSize: 11, fontWeight: 700, color: th.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Breakdown</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: th.textSub }}>Item price</span>
                <span style={{ fontWeight: 700, color: th.text }}>{formatNaira(order.seller_amount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: th.textSub }}>Platform fee (3%)</span>
                <span style={{ fontWeight: 700, color: th.text }}>{formatNaira(order.platform_fee)}</span>
              </div>
              <div style={{ borderTop: `1px solid ${th.border}`, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 800, color: th.text }}>Buyer paid</span>
                <span style={{ fontWeight: 900, color: th.text }}>{formatNaira(order.amount)}</span>
              </div>
              {!isBuying && (
                <div className="flex justify-between text-green-600">
                  <span className="font-bold">You received</span>
                  <span className="font-black">{formatNaira(order.seller_amount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2.5">
            <p style={{ fontSize: 11, fontWeight: 700, color: th.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Details</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: th.textSub }}>{isBuying ? 'Seller' : 'Buyer'}</span>
                <span style={{ fontWeight: 700, color: th.text }}>
                  {isBuying ? order.seller?.full_name : order.buyer?.full_name}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: th.textSub }}>Date</span>
                <span style={{ fontWeight: 700, color: th.text }}>
                  {new Date(order.created_at).toLocaleDateString('en-NG', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              {order.delivery_confirmed_at && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: th.textSub }}>Delivered</span>
                  <span style={{ fontWeight: 700, color: th.text }}>
                    {new Date(order.delivery_confirmed_at).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {order.transfer_status && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: th.textSub }}>Transfer</span>
                  <span className={`font-semibold capitalize ${order.transfer_status === 'SUCCESSFUL' ? 'text-green-600' : 'text-amber-600'}`}>
                    {order.transfer_status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reference */}
          {order.paystack_reference && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: th.bgHover, borderRadius: 12 }}>
              <div>
                <p style={{ fontSize: 11, color: th.textMuted }}>Reference</p>
                <p style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: th.textSub }}>{order.paystack_reference}</p>
              </div>
              <button onClick={copyRef}
                style={{ fontSize: 12, color: "#4ade80", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
                Copy
              </button>
            </div>
          )}

          {/* Raise a dispute */}
          {!submitted && order.status !== 'disputed' && (
            <div>
              {!showDispute ? (
                <button
                  onClick={() => setShowDispute(true)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#f87171", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <AlertTriangle size={14} /> Report an Issue
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14 }}>
                  <p style={{ fontWeight: 800, color: "#f87171", fontSize: 13 }}>Report a Problem</p>
                  <select
                    value={disputeReason}
                    onChange={e => setDisputeReason(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: th.input, color: th.text, fontSize: 13, outline: "none" }}>
                    <option value="">Select reason...</option>
                    <option value="item_not_received">Item not received</option>
                    <option value="item_not_as_described">Item not as described</option>
                    <option value="wrong_item">Wrong item sent</option>
                    <option value="payment_not_received">Payment not received</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    value={disputeMsg}
                    onChange={e => setDisputeMsg(e.target.value)}
                    placeholder="Describe what happened in detail..."
                    rows={3}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: th.input, color: th.text, fontSize: 13, outline: "none", resize: "none" }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDispute(false)}
                      style={{ flex: 1, padding: "10px", border: `1px solid ${th.border}`, background: "transparent", color: th.textSub, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button
                      onClick={handleDispute}
                      disabled={submitting || !disputeReason || !disputeMsg.trim()}
                      className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {submitted && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
              <p className="text-green-800 text-sm font-medium">Dispute submitted! We'll review and respond within 24hrs.</p>
            </div>
          )}

          {order.status === 'disputed' && !submitted && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
              <p className="text-amber-800 text-sm font-medium">A dispute has been raised on this transaction. Under review.</p>
            </div>
          )}

          <button onClick={onClose}
            style={{ width: "100%", padding: "13px", border: `1px solid ${th.border}`, background: "transparent", color: th.textSub, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}