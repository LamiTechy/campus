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
            <h1 className="text-2xl font-black text-gray-900">Transaction History</h1>
            <p className="text-gray-500 text-sm mt-0.5">All your buys and sales</p>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center mb-2">
              <TrendingDown size={16} className="text-red-500" />
            </div>
            <p className="text-xs text-gray-500 font-medium">Total Spent</p>
            <p className="font-black text-gray-900 text-lg leading-tight mt-0.5">{formatNaira(totalSpent)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center mb-2">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-500 font-medium">Total Earned</p>
            <p className="font-black text-gray-900 text-lg leading-tight mt-0.5">{formatNaira(totalEarned)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
              <Wallet size={16} className="text-amber-500" />
            </div>
            <p className="text-xs text-gray-500 font-medium">Pending Payout</p>
            <p className="font-black text-gray-900 text-lg leading-tight mt-0.5">{formatNaira(pending)}</p>
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
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === key ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[160px] border border-gray-200 rounded-xl px-3 py-2">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search product or name..."
              className="text-sm outline-none w-full bg-transparent"
            />
          </div>
          {/* Status */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none bg-white text-gray-600 font-medium">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
            <option value="disputed">Disputed</option>
          </select>
          {/* Date */}
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none bg-white text-gray-600 font-medium">
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
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Wallet size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-500">No transactions found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(order => {
              const isBuying = order.buyer_id === user.id;
              const amount = isBuying ? order.amount : order.seller_amount;
              const status = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
              const image = order.products?.images?.[0];

              return (
                <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-green-100 transition-all">
                  {/* Direction icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isBuying ? 'bg-red-50' : 'bg-green-50'}`}>
                    {isBuying
                      ? <ArrowUpRight size={18} className="text-red-500" />
                      : <ArrowDownLeft size={18} className="text-green-600" />
                    }
                  </div>

                  {/* Product image */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {image
                      ? <img src={image} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                    }
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{order.products?.name || 'Product'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isBuying ? `From: ${order.seller?.full_name || 'Seller'}` : `To: ${order.buyer?.full_name || 'Buyer'}`}
                    </p>
                    <p className="text-xs text-gray-400">{timeAgo(order.created_at)}</p>
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
          <p className="text-center text-xs text-gray-400 mt-4">
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Transaction Details</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Amount hero */}
          <div className={`rounded-2xl p-5 text-center ${isBuying ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
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
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
              {image
                ? <img src={image} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
              }
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{order.products?.name || 'Product'}</p>
              <p className="text-xs text-gray-500">{order.products?.category}</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Breakdown</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Item price</span>
                <span className="font-semibold">{formatNaira(order.seller_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Platform fee (3%)</span>
                <span className="font-semibold">{formatNaira(order.platform_fee)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">Buyer paid</span>
                <span className="font-black text-gray-900">{formatNaira(order.amount)}</span>
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
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{isBuying ? 'Seller' : 'Buyer'}</span>
                <span className="font-semibold">
                  {isBuying ? order.seller?.full_name : order.buyer?.full_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString('en-NG', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              {order.delivery_confirmed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivered</span>
                  <span className="font-semibold">
                    {new Date(order.delivery_confirmed_at).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {order.transfer_status && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transfer</span>
                  <span className={`font-semibold capitalize ${order.transfer_status === 'SUCCESSFUL' ? 'text-green-600' : 'text-amber-600'}`}>
                    {order.transfer_status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reference */}
          {order.paystack_reference && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-400">Reference</p>
                <p className="font-mono text-xs font-semibold text-gray-700">{order.paystack_reference}</p>
              </div>
              <button onClick={copyRef}
                className="text-xs text-green-600 font-semibold hover:underline">
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                  <AlertTriangle size={14} /> Report an Issue
                </button>
              ) : (
                <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-bold text-red-800 text-sm">Report a Problem</p>
                  <select
                    value={disputeReason}
                    onChange={e => setDisputeReason(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-red-200 text-sm outline-none bg-white text-gray-700">
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
                    className="w-full px-3 py-2.5 rounded-xl border border-red-200 text-sm outline-none resize-none bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDispute(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 bg-white">
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
            className="w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}