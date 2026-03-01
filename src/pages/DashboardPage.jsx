// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMyProducts(); }, [user]);

  async function fetchMyProducts() {
    if (!user) return;
    const { data } = await supabase
      .from('products')
      .select('*, profiles(full_name, is_verified)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  const handleDelete = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const formatPrice = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Listings</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {profile?.full_name ? `Hey ${profile.full_name.split(' ')[0]} 👋` : 'Manage your items'}
            </p>
          </div>
          <Link
            to="/sell"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Package, label: 'Total Listings', value: products.length, color: 'text-green-600 bg-green-50' },
            { icon: TrendingUp, label: 'Total Value', value: formatPrice(totalValue), color: 'text-blue-600 bg-blue-50' },
            { icon: Eye, label: 'Active', value: products.filter(p => p.is_available).length, color: 'text-emerald-600 bg-emerald-50' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="font-black text-gray-900 text-lg leading-tight mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-10 bg-gray-100 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-green-400" />
            </div>
            <h3 className="font-bold text-gray-700 mb-1">No listings yet</h3>
            <p className="text-gray-400 text-sm mb-6">Start selling! List your first item in minutes.</p>
            <Link to="/sell" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors">
              <Plus size={16} /> Create Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
