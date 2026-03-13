// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, TrendingUp, Eye, Crown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';
import ThemeToggle from '../components/ThemeToggle';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
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
    <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px' }}>My Listings</h1>
            <p style={{ color: th.textSub, fontSize: 14, marginTop: 2 }}>
              {profile?.full_name ? `Hey ${profile.full_name.split(' ')[0]} 👋` : 'Manage your items'}
              {profile?.is_pro && (
                <span style={{ marginLeft: 8, background: 'rgba(234,179,8,0.15)', color: '#ca8a04', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, border: '1px solid rgba(234,179,8,0.2)' }}>
                  👑 Pro
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <ThemeToggle />
            <Link to="/sell" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', background: '#16a34a', color: '#fff',
              borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              boxShadow: dark ? '0 0 20px rgba(22,163,74,0.3)' : '0 2px 8px rgba(22,163,74,0.3)',
            }}>
              <Plus size={16} /> New Listing
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { icon: Package, label: 'Total Listings', value: products.length },
            { icon: TrendingUp, label: 'Total Value', value: formatPrice(totalValue) },
            { icon: Eye, label: 'Active', value: products.filter(p => p.is_available).length },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20,
              padding: '20px 24px', boxShadow: th.shadow,
            }}>
              <div style={{ width: 36, height: 36, background: th.greenLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={18} color={th.greenText} />
              </div>
              <p style={{ fontSize: 12, color: th.textSub, fontWeight: 600, marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Pro upsell */}
        {!profile?.is_pro && (
          <Link to="/subscription" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: dark ? 'rgba(22,163,74,0.08)' : '#f0fdf4',
            border: `1px solid ${dark ? 'rgba(22,163,74,0.2)' : '#bbf7d0'}`,
            borderRadius: 16, padding: '14px 20px', marginBottom: 24, textDecoration: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Crown size={18} color={th.greenText} />
              <span style={{ fontWeight: 700, color: th.text, fontSize: 14 }}>Upgrade to Pro · Unlimited listings + verified badge</span>
            </div>
            <span style={{ color: th.greenText, fontWeight: 700, fontSize: 13 }}>₦1,500/mo →</span>
          </Link>
        )}

        {/* Products */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ background: th.bgCard, borderRadius: 20, overflow: 'hidden', border: `1px solid ${th.border}` }}>
                <div style={{ aspectRatio: '4/3', background: th.bgHover }} />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 12, background: th.bgHover, borderRadius: 6, marginBottom: 8, width: '60%' }} />
                  <div style={{ height: 16, background: th.bgHover, borderRadius: 6, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 24, padding: '64px 32px', textAlign: 'center', boxShadow: th.shadow }}>
            <div style={{ width: 64, height: 64, background: th.greenLight, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Package size={32} color={th.greenText} />
            </div>
            <h3 style={{ fontWeight: 800, color: th.text, marginBottom: 8 }}>No listings yet</h3>
            <p style={{ color: th.textSub, fontSize: 14, marginBottom: 24 }}>Start selling! List your first item in minutes.</p>
            <Link to="/sell" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', background: '#16a34a', color: '#fff',
              borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}>
              <Plus size={16} /> Create Listing
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}