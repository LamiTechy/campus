// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Search, ChevronDown, Package, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Electronics', 'Books & Stationery', 'Fashion & Clothing', 'Food & Drinks', 'Furniture', 'Services', 'Beauty & Health', 'Sports & Fitness', 'Others'];
const UNIVERSITIES = ['All Universities', 'University of Lagos (UNILAG)', 'University of Ibadan (UI)', 'Obafemi Awolowo University (OAU)', 'University of Nigeria Nsukka (UNN)', 'Ahmadu Bello University (ABU)', 'Lagos State University (LASU)', 'Covenant University', 'Babcock University', 'University of Benin (UNIBEN)', 'Rivers State University', 'Other'];
const CONDITIONS = ['All', 'new', 'fairly-used', 'used'];
const CONDITION_LABELS = { 'All': 'Any Condition', 'new': 'Brand New', 'fairly-used': 'Fairly Used', 'used': 'Used' };

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [university, setUniversity] = useState('All Universities');
  const [condition, setCondition] = useState('All');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => { fetchProducts(); }, [category, sortBy]);

  async function fetchProducts() {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, profiles(full_name, is_verified, university, whatsapp_number)')
      .eq('is_available', true)
      .gt('quantity', 0);

    if (category !== 'All') query = query.eq('category', category);
    if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
    else if (sortBy === 'price_asc') query = query.order('price', { ascending: true });
    else if (sortBy === 'price_desc') query = query.order('price', { ascending: false });

    const { data } = await query.limit(60);
    setProducts(data || []);
    setLoading(false);
  }

  const activeFilterCount = [
    university !== 'All Universities',
    condition !== 'All',
    priceMin !== '',
    priceMax !== '',
    verifiedOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setUniversity('All Universities');
    setCondition('All');
    setPriceMin('');
    setPriceMax('');
    setVerifiedOnly(false);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchUni = university === 'All Universities' || p.profiles?.university === university;
    const matchCond = condition === 'All' || p.condition === condition;
    const matchMin = priceMin === '' || p.price >= Number(priceMin);
    const matchMax = priceMax === '' || p.price <= Number(priceMax);
    const matchVerified = !verifiedOnly || p.profiles?.is_verified;
    return matchSearch && matchUni && matchCond && matchMin && matchMax && matchVerified;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero + Search */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="max-w-2xl mb-5">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              Buy & Sell on Campus <span className="text-green-600">🇳🇬</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Connect with students at your university. Trusted, fast, and easy.</p>
          </div>

          {/* Search row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search phones, books, clothes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm outline-none bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={14} className="text-gray-400" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none h-full px-3 py-2.5 pr-7 rounded-xl border border-gray-200 text-sm font-medium outline-none bg-white focus:border-green-500 cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-white text-green-600 text-xs font-black rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* University filter */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">University</label>
                  <select
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white focus:border-green-500"
                  >
                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                {/* Condition filter */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Condition</label>
                  <select
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white focus:border-green-500"
                  >
                    {CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
                  </select>
                </div>

                {/* Price range */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Min Price (₦)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Max Price (₦)</label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white focus:border-green-500"
                  />
                </div>
              </div>

              {/* Verified only toggle */}
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <div
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${verifiedOnly ? 'bg-green-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${verifiedOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700 font-medium">Verified sellers only</span>
              </label>

              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${category === cat ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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
              <p className="text-gray-400 text-sm mt-1">Try a different search or filter</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-3 text-green-600 text-sm font-semibold">
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4 font-medium">{filtered.length} {filtered.length === 1 ? 'item' : 'items'} found</p>
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