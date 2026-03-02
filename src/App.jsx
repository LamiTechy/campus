// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import { LoginPage, SignUpPage } from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SellPage from './pages/SellPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import SellerPage from './pages/SellerPage';
import AdminPage from './pages/AdminPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Load Paystack script globally
const script = document.createElement('script');
script.src = 'https://js.paystack.co/v1/inline.js';
document.head.appendChild(script);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" replace />;
}

function WithNav({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  );
}

function AppLayout() {
  return (
    <Routes>
      {/* Secret admin route — no Navbar */}
      <Route path="/admin-kyc-panel-9x2z" element={<AdminPage />} />

      {/* Regular routes */}
      <Route path="/" element={<WithNav><HomePage /></WithNav>} />
      <Route path="/login" element={<WithNav><GuestRoute><LoginPage /></GuestRoute></WithNav>} />
      <Route path="/signup" element={<WithNav><GuestRoute><SignUpPage /></GuestRoute></WithNav>} />
      <Route path="/dashboard" element={<WithNav><ProtectedRoute><DashboardPage /></ProtectedRoute></WithNav>} />
      <Route path="/sell" element={<WithNav><ProtectedRoute><SellPage /></ProtectedRoute></WithNav>} />
      <Route path="/profile" element={<WithNav><ProtectedRoute><ProfilePage /></ProtectedRoute></WithNav>} />
      <Route path="/orders" element={<WithNav><ProtectedRoute><OrdersPage /></ProtectedRoute></WithNav>} />
      <Route path="/seller/:sellerId" element={<WithNav><SellerPage /></WithNav>} />
      <Route path="/product/:productId" element={<WithNav><ProductDetailPage /></WithNav>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}