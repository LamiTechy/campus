// src/pages/SellerPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useTheme, t } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';

export default function SellerPage() {
  const { sellerId } = useParams();
  const { dark } = useTheme();
  const th = t(dark);
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSellerData(); }, [sellerId]);

  async function fetchSellerData() {
    setLoading(true);
    const [{ data: profile }, { data: listings }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', sellerId).single(),
      supabase.from('products').select('*, profiles(full_name, is_verified, whatsapp_number)').eq('seller_id', sellerId).eq('is_available', true).order('created_at', { ascending: false }),
    ]);
    setSeller(profile); setProducts(listings || []); setLoading(false);
  }

  const handleDelete = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  if (loading) return <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={28} color="#16a34a" style={{ animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if (!seller) return <div style={{ minHeight: '100vh', background: th.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: th.textSub }}>Seller not found</p></div>;

  return (
    <div style={{ minHeight: '100vh', background: th.bg, transition: 'background 0.3s' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        {/* Seller card */}
        <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 24, padding: 24, marginBottom: 32, boxShadow: th.shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: th.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: th.greenText }}>{seller.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: th.text }}>{seller.full_name || 'Seller'}</h1>
                {seller.is_verified && <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: 'rgba(22,163,74,0.12)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.25)' }}><CheckCircle size={11} /> Verified Student</span>}
              </div>
              {seller.university && <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: th.textSub, fontSize: 13, marginBottom: 4 }}><MapPin size={13} />{seller.university}</div>}
              <p style={{ color: th.textMuted, fontSize: 13 }}>{products.length} active listing{products.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ background: th.bgCard, border: `1px solid ${th.border}`, borderRadius: 24, padding: '64px 32px', textAlign: 'center' }}>
            <p style={{ color: th.textSub, fontWeight: 600 }}>No active listings</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {products.map(product => <ProductCard key={product.id} product={product} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  );
}