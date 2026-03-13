// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Plus, User, LogOut, Menu, X, Store, CheckCircle, Package, BarChart2, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, t } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { dark } = useTheme();
  const th = t(dark);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => { await signOut(); navigate('/'); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    padding: '8px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600,
    textDecoration: 'none', transition: 'all 0.15s',
    background: isActive(path) ? th.greenLight : 'transparent',
    color: isActive(path) ? th.greenText : th.textSub,
  });

  const mobileLinkStyle = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px', borderRadius: 12, fontSize: 15, fontWeight: 600,
    textDecoration: 'none', color: th.text, transition: 'background 0.15s',
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: th.bgCard,
      borderBottom: `1px solid ${th.border}`,
      boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}>
              <Store size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px', color: th.text }}>
              Campus<span style={{ color: '#16a34a' }}>Plug</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hide-on-mobile">
            <Link to="/marketplace" style={navLinkStyle('/marketplace')}>Browse</Link>
            {user && (
              <>
                <Link to="/orders" style={navLinkStyle('/orders')}>My Orders</Link>
                <Link to="/transactions" style={navLinkStyle('/transactions')}>Transactions</Link>
                <Link to="/dashboard" style={navLinkStyle('/dashboard')}>My Listings</Link>
                <Link to="/sell" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', background: '#16a34a', color: '#fff',
                  borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  marginLeft: 4, boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                }}>
                  <Plus size={15} /> Sell Item
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                  <ThemeToggle />
                  <NotificationBell />
                  <Link to="/profile" style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: th.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none', position: 'relative', border: `2px solid ${th.border}`,
                  }}>
                    <span style={{ color: th.greenText, fontWeight: 800, fontSize: 13 }}>
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                    {profile?.is_verified && (
                      <span style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${th.bgCard}` }}>
                        <CheckCircle size={9} color="#fff" />
                      </span>
                    )}
                    {profile?.is_pro && (
                      <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 10 }}>👑</span>
                    )}
                  </Link>
                  <button onClick={handleSignOut} style={{
                    width: 36, height: 36, borderRadius: 10, border: `1px solid ${th.border}`,
                    background: 'transparent', color: th.textSub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }} title="Sign Out">
                    <LogOut size={17} />
                  </button>
                </div>
              </>
            )}
            {!user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                <ThemeToggle />
                <Link to="/login" style={{ padding: '9px 16px', fontSize: 14, fontWeight: 600, color: th.textSub, textDecoration: 'none', borderRadius: 10 }}>Login</Link>
                <Link to="/signup" style={{ padding: '9px 16px', background: '#16a34a', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="show-on-mobile">
            <ThemeToggle />
            {user && <NotificationBell />}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              width: 38, height: 38, borderRadius: 10, border: `1px solid ${th.border}`,
              background: 'transparent', color: th.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          borderTop: `1px solid ${th.border}`, background: th.bgCard,
          padding: '12px 16px 20px',
        }}>
          <Link to="/marketplace" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>
            <ShoppingBag size={18} color={th.textSub} /> Browse
          </Link>
          {user ? (
            <>
              <Link to="/sell" onClick={() => setMenuOpen(false)} style={{ ...mobileLinkStyle, background: th.greenLight, color: th.greenText, marginBottom: 4 }}>
                <Plus size={18} /> Sell Item
              </Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}><Package size={18} color={th.textSub} /> My Orders</Link>
              <Link to="/transactions" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}><BarChart2 size={18} color={th.textSub} /> Transactions</Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}><Store size={18} color={th.textSub} /> My Listings</Link>
              <Link to="/subscription" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}><Crown size={18} color={th.textSub} /> Subscription</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}><User size={18} color={th.textSub} /> Profile</Link>
              <button onClick={handleSignOut} style={{ ...mobileLinkStyle, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', width: '100%' }}>
                <LogOut size={18} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} style={{ ...mobileLinkStyle, background: '#16a34a', color: '#fff', justifyContent: 'center', borderRadius: 12 }}>Sign Up</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .show-on-mobile { display: none !important; } }
        @media (max-width: 767px) { .hide-on-mobile { display: none !important; } }
      `}</style>
    </nav>
  );
}