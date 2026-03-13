// src/pages/DashboardPage.jsx — Seller listings page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, TrendingUp, Eye, Crown, CheckCircle, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';

const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [user]);

  async function fetchData() {
    if (!user) return;
    const [{ data: prods }, { data: ords }] = await Promise.all([
      supabase.from('products').select('*, profiles(full_name, is_verified)').eq('seller_id', user.id).order('created_at', { ascending: false }),
      supabase.from('orders').select('id, status, seller_amount').eq('seller_id', user.id),
    ]);
    setProducts(prods || []);
    setOrders(ords || []);
    setLoading(false);
  }

  const handleDelete = (id) => setProducts(prev => prev.filter(p => p.id !== id));
  const totalValue    = products.reduce((s, p) => s + p.price, 0);
  const totalSales    = orders.filter(o => o.status === 'completed').length;
  const totalEarnings = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.seller_amount || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px' }}>My Listings</h1>
              {profile?.is_pro && (
                <span style={{ background: 'rgba(234,179,8,0.15)', color: '#ca8a04', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100, border: '1px solid rgba(234,179,8,0.2)' }}>👑 Pro</span>
              )}
            </div>
            <p style={{ color: th.textSub, fontSize: 13 }}>
              {profile?.full_name ? `Hey ${profile.full_name.split(' ')[0]} 👋` : 'Manage your items for sale'}
            </p>
          </div>
          <Link to="/sell" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#16a34a', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
            <Plus size={16} /> New Listing
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { icon: <Package size={17} color={th.greenText} />, label: 'Listings', value: products.length },
            { icon: <Eye size={17} color={th.greenText} />, label: 'Active', value: products.filter(p => p.is_available).length },
            { icon: <TrendingUp size={17} color={th.greenText} />, label: 'Total Value', value: fmt(totalValue) },
            { icon: <CheckCircle size={17} color={th.greenText} />, label: 'Sales', value: totalSales },
            { icon: <Tag size={17} color={th.greenText} />, label: 'Earnings', value: fmt(totalEarnings) },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 18, padding: '18px 16px', boxShadow: th.shadow }}>
              <div style={{ width: 34, height: 34, background: th.greenLight, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{icon}</div>
              <p style={{ fontSize: 11, color: th.textSub, fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 900, color: th.text, letterSpacing: '-0.3px' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Pro upsell */}
        {!profile?.is_pro && (
          <Link to="/subscription" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: dark ? 'rgba(22,163,74,0.07)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.2)' : '#bbf7d0'}`, borderRadius: 14, padding: '14px 18px', marginBottom: 24, textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Crown size={17} color={th.greenText} />
              <span style={{ fontWeight: 700, color: th.text, fontSize: 13 }}>Upgrade to Pro · Unlimited listings + verified badge</span>
            </div>
            <span style={{ color: th.greenText, fontWeight: 700, fontSize: 13 }}>₦1,500/mo →</span>
          </Link>
        )}

        {/* Products grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ background: th.bgCard, borderRadius: 20, overflow: 'hidden', border: `1px solid ${th.border}` }}>
                <div style={{ aspectRatio: '4/3', background: th.bgHover }} />
                <div style={{ padding: 14 }}>
                  <div style={{ height: 10, background: th.bgHover, borderRadius: 6, marginBottom: 8, width: '60%' }} />
                  <div style={{ height: 14, background: th.bgHover, borderRadius: 6, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 24, padding: '56px 32px', textAlign: 'center', boxShadow: th.shadow }}>
            <div style={{ width: 64, height: 64, background: th.greenLight, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Package size={32} color={th.greenText} />
            </div>
            <h3 style={{ fontWeight: 800, color: th.text, marginBottom: 8 }}>No listings yet</h3>
            <p style={{ color: th.textSub, fontSize: 14, marginBottom: 24 }}>Start selling! List your first item in minutes.</p>
            <Link to="/sell" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#16a34a', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <Plus size={16} /> Create Listing
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}