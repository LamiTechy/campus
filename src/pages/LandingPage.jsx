// src/pages/LandingPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Shield, Zap, Star, ArrowRight, CheckCircle, ChevronDown, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 500,  suffix: '+', label: 'Campus Students' },
  { value: 1200, suffix: '+', label: 'Items Listed' },
  { value: 10,   suffix: '+', label: 'Universities' },
  { value: 0,    prefix: '₦', label: 'Buyer Fees' },
];

const FEATURES = [
  { icon: Shield,     title: 'Verified Students Only',   desc: 'Every seller is verified with their student ID. Buy with confidence.' },
  { icon: Zap,        title: 'WhatsApp Instant Connect', desc: 'No middleman. Chat directly with sellers and close deals fast.' },
  { icon: Store,      title: 'Your Campus, Your Market', desc: 'Browse items from students at your university first.' },
  { icon: TrendingUp, title: 'Sell & Earn Monthly',      desc: 'Pro sellers get unlimited listings, verified badge & featured placement.' },
];

const CATEGORIES = ['📱 Electronics','📚 Books','👗 Fashion','🍔 Food','🛋️ Furniture','💄 Beauty','⚽ Sports','🔧 Services'];

const TESTIMONIALS = [
  { name: 'Amaka O.', uni: 'UNILAG', text: 'Sold my laptop in 2 hours! CampusPlug is a lifesaver.' },
  { name: 'Tunde B.', uni: 'OAU',    text: 'Bought textbooks for half the price. No stress at all.' },
  { name: 'Fatima K.', uni: 'ABU',   text: 'The verified badge made buyers trust me instantly. Worth every kobo.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const navRef      = useRef(null);
  const badgeRef    = useRef(null);
  const titleRef    = useRef(null);
  const subRef      = useRef(null);
  const btnsRef     = useRef(null);
  const proofRef    = useRef(null);
  const hintRef     = useRef(null);
  const blob1Ref    = useRef(null);
  const blob2Ref    = useRef(null);
  const statsRef    = useRef(null);
  const stepsRef    = useRef(null);
  const featuresRef = useRef(null);
  const tRef        = useRef(null);
  const pricingRef  = useRef(null);
  const ctaRef      = useRef(null);
  const counters    = useRef([]);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 3500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Navbar
      gsap.from(navRef.current, { y: -60, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 });

      // Hero sequence
      gsap.timeline({ delay: 0.3 })
        .from(badgeRef.current,  { y: 24, opacity: 0, duration: 0.6, ease: 'power2.out' })
        .from(titleRef.current,  { y: 55, opacity: 0, duration: 0.85, ease: 'power3.out' }, '-=0.3')
        .from(subRef.current,    { y: 30, opacity: 0, duration: 0.7,  ease: 'power2.out' }, '-=0.45')
        .from(btnsRef.current,   { y: 22, opacity: 0, duration: 0.6,  ease: 'power2.out' }, '-=0.35')
        .from(proofRef.current,  { y: 14, opacity: 0, duration: 0.5,  ease: 'power2.out' }, '-=0.25')
        .from(hintRef.current,   { opacity: 0, duration: 0.5 }, '-=0.1');

      // Blobs
      gsap.to(blob1Ref.current, { y: -22, x: 12,  duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(blob2Ref.current, { y: 16,  x: -10, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });

      // Stats counter
      ScrollTrigger.create({
        trigger: statsRef.current, start: 'top 80%', once: true,
        onEnter: () => {
          gsap.from('.stat-card', { y: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' });
          counters.current.forEach((el, i) => {
            if (!el || STATS[i].value === 0) return;
            const stat = STATS[i];
            const obj = { val: 0 };
            gsap.to(obj, {
              val: stat.value, duration: 1.8, ease: 'power2.out', delay: i * 0.12,
              onUpdate() { if (el) el.textContent = (stat.prefix || '') + Math.round(obj.val).toLocaleString() + (stat.suffix || ''); },
            });
          });
        },
      });

      // Steps
      gsap.from('.step-card', {
        scrollTrigger: { trigger: stepsRef.current, start: 'top 80%', once: true },
        y: 60, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
      });

      // Features (alternate left/right)
      gsap.from('.feature-card', {
        scrollTrigger: { trigger: featuresRef.current, start: 'top 82%', once: true },
        x: (i) => i % 2 === 0 ? -44 : 44,
        opacity: 0, duration: 0.7, stagger: 0.13, ease: 'power2.out',
      });

      // Testimonials
      gsap.from(tRef.current, {
        scrollTrigger: { trigger: tRef.current, start: 'top 85%', once: true },
        y: 40, opacity: 0, duration: 0.8, ease: 'power2.out',
      });

      // Pricing
      gsap.from(pricingRef.current, {
        scrollTrigger: { trigger: pricingRef.current, start: 'top 85%', once: true },
        scale: 0.94, opacity: 0, duration: 0.8, ease: 'back.out(1.3)',
      });

      // Final CTA
      gsap.from(ctaRef.current, {
        scrollTrigger: { trigger: ctaRef.current, start: 'top 85%', once: true },
        y: 50, opacity: 0, duration: 0.8, ease: 'power3.out',
      });

      // Section labels
      gsap.utils.toArray('.section-label').forEach(el => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#0a0a0a', color: '#fff', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hero-bg {
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(22,163,74,0.25) 0%, transparent 70%),
                      radial-gradient(ellipse 40% 40% at 80% 80%, rgba(22,163,74,0.08) 0%, transparent 60%), #0a0a0a;
        }
        .grid-bg {
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .green-text {
          background: linear-gradient(135deg, #4ade80, #16a34a);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .btn-primary { background: linear-gradient(135deg,#16a34a,#15803d); color:#fff; border:none; cursor:pointer; transition:all 0.2s; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(22,163,74,0.4); }
        .btn-ghost { background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.12); cursor:pointer; transition:all 0.2s; }
        .btn-ghost:hover { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.25); }
        .card-hover { transition:transform 0.3s ease,box-shadow 0.3s ease; }
        .card-hover:hover { transform:translateY(-5px); box-shadow:0 22px 56px rgba(0,0,0,0.5),0 0 28px rgba(22,163,74,0.1); }
        .marquee { animation:marquee 22s linear infinite; display:flex; gap:12px; }
        @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .category-pill { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); transition:all 0.2s; cursor:pointer; white-space:nowrap; }
        .category-pill:hover { background:rgba(22,163,74,0.15); border-color:rgba(22,163,74,0.3); color:#4ade80; }
        .t-swap { animation:tSwap 0.45s ease forwards; }
        @keyframes tSwap { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .glow { box-shadow:0 0 40px rgba(22,163,74,0.25); }
        .pulse-dot { animation:pdot 2s ease-in-out infinite; }
        @keyframes pdot { 0%,100% { box-shadow:0 0 0 0 rgba(74,222,128,0.4); } 50% { box-shadow:0 0 0 6px rgba(74,222,128,0); } }
        @media (max-width:768px) {
          .hero-title { font-size:2.3rem !important; letter-spacing:-1px !important; }
          .hide-mobile { display:none !important; }
          .stats-grid { grid-template-columns:1fr !important; gap:12px !important; }
          .steps-grid { grid-template-columns:1fr !important; gap:14px !important; }
          .features-grid { grid-template-columns:1fr !important; }
          .nav-btn-ghost,.nav-btn-primary { padding:7px 12px !important; font-size:12px !important; }
          .nav-gap { gap:6px !important; }
          .hero-btns { flex-direction:column !important; }
          .pricing-pad { padding:32px 20px !important; }
          .cta-title { font-size:2.2rem !important; }
        }
      `}</style>

      {/* Navbar */}
      <nav ref={navRef} style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background: scrolled ? 'rgba(10,10,10,0.55)' : 'transparent', backdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none', transition:'all 0.3s ease' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:32, background:'linear-gradient(135deg,#16a34a,#15803d)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 10px rgba(22,163,74,0.4)' }}>
            <span style={{ fontSize:13, fontWeight:900, color:'#fff' }}>CP</span>
          </div>
          <span style={{ fontWeight:900, fontSize:18, letterSpacing:'-0.5px' }}>Campus<span style={{ color:'#4ade80' }}>Plug</span></span>
        </div>
        <div className="nav-gap" style={{ display:'flex', gap:10 }}>
          <button className="btn-ghost nav-btn-ghost" onClick={() => navigate('/login')} style={{ padding:'9px 18px', borderRadius:10, fontSize:14, fontWeight:600 }}>Log in</button>
          <button className="btn-primary nav-btn-primary" onClick={() => navigate('/signup')} style={{ padding:'9px 18px', borderRadius:10, fontSize:14, fontWeight:700 }}>Get Started</button>
        </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg grid-bg" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'120px 24px 80px', position:'relative', overflow:'hidden' }}>
        <div ref={blob1Ref} style={{ position:'absolute', top:'14%', right:'7%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(22,163,74,0.14),transparent 70%)', filter:'blur(40px)', pointerEvents:'none' }} />
        <div ref={blob2Ref} style={{ position:'absolute', bottom:'16%', left:'4%', width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,rgba(22,163,74,0.09),transparent 70%)', filter:'blur(30px)', pointerEvents:'none' }} />

        <div style={{ maxWidth:820, textAlign:'center', position:'relative', zIndex:1 }}>
          <div ref={badgeRef} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(22,163,74,0.1)', border:'1px solid rgba(22,163,74,0.25)', borderRadius:100, padding:'8px 18px', marginBottom:32 }}>
            <div className="pulse-dot" style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80' }} />
            <span style={{ fontSize:13, fontWeight:600, color:'#4ade80' }}>Nigeria's #1 Campus Marketplace</span>
          </div>

          <h1 ref={titleRef} className="hero-title" style={{ fontSize:'4.2rem', fontWeight:900, lineHeight:1.05, letterSpacing:'-2px', marginBottom:24 }}>
            Buy & Sell on<br /><span className="green-text">Your Campus</span><br />Instantly
          </h1>

          <p ref={subRef} style={{ fontSize:'1.1rem', color:'rgba(255,255,255,0.5)', lineHeight:1.8, marginBottom:40, maxWidth:520, margin:'0 auto 40px' }}>
            Connect with verified students at your university. Buy textbooks, electronics, fashion and more — or start selling today.
          </p>

          <div ref={btnsRef} className="hero-btns" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:52 }}>
            <button className="btn-primary glow" onClick={() => navigate('/signup')} style={{ padding:'15px 30px', borderRadius:13, fontSize:15, fontWeight:800, display:'flex', alignItems:'center', gap:8 }}>
              Start Shopping Free <ArrowRight size={17} />
            </button>
            <button className="btn-ghost" onClick={() => navigate('/signup')} style={{ padding:'15px 30px', borderRadius:13, fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
              <Store size={17} /> Become a Seller
            </button>
          </div>

          <div ref={proofRef} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, color:'rgba(255,255,255,0.35)', fontSize:13 }}>
            <div style={{ display:'flex' }}>
              {['A','B','C','D'].map((l,i) => (
                <div key={i} style={{ width:28, height:28, borderRadius:'50%', background:`hsl(${i*40+120},50%,38%)`, border:'2px solid #0a0a0a', marginLeft:i>0?-8:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff' }}>{l}</div>
              ))}
            </div>
            <span>500+ students already on CampusPlug</span>
          </div>
        </div>

        <div ref={hintRef} style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:4, opacity:0.3 }}>
          <span style={{ fontSize:10, letterSpacing:2.5, fontWeight:600 }}>SCROLL</span>
          <ChevronDown size={15} />
        </div>
      </section>

      {/* Marquee */}
      <div style={{ background:'rgba(255,255,255,0.02)', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'14px 0', overflow:'hidden' }}>
        <div style={{ display:'flex', gap:12, overflow:'hidden' }}>
          <div className="marquee">
            {[...CATEGORIES,...CATEGORIES].map((cat,i) => (
              <span key={i} className="category-pill" style={{ padding:'8px 16px', borderRadius:100, fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.55)' }}>{cat}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <section ref={statsRef} style={{ padding:'80px 24px', maxWidth:1000, margin:'0 auto' }}>
        <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
          {STATS.map((stat,i) => (
            <div key={i} className="stat-card card-hover" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'32px 24px', textAlign:'center' }}>
              <div ref={el => counters.current[i] = el} style={{ fontSize:'2.5rem', fontWeight:900, letterSpacing:'-1px', color:'#4ade80', marginBottom:8 }}>
                {stat.prefix||''}{stat.value===0?'0':stat.value.toLocaleString()}{stat.suffix||''}
              </div>
              <div style={{ color:'rgba(255,255,255,0.45)', fontSize:14, fontWeight:500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section ref={stepsRef} style={{ padding:'60px 24px', maxWidth:1000, margin:'0 auto' }}>
        <div className="section-label" style={{ textAlign:'center', marginBottom:56 }}>
          <p style={{ color:'#4ade80', fontWeight:700, fontSize:12, letterSpacing:3.5, marginBottom:12 }}>HOW IT WORKS</p>
          <h2 style={{ fontSize:'2.5rem', fontWeight:900, letterSpacing:'-1px' }}>Simple as 1, 2, 3</h2>
        </div>
        <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {[
            { num:'01', title:'Create Account', desc:'Sign up with your university email. Verify your student status.' },
            { num:'02', title:'Browse or List',  desc:'Shop items from your campus or list yours in under 2 minutes.' },
            { num:'03', title:'Connect & Deal',  desc:'Chat directly on WhatsApp. Meet on campus. Done.' },
          ].map((step,i) => (
            <div key={i} className="step-card card-hover" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:32, position:'relative', overflow:'hidden' }}>
              <div style={{ fontSize:'5rem', fontWeight:900, color:'rgba(22,163,74,0.07)', position:'absolute', top:-10, right:16, lineHeight:1, userSelect:'none' }}>{step.num}</div>
              <div style={{ fontSize:12, fontWeight:800, color:'#4ade80', marginBottom:14, letterSpacing:1.5 }}>STEP {step.num}</div>
              <h3 style={{ fontSize:'1.15rem', fontWeight:800, marginBottom:10 }}>{step.title}</h3>
              <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, lineHeight:1.8 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} style={{ padding:'60px 24px', maxWidth:1000, margin:'0 auto' }}>
        <div className="section-label" style={{ textAlign:'center', marginBottom:56 }}>
          <p style={{ color:'#4ade80', fontWeight:700, fontSize:12, letterSpacing:3.5, marginBottom:12 }}>FEATURES</p>
          <h2 style={{ fontSize:'2.5rem', fontWeight:900, letterSpacing:'-1px' }}>Built for campus life</h2>
        </div>
        <div className="features-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:18 }}>
          {FEATURES.map((f,i) => (
            <div key={i} className="feature-card card-hover" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:28, display:'flex', gap:18 }}>
              <div style={{ width:46, height:46, background:'rgba(22,163,74,0.12)', border:'1px solid rgba(22,163,74,0.2)', borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <f.icon size={21} color="#4ade80" />
              </div>
              <div>
                <h3 style={{ fontSize:'1rem', fontWeight:800, marginBottom:8 }}>{f.title}</h3>
                <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, lineHeight:1.75 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section ref={tRef} style={{ padding:'60px 24px', maxWidth:580, margin:'0 auto', textAlign:'center' }}>
        <div className="section-label">
          <p style={{ color:'#4ade80', fontWeight:700, fontSize:12, letterSpacing:3.5, marginBottom:12 }}>TESTIMONIALS</p>
          <h2 style={{ fontSize:'2.4rem', fontWeight:900, letterSpacing:'-1px', marginBottom:44 }}>Students love it</h2>
        </div>
        <div className="t-swap" key={activeTestimonial} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:24, padding:36 }}>
          <div style={{ display:'flex', gap:3, justifyContent:'center', marginBottom:18 }}>
            {[...Array(5)].map((_,i) => <Star key={i} size={15} fill="#facc15" color="#facc15" />)}
          </div>
          <p style={{ fontSize:'1.05rem', lineHeight:1.85, color:'rgba(255,255,255,0.75)', marginBottom:22, fontStyle:'italic' }}>
            "{TESTIMONIALS[activeTestimonial].text}"
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'center' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13 }}>
              {TESTIMONIALS[activeTestimonial].name[0]}
            </div>
            <div style={{ textAlign:'left' }}>
              <p style={{ fontWeight:700, fontSize:13 }}>{TESTIMONIALS[activeTestimonial].name}</p>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>{TESTIMONIALS[activeTestimonial].uni}</p>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:20 }}>
          {TESTIMONIALS.map((_,i) => (
            <button key={i} onClick={() => setActiveTestimonial(i)} style={{ width:i===activeTestimonial?22:7, height:7, borderRadius:100, background:i===activeTestimonial?'#4ade80':'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', transition:'all 0.3s' }} />
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding:'60px 24px', maxWidth:700, margin:'0 auto' }}>
        <div ref={pricingRef} className="pricing-pad" style={{ background:'linear-gradient(135deg,rgba(22,163,74,0.12),rgba(22,163,74,0.04))', border:'1px solid rgba(22,163,74,0.22)', borderRadius:28, padding:'48px 40px', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(22,163,74,0.15),transparent 70%)', filter:'blur(20px)', pointerEvents:'none' }} />
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(22,163,74,0.15)', borderRadius:100, padding:'6px 14px', marginBottom:22 }}>
            <Star size={11} fill="#4ade80" color="#4ade80" />
            <span style={{ fontSize:12, fontWeight:700, color:'#4ade80' }}>PRO SELLER</span>
          </div>
          <h2 style={{ fontSize:'2rem', fontWeight:900, letterSpacing:'-1px', marginBottom:10 }}>Start selling for ₦1,500/mo</h2>
          <p style={{ color:'rgba(255,255,255,0.5)', marginBottom:28, lineHeight:1.7, fontSize:15 }}>Unlimited listings, verified badge, featured placement. Free plan available with up to 3 listings.</p>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:28 }}>
            {['Unlimited listings','Verified badge','Featured placement','Sales analytics'].map((f,i) => (
              <span key={i} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.06)', borderRadius:100, padding:'6px 14px', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.7)' }}>
                <CheckCircle size={12} color="#4ade80" /> {f}
              </span>
            ))}
          </div>
          <button className="btn-primary glow" onClick={() => navigate('/signup')} style={{ padding:'15px 34px', borderRadius:13, fontSize:15, fontWeight:800 }}>
            Get Started Free →
          </button>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 24px', textAlign:'center', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 60% at 50% 50%,rgba(22,163,74,0.07),transparent 70%)', pointerEvents:'none' }} />
        <div ref={ctaRef} style={{ position:'relative', zIndex:1 }}>
          <h2 className="cta-title" style={{ fontSize:'3rem', fontWeight:900, letterSpacing:'-1.5px', marginBottom:14 }}>
            Your campus market<br />is waiting.
          </h2>
          <p style={{ color:'rgba(255,255,255,0.4)', marginBottom:36, fontSize:15 }}>Join thousands of students buying and selling on CampusPlug.</p>
          <button className="btn-primary glow" onClick={() => navigate('/signup')} style={{ padding:'16px 36px', borderRadius:13, fontSize:17, fontWeight:900, display:'inline-flex', alignItems:'center', gap:10 }}>
            Join CampusPlug Free <ArrowRight size={19} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'28px 24px', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
          <div style={{ width:22, height:22, background:'linear-gradient(135deg,#16a34a,#15803d)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:9, fontWeight:900, color:'#fff' }}>CP</span>
          </div>
          <span style={{ fontWeight:800, color:'rgba(255,255,255,0.5)', fontSize:14 }}>CampusPlug</span>
        </div>
        <p style={{ color:'rgba(255,255,255,0.18)', fontSize:12 }}>© 2025 CampusPlug · Nigeria's Campus Marketplace</p>
      </footer>
    </div>
  );
}