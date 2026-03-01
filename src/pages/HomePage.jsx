// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Package } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Electronics', 'Books & Stationery', 'Fashion & Clothing', 'Food & Drinks', 'Furniture', 'Services', 'Beauty & Health', 'Sports & Fitness', 'Others'];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => { fetchProducts(); }, [category, sortBy]);

  async function fetchProducts() {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, profiles(full_name, is_verified)')
      .eq('is_available', true);

    if (category !== 'All') query = query.eq('category', category);
    if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
    else if (sortBy === 'price_asc') query = query.order('price', { ascending: true });
    else if (sortBy === 'price_desc') query = query.order('price', { ascending: false });

    const { data } = await query.limit(60);
    setProducts(data || []);
    setLoading(false);
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              Buy & Sell on Campus <span className="text-green-600">🇳🇬</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Connect with students at your university. Trusted, fast, and easy.
            </p>
          </div>

          {/* Search */}
          <div className="mt-5 flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for phones, books, clothes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm outline-none bg-white transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none px-4 py-3 pr-8 rounded-xl border border-gray-200 text-sm font-medium outline-none bg-white focus:border-green-500 cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  category === cat
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-5 bg-gray-100 rounded w-1/3" />
                  <div className="h-10 bg-gray-100 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Package size={32} className="text-gray-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-700">No items found</h3>
              <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4 font-medium">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
