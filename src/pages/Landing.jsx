import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet, BarChart3, PiggyBank, MessageSquare,
  Zap, Shield, TrendingUp, ArrowRight, Check
} from "lucide-react";

function DashboardMockup() {
  const bars = [65, 40, 80, 55, 70, 45, 90];
  const days = ['M','T','W','T','F','S','S'];
  return (
    <div style={{
      background:'#fff', borderRadius:20, padding:24,
      boxShadow:'0 32px 80px rgba(0,0,0,0.14)',
      border:'1px solid #E5E7EB', width:'100%', maxWidth:440,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30,height:30,borderRadius:8,background:'#3B82F6',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Wallet size={14} color="white" />
          </div>
          <span style={{ fontSize:14,fontWeight:700,color:'#111827' }}>SmartSpend</span>
        </div>
      </div>
      <div style={{ background:'linear-gradient(135deg,#3B82F6,#8B5CF6)',borderRadius:14,padding:'18px 20px',marginBottom:16,color:'white' }}>
        <p style={{ margin:'0 0 2px',fontSize:11,color:'white',textTransform:'uppercase',letterSpacing:'0.5px' }}>Monthly Budget</p>
        <p style={{ margin:'0 0 12px',fontSize:28,fontWeight:800,color:'white' }}>M6,500.00</p>
        <div style={{ display:'flex',gap:20 }}>
          <div><p style={{ margin:0,fontSize:10,color:'white' }}>Spent</p><p style={{ margin:0,fontSize:14,fontWeight:700,color:'white' }}>M2,393.19</p></div>
          <div><p style={{ margin:0,fontSize:10,color:'white' }}>Remaining</p><p style={{ margin:0,fontSize:14,fontWeight:700,color:'white' }}>M4,106.81</p></div>
        </div>
      </div>
      <p style={{ fontSize:11,fontWeight:600,color:'#6B7280',margin:'0 0 10px',textTransform:'uppercase',letterSpacing:'0.5px' }}>This Week</p>
      <div style={{ display:'flex',alignItems:'flex-end',gap:6,height:64,marginBottom:16 }}>
        {bars.map((h,i) => (
          <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
            <div style={{ width:'100%',height:`${h*0.64}px`,borderRadius:4,background:i===6?'#3B82F6':'#EFF6FF' }} />
            <span style={{ fontSize:9,color:'#9CA3AF' }}>{days[i]}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize:11,fontWeight:600,color:'#6B7280',margin:'0 0 8px',textTransform:'uppercase',letterSpacing:'0.5px' }}>Recent</p>
      {[
        { label:'Shoprite Roma',  cat:'Groceries', amt:'231.27', color:'#F59E0B' },
        { label:'Tholo Energy',   cat:'Transport',  amt:'400.00', color:'#3B82F6' },
        { label:'KFC Maseru',     cat:'Food',       amt:'129.99', color:'#EF4444' },
      ].map((t,i) => (
        <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',borderBottom:i<2?'1px solid #F3F4F6':'none' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ width:8,height:8,borderRadius:'50%',background:t.color }} />
            <div>
              <p style={{ margin:0,fontSize:12,fontWeight:600,color:'#111827' }}>{t.label}</p>
              <p style={{ margin:0,fontSize:10,color:t.color }}>{t.cat}</p>
            </div>
          </div>
          <span style={{ fontSize:12,fontWeight:700,color:'#EF4444' }}>-M{t.amt}</span>
        </div>
      ))}
      <div style={{ marginTop:12,padding:'8px 12px',background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:8,display:'flex',alignItems:'center',gap:8 }}>
        <MessageSquare size={13} style={{ color:'#10B981',flexShrink:0 }} />
        <span style={{ fontSize:11,color:'#166534',fontWeight:500 }}>Shoprite M231.27 auto-detected via SMS</span>
      </div>
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const FEATURES = [
    { icon: MessageSquare, color:'#3B82F6', title:'SMS Auto-Detection', desc:'Transactions from FNB, Standard Bank, M-Pesa and Ecocash are detected and categorized automatically.' },
    { icon: BarChart3,     color:'#8B5CF6', title:'Spending Analytics',   desc:'See exactly where your money goes with category breakdowns, weekly trends and budget usage.' },
    { icon: PiggyBank,     color:'#10B981', title:'Savings Goals',         desc:'Set targets for anything — laptop, rent, emergency fund — and track progress in real time.' },
    { icon: Zap,           color:'#F59E0B', title:'Smart Categorization',  desc:'ML automatically assigns the right category to every transaction. No manual entry needed.' },
    { icon: Shield,        color:'#EF4444', title:'Budget Alerts',         desc:'Get notified at 50%, 75%, 90% and 100% of your budget so you never overspend again.' },
    { icon: TrendingUp,    color:'#EC4899', title:'Achievements',          desc:'Earn badges, build streaks and complete challenges that make saving actually enjoyable.' },
  ];

  const STEPS = [
    { n:'01', title:'Sign Up Free',        desc:'Create your account in under a minute. No credit card needed.' },
    { n:'02', title:'Set Your Budget',     desc:'Enter your monthly income and spending categories.' },
    { n:'03', title:'Forward Bank SMS',    desc:'Install SMS Forwarder on your Android and point it to your account.' },
    { n:'04', title:'Watch It Work',       desc:'Every transaction is detected, categorized and tracked automatically.' },
  ];

  return (
    <div style={{ background:'#FAFBFC', minHeight:'100vh', fontFamily:'Inter,DM Sans,sans-serif' }}>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <header style={{
        position:'sticky', top:0, zIndex:50,
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#FAFBFC',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled?'#E5E7EB':'transparent'}`,
        transition:'all 0.2s',
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 32px',
          display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, fontWeight:800, fontSize:18, color:'#111827' }}>
            <div style={{ width:32,height:32,borderRadius:9,background:'#3B82F6',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Wallet size={17} color="white" />
            </div>
            SmartSpend
          </div>
          <nav style={{ display:'flex', gap:28, alignItems:'center' }}>
            {['Features','How It Works'].map(n => (
              <a key={n} href={`#${n.toLowerCase().replace(' ','-')}`}
                style={{ textDecoration:'none', color:'#6B7280', fontSize:14, fontWeight:500 }}
                onMouseEnter={e=>e.target.style.color='#111827'}
                onMouseLeave={e=>e.target.style.color='#6B7280'}>
                {n}
              </a>
            ))}
            <Link to="/login" style={{ textDecoration:'none', color:'#6B7280', fontSize:14, fontWeight:500 }}
              onMouseEnter={e=>e.target.style.color='#111827'}
              onMouseLeave={e=>e.target.style.color='#6B7280'}>
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO — full screen height ──────────────── */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        maxWidth:1200, margin:'0 auto', padding:'0 32px',
        display:'grid', gridTemplateColumns:'1fr 1fr',
        gap:60, alignItems:'center',
      }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6,
            background:'#EFF6FF', border:'1px solid #BFDBFE',
            borderRadius:99, padding:'5px 14px', marginBottom:24,
            fontSize:12, fontWeight:600, color:'#1D4ED8' }}>
            <Zap size={12} /> Smart personal finance — for everyone
          </div>
          <h1 style={{ fontSize:52, fontWeight:800, color:'#111827',
            margin:'0 0 20px', lineHeight:1.1, letterSpacing:'-1.5px' }}>
            Track every maloti.<br />
            <span style={{ color:'#3B82F6' }}>Automatically.</span>
          </h1>
          <p style={{ fontSize:17, color:'#6B7280', margin:'0 0 32px', lineHeight:1.7, maxWidth:460 }}>
            SmartSpend reads your bank SMS from FNB, Standard Bank,
            M-Pesa and Ecocash and tracks your spending automatically
            — no manual entry required.
          </p>
          <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
            <Link to="/signup" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'13px 26px', borderRadius:12, fontSize:15, fontWeight:700,
              background:'#3B82F6', color:'white', textDecoration:'none', transition:'all 0.15s',
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#2563EB'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#3B82F6'; e.currentTarget.style.transform='translateY(0)'; }}>
              Sign Up <ArrowRight size={16} />
            </Link>
            <Link to="/login" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'13px 26px', borderRadius:12, fontSize:15, fontWeight:600,
              background:'transparent', color:'#3B82F6', textDecoration:'none',
              border:'1.5px solid #3B82F6', transition:'all 0.15s',
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#EFF6FF'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
              Sign In
            </Link>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
          <DashboardMockup />
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────── */}
      <section id="features" style={{ maxWidth:1200, margin:'0 auto', padding:'80px 32px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 style={{ fontSize:36,fontWeight:800,color:'#111827',margin:'0 0 12px',letterSpacing:'-0.5px' }}>
            Everything you need
          </h2>
          <p style={{ fontSize:16,color:'#6B7280',margin:0 }}>
            Powerful features that work automatically in the background
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
          {FEATURES.map((f,i) => {
            const Icon = f.icon;
            return (
              <div key={i} style={{ padding:'22px 24px', background:'white',
                border:'1px solid #E5E7EB', borderRadius:16, transition:'all 0.15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=f.color+'60'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ width:40,height:40,borderRadius:11,background:f.color+'12',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14 }}>
                  <Icon size={19} style={{ color:f.color }} />
                </div>
                <h3 style={{ fontSize:15,fontWeight:700,color:'#111827',margin:'0 0 7px' }}>{f.title}</h3>
                <p style={{ fontSize:13,color:'#6B7280',margin:0,lineHeight:1.6 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section id="how-it-works" style={{ background:'#F8FAFF',
        borderTop:'1px solid #E5E7EB', borderBottom:'1px solid #E5E7EB' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'80px 32px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }}>
            {STEPS.map((s,i) => (
              <div key={i} style={{ position:'relative' }}>
                {i < 3 && (
                  <div style={{ position:'absolute', top:20, left:'55%', width:'90%',
                    height:1, background:'#DBEAFE', zIndex:0 }} />
                )}
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ width:42,height:42,borderRadius:12,background:'#3B82F6',
                    color:'white',display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:14,fontWeight:800,marginBottom:16 }}>{s.n}</div>
                  <h3 style={{ fontSize:15,fontWeight:700,color:'#111827',margin:'0 0 7px' }}>{s.title}</h3>
                  <p style={{ fontSize:13,color:'#6B7280',margin:0,lineHeight:1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer style={{ background:'#111827', borderTop:'1px solid #1F2937' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 32px 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:40, marginBottom:32 }}>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:9,marginBottom:14,fontWeight:800,fontSize:17,color:'white' }}>
                <div style={{ width:30,height:30,borderRadius:8,background:'#3B82F6',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <Wallet size={15} color="white" />
                </div>
                SmartSpend
              </div>
              <p style={{ fontSize:13,color:'#6B7280',margin:0,lineHeight:1.7,maxWidth:280 }}>
                Empowering people to take control of their financial future through smart automation.
              </p>
            </div>
            <div>
              <p style={{ fontSize:12,fontWeight:700,color:'#9CA3AF',margin:'0 0 14px',textTransform:'uppercase',letterSpacing:'0.5px' }}>Product</p>
              {['Features','How It Works','Sign Up'].map(item => (
                <a key={item} href="#" style={{ display:'block',fontSize:13,color:'#6B7280',textDecoration:'none',marginBottom:9 }}
                  onMouseEnter={e=>e.target.style.color='white'}
                  onMouseLeave={e=>e.target.style.color='#6B7280'}>{item}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize:12,fontWeight:700,color:'#9CA3AF',margin:'0 0 14px',textTransform:'uppercase',letterSpacing:'0.5px' }}>Support</p>
              {['Privacy Policy','Terms of Service','Contact Us'].map(item => (
                <a key={item} href="#" style={{ display:'block',fontSize:13,color:'#6B7280',textDecoration:'none',marginBottom:9 }}
                  onMouseEnter={e=>e.target.style.color='white'}
                  onMouseLeave={e=>e.target.style.color='#6B7280'}>{item}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'1px solid #1F2937',paddingTop:20,
            display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
            <p style={{ fontSize:12,color:'#4B5563',margin:0 }}>© 2026 SmartSpend. All rights reserved.</p>
            <p style={{ fontSize:12,color:'#4B5563',margin:0 }}>Built with care for better financial lives.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}