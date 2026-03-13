// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Search, ChevronDown, Package, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useTheme, t } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Electronics', 'Books & Stationery', 'Fashion & Clothing', 'Food & Drinks', 'Furniture', 'Services', 'Beauty & Health', 'Sports & Fitness', 'Others'];
const UNIVERSITIES = ['All Universities', 'University of Lagos (UNILAG)', 'University of Ibadan (UI)', 'Obafemi Awolowo University (OAU)', 'University of Nigeria Nsukka (UNN)', 'Ahmadu Bello University (ABU)', 'Lagos State University (LASU)', 'Covenant University', 'Babcock University', 'University of Benin (UNIBEN)', 'Rivers State University', 'Other'];
const CONDITIONS = ['All', 'new', 'fairly-used', 'used'];
const CONDITION_LABELS = { 'All': 'Any Condition', 'new': 'Brand New', 'fairly-used': 'Fairly Used', 'used': 'Used' };

export default function HomePage() {
  const { dark } = useTheme();
  const th = t(dark);
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
    let query = supabase.from('products')
      .select('*, profiles(full_name, is_verified, university, whatsapp_number)')
      .eq('is_available', true).gt('quantity', 0);
    if (category !== 'All') query = query.eq('category', category);
    if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
    else if (sortBy === 'price_asc') query = query.order('price', { ascending: true });
    else if (sortBy === 'price_desc') query = query.order('price', { ascending: false });
    const { data } = await query.limit(60);
    setProducts(data || []);
    setLoading(false);
  }

  const activeFilterCount = [university !== 'All Universities', condition !== 'All', priceMin !== '', priceMax !== '', verifiedOnly].filter(Boolean).length;
  const clearFilters = () => { setUniversity('All Universities'); setCondition('All'); setPriceMin(''); setPriceMax(''); setVerifiedOnly(false); };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchUni = university === 'All Universities' || p.profiles?.university === university;
    const matchCond = condition === 'All' || p.condition === condition;
    const matchMin = priceMin === '' || p.price >= Number(priceMin);
    const matchMax = priceMax === '' || p.price <= Number(priceMax);
    const matchVerified = !verifiedOnly || p.profiles?.is_verified;
    return matchSearch && matchUni && matchCond && matchMin && matchMax && matchVerified;
  });

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${th.inputBorder}`, background: th.input, color: th.text, fontSize: 14, outline: 'none' };
  const sel = { ...inp, cursor: 'pointer', appearance: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
      {/* Header */}
      <div style={{ background: th.bgCard, borderBottom: `1px solid ${th.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 0' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px', marginBottom: 4 }}>
            Buy & Sell on Campus 🇳🇬
          </h1>
          <p style={{ color: th.textSub, fontSize: 14, marginBottom: 16 }}>Connect with students at your university.</p>

          {/* Search row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: th.textMuted }} />
              <input type="text" placeholder="Search phones, books, clothes..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inp, paddingLeft: 38 }} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: th.textMuted }}><X size={14} /></button>}
            </div>
            <div style={{ position: 'relative' }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...sel, padding: '10px 28px 10px 12px', width: 'auto' }}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: th.textMuted, pointerEvents: 'none' }} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, border: `1px solid ${showFilters || activeFilterCount > 0 ? '#16a34a' : th.inputBorder}`,
              background: showFilters || activeFilterCount > 0 ? '#16a34a' : th.input, color: showFilters || activeFilterCount > 0 ? '#fff' : th.textSub, cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}>
              <SlidersHorizontal size={15} />
              {activeFilterCount > 0 && <span style={{ background: '#fff', color: '#16a34a', width: 18, height: 18, borderRadius: '50%', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFilterCount}</span>}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div style={{ background: th.bgHover, border: `1px solid ${th.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
                {[['University', university, setUniversity, UNIVERSITIES], ['Condition', condition, setCondition, CONDITIONS.map(c => ({ value: c, label: CONDITION_LABELS[c] }))]].map(([label, val, setter, opts]) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: th.textSub, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <select value={val} onChange={e => setter(e.target.value)} style={sel}>
                        {opts.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: th.textMuted, pointerEvents: 'none' }} />
                    </div>
                  </div>
                ))}
                {[['Min Price (₦)', priceMin, setPriceMin, '0'], ['Max Price (₦)', priceMax, setPriceMax, 'Any']].map(([label, val, setter, ph]) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: th.textSub, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
                    <input type="number" placeholder={ph} value={val} onChange={e => setter(e.target.value)} style={inp} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div onClick={() => setVerifiedOnly(!verifiedOnly)} style={{ width: 36, height: 20, borderRadius: 100, background: verifiedOnly ? '#16a34a' : th.inputBorder, position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: 2, left: verifiedOnly ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontSize: 13, color: th.text, fontWeight: 600 }}>Verified sellers only</span>
                </label>
                {activeFilterCount > 0 && <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Clear filters</button>}
              </div>
            </div>
          )}

          {/* Category Pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                flexShrink: 0, padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: category === cat ? '#16a34a' : th.bgHover,
                color: category === cat ? '#fff' : th.textSub,
                boxShadow: category === cat ? '0 2px 8px rgba(22,163,74,0.3)' : 'none',
              }}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} style={{ background: th.bgCard, borderRadius: 20, overflow: 'hidden', border: `1px solid ${th.border}` }}>
                <div style={{ aspectRatio: '4/3', background: th.bgHover }} />
                <div style={{ padding: 14 }}>
                  {[60, 80, 40].map((w, j) => <div key={j} style={{ height: j === 1 ? 14 : 12, background: th.bgHover, borderRadius: 6, marginBottom: 8, width: `${w}%` }} />)}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 32px' }}>
            <div style={{ width: 64, height: 64, background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Package size={28} color={th.textMuted} />
            </div>
            <h3 style={{ fontWeight: 800, color: th.text, marginBottom: 6 }}>No items found</h3>
            <p style={{ color: th.textSub, fontSize: 14 }}>Try a different search or filter</p>
            {activeFilterCount > 0 && <button onClick={clearFilters} style={{ marginTop: 12, background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Clear filters</button>}
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: th.textMuted, marginBottom: 16, fontWeight: 600 }}>{filtered.length} {filtered.length === 1 ? 'item' : 'items'} found</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {filtered.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}