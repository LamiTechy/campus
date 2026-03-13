// src/pages/LandingPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, Shield, Zap, Star, ArrowRight, CheckCircle, ChevronDown, Users, Package, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATS = [
  { value: '500+', label: 'Campus Students' },
  { value: '1,200+', label: 'Items Listed' },
  { value: '10+', label: 'Universities' },
  { value: '₦0', label: 'Buyer Fees' },
];

const FEATURES = [
  { icon: Shield, title: 'Verified Students Only', desc: 'Every seller is verified with their student ID. Buy with confidence.' },
  { icon: Zap, title: 'WhatsApp Instant Connect', desc: 'No middleman. Chat directly with sellers and close deals fast.' },
  { icon: Store, title: 'Your Campus, Your Market', desc: 'Browse items from students at your university first.' },
  { icon: TrendingUp, title: 'Sell & Earn Monthly', desc: 'Pro sellers get unlimited listings, verified badge & featured placement.' },
];

const CATEGORIES = ['📱 Electronics', '📚 Books', '👗 Fashion', '🍔 Food', '🛋️ Furniture', '💄 Beauty', '⚽ Sports', '🔧 Services'];

const TESTIMONIALS = [
  { name: 'Amaka O.', uni: 'UNILAG', text: 'Sold my laptop in 2 hours! CampusPlug is a lifesaver.' },
  { name: 'Tunde B.', uni: 'OAU', text: 'Bought textbooks for half the price. No stress at all.' },
  { name: 'Fatima K.', uni: 'ABU', text: 'The verified badge made buyers trust me instantly. Worth every kobo.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const heroRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "'Clash Display', 'Plus Jakarta Sans', sans-serif", background: '#0a0a0a', color: '#fff', overflowX: 'hidden' }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .glow { box-shadow: 0 0 60px rgba(22,163,74,0.3); }
        .glow-sm { box-shadow: 0 0 20px rgba(22,163,74,0.2); }

        .hero-bg {
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(22,163,74,0.25) 0%, transparent 70%),
                      radial-gradient(ellipse 40% 40% at 80% 80%, rgba(22,163,74,0.08) 0%, transparent 60%),
                      #0a0a0a;
        }

        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(22,163,74,0.15);
        }

        .btn-primary {
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(22,163,74,0.4);
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
        }

        .btn-ghost {
          background: rgba(255,255,255,0.05);
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }

        .floating {
          animation: float 6s ease-in-out infinite;
        }
        .floating-delay {
          animation: float 6s ease-in-out infinite;
          animation-delay: -3s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        .fade-up {
          animation: fadeUp 0.8s ease forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .category-pill {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s;
          cursor: pointer;
          white-space: nowrap;
        }
        .category-pill:hover {
          background: rgba(22,163,74,0.15);
          border-color: rgba(22,163,74,0.3);
          color: #4ade80;
        }

        .testimonial-enter {
          animation: testimonialIn 0.5s ease forwards;
        }
        @keyframes testimonialIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .grid-bg {
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .marquee {
          animation: marquee 20s linear infinite;
          display: flex;
          gap: 12px;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .green-text {
          background: linear-gradient(135deg, #4ade80, #16a34a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.2rem !important; }
          .hide-mobile { display: none !important; }
          .stats-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .nav-btn-ghost { padding: 7px 12px !important; font-size: 12px !important; }
          .nav-btn-primary { padding: 7px 12px !important; font-size: 12px !important; }
          .nav-gap { gap: 6px !important; }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 24px',
        background: scrolled ? 'rgba(10,10,10,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1200px', margin: '0 auto', left: '50%', transform: 'translateX(-50%)', width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>CP</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.5px' }}>
            Campus<span style={{ color: '#4ade80' }}>Plug</span>
          </span>
        </div>
        <div className="nav-gap" style={{ display: 'flex', gap: 12 }}>
          <button className="btn-ghost nav-btn-ghost" onClick={() => navigate('/login')}
            style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
            Log in
          </button>
          <button className="btn-primary nav-btn-primary" onClick={() => navigate('/signup')}
            style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg grid-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative' }}>
        {/* Noise overlay */}
        <div className="noise" style={{ position: 'absolute', inset: 0 }} />

        {/* Floating blobs */}
        <div className="floating" style={{ position: 'absolute', top: '20%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.12), transparent 70%)', filter: 'blur(40px)' }} />
        <div className="floating-delay" style={{ position: 'absolute', bottom: '20%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.08), transparent 70%)', filter: 'blur(30px)' }} />

        <div style={{ maxWidth: 800, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 100, padding: '8px 16px', marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>Nigeria's #1 Campus Marketplace</span>
          </div>

          {/* Title */}
          <h1 className="hero-title fade-up" style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 24 }}>
            Buy & Sell on
            <br />
            <span className="green-text">Your Campus</span>
            <br />
            Instantly
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            Connect with verified students at your university. Buy textbooks, electronics, fashion and more — or start selling today.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <button className="btn-primary glow" onClick={() => navigate('/signup')}
              style={{ padding: '16px 32px', borderRadius: 14, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              Start Shopping Free <ArrowRight size={18} />
            </button>
            <button className="btn-ghost" onClick={() => navigate('/signup')}
              style={{ padding: '16px 32px', borderRadius: 14, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Store size={18} /> Become a Seller
            </button>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            <div style={{ display: 'flex' }}>
              {['A','B','C','D'].map((l, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${i*40+120},50%,40%)`, border: '2px solid #0a0a0a', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{l}</div>
              ))}
            </div>
            <span>500+ students already on CampusPlug</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.4, animation: 'float 2s ease-in-out infinite' }}>
          <span style={{ fontSize: 11, letterSpacing: 2 }}>SCROLL</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* Categories marquee */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
          <div className="marquee">
            {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
              <span key={i} className="category-pill" style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {STATS.map((stat, i) => (
            <div key={i} className="card-hover" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', color: '#4ade80', marginBottom: 8 }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '60px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: '#4ade80', fontWeight: 700, fontSize: 13, letterSpacing: 3, marginBottom: 12 }}>HOW IT WORKS</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>Simple as 1, 2, 3</h2>
        </div>

        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { num: '01', title: 'Create Account', desc: 'Sign up with your university email. Verify your student status.' },
            { num: '02', title: 'Browse or List', desc: 'Shop items from your campus or list yours in under 2 minutes.' },
            { num: '03', title: 'Connect & Deal', desc: 'Chat directly on WhatsApp. Meet on campus. Done.' },
          ].map((step, i) => (
            <div key={i} className="card-hover" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 32, position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '5rem', fontWeight: 900, color: 'rgba(22,163,74,0.08)', position: 'absolute', top: -10, right: 16, lineHeight: 1 }}>{step.num}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 12 }}>STEP {step.num}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12 }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: '#4ade80', fontWeight: 700, fontSize: 13, letterSpacing: 3, marginBottom: 12 }}>FEATURES</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>Built for campus life</h2>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card-hover" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 32, display: 'flex', gap: 20 }}>
              <div style={{ width: 48, height: 48, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0, flexShrink: 0 }}>
                <f.icon size={22} color="#4ade80" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '60px 24px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: '#4ade80', fontWeight: 700, fontSize: 13, letterSpacing: 3, marginBottom: 12 }}>TESTIMONIALS</p>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: 48 }}>Students love it</h2>

        <div className="testimonial-enter" key={activeTestimonial} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: 40 }}>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 20 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#facc15" color="#facc15" />)}
          </div>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', marginBottom: 24, fontStyle: 'italic' }}>
            "{TESTIMONIALS[activeTestimonial].text}"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
              {TESTIMONIALS[activeTestimonial].name[0]}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{TESTIMONIALS[activeTestimonial].name}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{TESTIMONIALS[activeTestimonial].uni}</p>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setActiveTestimonial(i)}
              style={{ width: i === activeTestimonial ? 24 : 8, height: 8, borderRadius: 100, background: i === activeTestimonial ? '#4ade80' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section style={{ padding: '60px 24px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(22,163,74,0.04))', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 28, padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.15), transparent 70%)', filter: 'blur(20px)' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(22,163,74,0.15)', borderRadius: 100, padding: '6px 14px', marginBottom: 24 }}>
            <Star size={12} fill="#4ade80" color="#4ade80" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>PRO SELLER</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12 }}>Start selling for ₦1,500/mo</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, lineHeight: 1.7 }}>Unlimited listings, verified badge, featured placement. Free plan available with up to 3 listings.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {['Unlimited listings', 'Verified badge', 'Featured placement', 'Sales analytics'].map((f, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, padding: '6px 14px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                <CheckCircle size={13} color="#4ade80" /> {f}
              </span>
            ))}
          </div>
          <button className="btn-primary glow" onClick={() => navigate('/signup')}
            style={{ padding: '16px 36px', borderRadius: 14, fontSize: 16, fontWeight: 800 }}>
            Get Started Free →
          </button>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(22,163,74,0.08), transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 16 }}>
            Your campus market<br />is waiting.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 40, fontSize: 16 }}>Join thousands of students buying and selling on CampusPlug.</p>
          <button className="btn-primary glow" onClick={() => navigate('/signup')}
            style={{ padding: '18px 40px', borderRadius: 14, fontSize: 18, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            Join CampusPlug Free <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: '#fff' }}>CP</span>
          </div>
          <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>CampusPlug</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>© 2025 CampusPlug · Nigeria's Campus Marketplace</p>
      </footer>

    </div>
  );
}