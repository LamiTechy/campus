// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, TrendingUp, Eye, Crown, ShoppingBag, Clock, CheckCircle, XCircle, Tag, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';

const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

// ── Seller Dashboard ──
function SellerDashboard({ user, profile, th, dark }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [user]);

  async function fetchData() {
    if (!user) return;
    const [{ data: prods }, { data: ords }] = await Promise.all([
      supabase.from('products').select('*, profiles(full_name, is_verified)').eq('seller_id', user.id).order('created_at', { ascending: false }),
      supabase.from('orders').select('*, products(title, price, images)').eq('seller_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]);
    setProducts(prods || []);
    setOrders(ords || []);
    setLoading(false);
  }

  const handleDelete = (id) => setProducts(prev => prev.filter(p => p.id !== id));
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const totalSold = orders.filter(o => o.status === 'completed').length;
  const totalEarnings = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.seller_amount || 0), 0);

  const statCard = (icon, label, value, sub) => (
    <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: '20px 20px', boxShadow: th.shadow }}>
      <div style={{ width: 36, height: 36, background: th.greenLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        {icon}
      </div>
      <p style={{ fontSize: 11, color: th.textSub, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
      <p style={{ fontSize: '1.4rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: th.textMuted, marginTop: 2 }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px' }}>
                {profile?.full_name ? `Hey ${profile.full_name.split(' ')[0]} 👋` : 'Seller Dashboard'}
              </h1>
              <span style={{ background: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 100, border: `1px solid ${dark ? 'rgba(22,163,74,0.3)' : '#bbf7d0'}` }}>
                🏷️ Seller
              </span>
              {profile?.is_pro && (
                <span style={{ background: 'rgba(234,179,8,0.15)', color: '#ca8a04', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100, border: '1px solid rgba(234,179,8,0.2)' }}>👑 Pro</span>
              )}
            </div>
            <p style={{ color: th.textSub, fontSize: 13 }}>Manage your listings and track your sales</p>
          </div>
          <Link to="/sell" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#16a34a', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
            <Plus size={16} /> New Listing
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
          {statCard(<Package size={17} color={th.greenText} />, 'Total Listings', products.length)}
          {statCard(<TrendingUp size={17} color={th.greenText} />, 'Total Value', fmt(totalValue))}
          {statCard(<Eye size={17} color={th.greenText} />, 'Active', products.filter(p => p.is_available).length)}
          {statCard(<CheckCircle size={17} color={th.greenText} />, 'Sales', totalSold)}
          {statCard(<Tag size={17} color={th.greenText} />, 'Earnings', fmt(totalEarnings), 'after platform fee')}
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

        {/* Recent orders */}
        {orders.length > 0 && (
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: '20px 20px', marginBottom: 24, boxShadow: th.shadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, color: th.text }}>Recent Orders</h3>
              <Link to="/orders" style={{ fontSize: 13, color: th.greenText, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={13} /></Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {orders.map(o => {
                const statusColor = { pending: '#f59e0b', confirmed: '#3b82f6', completed: '#16a34a', cancelled: '#ef4444' }[o.status] || '#6b7280';
                return (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: th.bgHover, borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: th.border, overflow: 'hidden', flexShrink: 0 }}>
                      {o.products?.images?.[0] && <img src={o.products.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: th.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.products?.title || 'Item'}</p>
                      <p style={{ fontSize: 12, color: th.textMuted }}>{fmt(o.amount || o.products?.price || 0)}</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: `${statusColor}18`, padding: '3px 10px', borderRadius: 100, flexShrink: 0 }}>
                      {o.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Listings */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: th.text }}>My Listings</h3>
        </div>
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

// ── Buyer Dashboard ──
function BuyerDashboard({ user, profile, th, dark }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, [user]);

  async function fetchOrders() {
    if (!user) return;
    const { data } = await supabase
      .from('orders')
      .select('*, products(title, price, images, seller_id, profiles(full_name))')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  const pending = orders.filter(o => o.status === 'pending').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const totalSpent = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.amount || 0), 0);

  const statusColor = { pending: '#f59e0b', confirmed: '#3b82f6', completed: '#16a34a', cancelled: '#ef4444' };

  return (
    <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px' }}>
              {profile?.full_name ? `Hey ${profile.full_name.split(' ')[0]} 👋` : 'My Dashboard'}
            </h1>
            <span style={{ background: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: '#3b82f6', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 100, border: `1px solid ${dark ? 'rgba(59,130,246,0.3)' : '#bfdbfe'}` }}>
              🛍️ Buyer
            </span>
          </div>
          <p style={{ color: th.textSub, fontSize: 13 }}>Track your orders and purchases</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { icon: <ShoppingBag size={17} color={th.greenText} />, label: 'Total Orders', value: orders.length },
            { icon: <Clock size={17} color="#f59e0b" />, label: 'Pending', value: pending },
            { icon: <CheckCircle size={17} color="#16a34a" />, label: 'Completed', value: completed },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 18, padding: '18px 16px', boxShadow: th.shadow }}>
              <div style={{ width: 34, height: 34, background: th.greenLight, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{icon}</div>
              <p style={{ fontSize: 11, color: th.textSub, fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 900, color: th.text }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Total spent */}
        {totalSpent > 0 && (
          <div style={{ background: dark ? 'rgba(22,163,74,0.07)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.2)' : '#bbf7d0'}`, borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={17} color={th.greenText} />
            <span style={{ fontSize: 14, fontWeight: 700, color: th.text }}>Total spent: {fmt(totalSpent)}</span>
          </div>
        )}

        {/* CTA to browse */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 14, padding: '14px 18px', marginBottom: 28, textDecoration: 'none', boxShadow: th.shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={17} color={th.greenText} />
            <span style={{ fontWeight: 700, color: th.text, fontSize: 14 }}>Browse campus listings</span>
          </div>
          <ArrowRight size={16} color={th.greenText} />
        </Link>

        {/* Orders list */}
        <h3 style={{ fontWeight: 800, fontSize: 15, color: th.text, marginBottom: 16 }}>My Orders</h3>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} style={{ background: th.bgCard, borderRadius: 14, padding: 16, border: `1px solid ${th.border}`, height: 64 }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 20, padding: '52px 32px', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, background: th.greenLight, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShoppingBag size={28} color={th.greenText} />
            </div>
            <h3 style={{ fontWeight: 800, color: th.text, marginBottom: 8 }}>No orders yet</h3>
            <p style={{ color: th.textSub, fontSize: 14, marginBottom: 20 }}>Find something you like on campus!</p>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: '#16a34a', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Browse Listings
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map(o => (
              <div key={o.id} style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: th.shadow }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, background: th.bgHover, overflow: 'hidden', flexShrink: 0 }}>
                  {o.products?.images?.[0] && <img src={o.products.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: th.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.products?.title || 'Item'}</p>
                  <p style={{ fontSize: 12, color: th.textMuted }}>Seller: {o.products?.profiles?.full_name || '—'} · {fmt(o.amount || 0)}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[o.status] || '#6b7280', background: `${statusColor[o.status] || '#6b7280'}18`, padding: '3px 10px', borderRadius: 100 }}>
                    {o.status}
                  </span>
                  <span style={{ fontSize: 11, color: th.textMuted }}>{new Date(o.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export — auto-routes to buyer or seller ──
export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${th.border}`, borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const role = profile.role || 'buyer';

  return role === 'seller'
    ? <SellerDashboard user={user} profile={profile} th={th} dark={dark} />
    : <BuyerDashboard user={user} profile={profile} th={th} dark={dark} />;
}