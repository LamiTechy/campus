// src/components/OnboardingModal.jsx
// Shows once after new user signs up
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag, ArrowRight, CheckCircle, Shield, Zap, X } from 'lucide-react';
import { useTheme, t } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const SLIDES = [
  {
    emoji: '👋',
    title: 'Welcome to CampusPlug!',
    desc: "Nigeria's #1 campus marketplace. Buy and sell with students at your university.",
    color: '#16a34a',
  },
  {
    emoji: '🛍️',
    title: 'Browse Campus Listings',
    desc: 'Find electronics, books, fashion, food and more — all from verified students on your campus.',
    color: '#3b82f6',
    features: ['Search by category', 'Filter by university', 'See verified sellers'],
  },
  {
    emoji: '🏷️',
    title: 'Sell in Minutes',
    desc: 'List your item with photos, set your price, and connect with buyers directly on WhatsApp.',
    color: '#f59e0b',
    features: ['Free up to 3 listings', 'WhatsApp checkout', 'Pro = unlimited listings'],
  },
  {
    emoji: '🔒',
    title: 'Safe Campus Deals',
    desc: 'Meet on campus, agree on price, pay cash on delivery. Always meet in public places.',
    color: '#8b5cf6',
    features: ['Verified student sellers', 'Meet on campus', 'No advance payment needed'],
  },
];

export default function OnboardingModal({ onDone }) {
  const { dark } = useTheme();
  const th = t(dark);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const handleNext = () => {
    if (isLast) {
      onDone();
    } else {
      setSlide(s => s + 1);
    }
  };

  const handleSkip = () => onDone();

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(6px)', zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  };

  return (
    <div style={overlay}>
      <div style={{
        background: th.bgCard, borderRadius: 28, maxWidth: 400, width: '100%',
        border: `1px solid ${th.border}`, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Color header */}
        <div style={{ background: current.color, padding: '36px 28px 28px', textAlign: 'center', position: 'relative' }}>
          <button onClick={handleSkip} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={14} />
          </button>
          <div style={{ fontSize: 52, marginBottom: 14 }}>{current.emoji}</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.3px', marginBottom: 8 }}>
            {slide === 0 ? `Hey ${firstName}! 👋` : current.title}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{current.desc}</p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>
          {/* Feature list */}
          {current.features && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {current.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${current.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={12} color={current.color} />
                  </div>
                  <span style={{ fontSize: 13, color: th.text, fontWeight: 600 }}>{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* First slide CTAs */}
          {slide === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, padding: '14px 12px', background: dark ? 'rgba(22,163,74,0.1)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.25)' : '#bbf7d0'}`, borderRadius: 14, textAlign: 'center' }}>
                  <ShoppingBag size={20} color="#16a34a" style={{ margin: '0 auto 6px' }} />
                  <p style={{ fontWeight: 800, fontSize: 13, color: th.text, marginBottom: 2 }}>Browse</p>
                  <p style={{ fontSize: 11, color: th.textSub }}>Find great deals</p>
                </div>
                <div style={{ flex: 1, padding: '14px 12px', background: dark ? 'rgba(245,158,11,0.1)' : '#fffbeb', border: `1px solid ${dark ? 'rgba(245,158,11,0.25)' : '#fde68a'}`, borderRadius: 14, textAlign: 'center' }}>
                  <Tag size={20} color="#f59e0b" style={{ margin: '0 auto 6px' }} />
                  <p style={{ fontWeight: 800, fontSize: 13, color: th.text, marginBottom: 2 }}>Sell</p>
                  <p style={{ fontSize: 11, color: th.textSub }}>List your items</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} style={{
                width: i === slide ? 20 : 6, height: 6, borderRadius: 100,
                background: i === slide ? current.color : th.border,
                border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0,
              }} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {slide > 0 && (
              <button onClick={() => setSlide(s => s - 1)} style={{ flex: 1, padding: '12px', border: `1px solid ${th.border}`, background: 'transparent', color: th.textSub, borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Back
              </button>
            )}
            <button onClick={handleNext} style={{
              flex: 2, padding: '13px', background: current.color, color: '#fff',
              border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 4px 14px ${current.color}44`,
            }}>
              {isLast ? '🚀 Get Started!' : <>Next <ArrowRight size={15} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}