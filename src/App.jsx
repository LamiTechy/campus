import { useState, useEffect } from 'react';
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import { LoginPage, SignUpPage } from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SellPage from './pages/SellPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import SellerPage from './pages/SellerPage';
import AdminPage from './pages/AdminPage';
import ProductDetailPage from './pages/ProductDetailPage';
import TransactionsPage from './pages/TransactionsPage';
import InstallBanner from './components/InstallBanner';
import { ThemeProvider } from './context/ThemeContext';
import SubscriptionPage from './pages/SubscriptionPage';
import SupportPage from './pages/SupportPage';
import OnboardingModal from './components/OnboardingModal';

// Load Flutterwave script globally
const script = document.createElement('script');
script.src = 'https://checkout.flutterwave.com/v3.js';
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
  // OnboardingWrapper is at App level
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <InstallBanner />
      {children}
    </div>
  );
}

function AppLayout() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Secret admin route — no Navbar */}
      <Route path="/admin-kyc-panel-9x2z" element={<AdminPage />} />

      {/* Regular routes */}
      <Route path="/" element={user ? <WithNav><HomePage /></WithNav> : <LandingPage />} />
      <Route path="/marketplace" element={<WithNav><HomePage /></WithNav>} />
      <Route path="/login" element={<WithNav><GuestRoute><LoginPage /></GuestRoute></WithNav>} />
      <Route path="/signup" element={<WithNav><GuestRoute><SignUpPage /></GuestRoute></WithNav>} />
      <Route path="/forgot-password" element={<WithNav><GuestRoute><ForgotPasswordPage /></GuestRoute></WithNav>} />
      <Route path="/reset-password" element={<WithNav><ResetPasswordPage /></WithNav>} />
      <Route path="/dashboard" element={<WithNav><ProtectedRoute><DashboardPage /></ProtectedRoute></WithNav>} />
      <Route path="/sell" element={<WithNav><ProtectedRoute><SellPage /></ProtectedRoute></WithNav>} />
      <Route path="/profile" element={<WithNav><ProtectedRoute><ProfilePage /></ProtectedRoute></WithNav>} />
      <Route path="/orders" element={<WithNav><ProtectedRoute><OrdersPage /></ProtectedRoute></WithNav>} />
      <Route path="/transactions" element={<WithNav><ProtectedRoute><TransactionsPage /></ProtectedRoute></WithNav>} />
      <Route path="/subscription" element={<WithNav><ProtectedRoute><SubscriptionPage /></ProtectedRoute></WithNav>} />
      <Route path="/seller/:sellerId" element={<WithNav><SellerPage /></WithNav>} />
      <Route path="/product/:productId" element={<WithNav><ProductDetailPage /></WithNav>} />
      <Route path="/support" element={<WithNav><SupportPage /></WithNav>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function OnboardingWrapper({ children }) {
  const { user, profile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;
    const key = `cp_onboarded_${user.id}`;
    if (!localStorage.getItem(key)) {
      setShowOnboarding(true);
    }
  }, [user, profile]);

  const handleDone = () => {
    localStorage.setItem(`cp_onboarded_${user.id}`, '1');
    setShowOnboarding(false);
  };

  return (
    <>
      {children}
      {showOnboarding && <OnboardingModal onDone={handleDone} />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}