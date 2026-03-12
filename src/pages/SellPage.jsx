// src/pages/SellPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function SellPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [listingCount, setListingCount] = useState(null);
  const [loading, setLoading] = useState(true);

  const FREE_LIMIT = 3;
  const isPro = profile?.is_pro;

  useEffect(() => {
    if (user) fetchCount();
  }, [user]);

  async function fetchCount() {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id);
    setListingCount(count || 0);
    setLoading(false);
  }

  const isLimited = !isPro && listingCount >= FREE_LIMIT;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Pro badge */}
        {isPro && (
          <div className="mb-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
            <Crown size={12} /> Pro Seller · Unlimited Listings
          </div>
        )}

        {/* Free limit warning */}
        {!isPro && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3">
            <p className="text-amber-800 text-sm font-medium">
              {listingCount}/{FREE_LIMIT} free listings used
            </p>
            <button
              onClick={() => navigate('/subscription')}
              className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg whitespace-nowrap"
            >
              Upgrade →
            </button>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">List an Item</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details and connect buyers via WhatsApp</p>
        </div>

        {/* Blocked state */}
        {isLimited ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Free limit reached</h2>
            <p className="text-gray-500 text-sm mb-6">
              You've used all {FREE_LIMIT} free listings. Upgrade to Pro for unlimited listings + verified badge.
            </p>
            <button
              onClick={() => navigate('/subscription')}
              className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-700"
            >
              <Crown size={16} /> Upgrade to Pro · ₦1,500/mo
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="block mx-auto mt-3 text-sm text-gray-400 hover:text-gray-600"
            >
              Back to dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <ProductForm
              onSuccess={() => navigate('/dashboard')}
              onCancel={() => navigate('/dashboard')}
            />
          </div>
        )}
      </div>
    </div>
  );
}