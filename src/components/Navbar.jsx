// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Plus, User, LogOut, Menu, X, Store, CheckCircle, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, className = '' }) => (
    <Link to={to} onClick={() => setMenuOpen(false)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(to) ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'} ${className}`}>
      {children}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-green-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:bg-green-700 transition-colors">
              <Store size={18} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900">
              Campus<span className="text-green-600">Plug</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/">Browse</NavLink>
            {user && (
              <>
                <NavLink to="/orders">My Orders</NavLink>
                <NavLink to="/dashboard">My Listings</NavLink>
                <Link to="/sell"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm ml-2">
                  <Plus size={16} /> Sell Item
                </Link>
                <NotificationBell />
                <Link to="/profile" className="flex items-center gap-2 ml-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center relative">
                    <span className="text-green-700 font-bold text-xs">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                    {profile?.is_verified && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={9} className="text-white" />
                      </span>
                    )}
                  </div>
                </Link>
                <button onClick={handleSignOut}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors" title="Sign Out">
                  <LogOut size={18} />
                </button>
              </>
            )}
            {!user && (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Login</Link>
                <Link to="/signup" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
            <ShoppingBag size={18} /> Browse
          </Link>
          {user ? (
            <>
              <Link to="/sell" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg bg-green-50 text-green-700 font-semibold">
                <Plus size={18} /> Sell Item
              </Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                <Package size={18} /> My Orders
              </Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                <Store size={18} /> My Listings
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                <User size={18} /> Profile
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 text-red-600 font-medium w-full">
                <LogOut size={18} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="block px-3 py-3 rounded-lg bg-green-600 text-white font-semibold text-center">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}