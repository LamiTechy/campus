// src/pages/SellPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function SellPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
  const [listingCount, setListingCount] = useState(null);
  const [loading, setLoading] = useState(true);

  const FREE_LIMIT = 3;
  const isPro = profile?.is_pro;

  useEffect(() => { if (user) fetchCount(); }, [user]);

  async function fetchCount() {
    const { count } = await supabase
      .from('products').select('*', { count: 'exact', head: true }).eq('seller_id', user.id);
    setListingCount(count || 0);
    setLoading(false);
  }

  const isLimited = !isPro && listingCount >= FREE_LIMIT;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: th.text, letterSpacing: '-0.5px' }}>List an Item</h1>
            <p style={{ color: th.textSub, fontSize: 14, marginTop: 2 }}>Fill in the details to start selling</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Free limit bar */}
        {!isPro && (
          <div style={{
            background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 14,
            padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: th.text }}>{listingCount}/{FREE_LIMIT} free listings used</p>
              <div style={{ width: 160, height: 4, background: th.bgHover, borderRadius: 100, marginTop: 6 }}>
                <div style={{ width: `${Math.min((listingCount / FREE_LIMIT) * 100, 100)}%`, height: '100%', background: listingCount >= FREE_LIMIT ? '#ef4444' : '#16a34a', borderRadius: 100, transition: 'width 0.3s' }} />
              </div>
            </div>
            <button onClick={() => navigate('/subscription')} style={{
              background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10,
              padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              Upgrade →
            </button>
          </div>
        )}

        {/* Blocked */}
        {isLimited ? (
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 24, padding: '64px 32px', textAlign: 'center', boxShadow: th.shadow }}>
            <div style={{ width: 56, height: 56, background: th.bgHover, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={24} color={th.textSub} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: th.text, marginBottom: 10 }}>Free limit reached</h2>
            <p style={{ color: th.textSub, fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
              You've used all {FREE_LIMIT} free listings. Upgrade to Pro for unlimited listings + verified badge.
            </p>
            <button onClick={() => navigate('/subscription')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#16a34a', color: '#fff', border: 'none', borderRadius: 14,
              padding: '14px 28px', fontSize: 15, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 0 20px rgba(22,163,74,0.3)',
            }}>
              <Crown size={16} /> Upgrade to Pro · ₦1,500/mo
            </button>
            <button onClick={() => navigate('/dashboard')} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: th.textSub, fontSize: 13, cursor: 'pointer' }}>
              Back to dashboard
            </button>
          </div>
        ) : (
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 24, padding: 24, boxShadow: th.shadow }}>
            <ProductForm onSuccess={() => navigate('/dashboard')} onCancel={() => navigate('/dashboard')} />
          </div>
        )}
      </div>
    </div>
  );
}