// src/pages/SellerPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

export default function SellerPage() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSellerData(); }, [sellerId]);

  async function fetchSellerData() {
    setLoading(true);
    const [{ data: profile }, { data: listings }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', sellerId).single(),
      supabase.from('products')
        .select('*, profiles(full_name, is_verified, whatsapp_number)')
        .eq('seller_id', sellerId)
        .eq('is_available', true)
        .order('created_at', { ascending: false }),
    ]);
    setSeller(profile);
    setProducts(listings || []);
    setLoading(false);
  }

  const handleDelete = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={28} className="text-green-500 animate-spin" />
    </div>
  );

  if (!seller) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Seller not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Seller Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-700 font-black text-2xl">
                {seller.full_name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-gray-900">{seller.full_name || 'Seller'}</h1>
                {seller.is_verified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                    <CheckCircle size={11} /> Verified Student
                  </span>
                )}
              </div>
              {seller.university && (
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <MapPin size={13} /> {seller.university}
                </div>
              )}
              <p className="text-gray-400 text-sm mt-1">{products.length} active listing{products.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Listings */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-gray-500 font-semibold">No active listings</p>
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