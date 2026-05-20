import React, { useState } from 'react';
import { Check, ChevronRight, Calendar } from 'lucide-react';
import { API_BASE } from '../config/api';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function OnboardingWizard({ user, onComplete }) {
  const today = new Date();
  const [step,     setStep]     = useState(0);
  const [budget,   setBudget]   = useState('');
  const [month,    setMonth]    = useState(today.getMonth() + 1);
  const [year,     setYear]     = useState(today.getFullYear());
  const [applyAll, setApplyAll] = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const finish = () => {
    localStorage.setItem(`sb:onboarded:${user?.id}`, '1');
    onComplete?.();
  };

  const saveBudget = async () => {
    if (!budget || Number(budget) <= 0) { setError('Please enter a valid budget amount.'); return; }
    setError(''); setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/set-budget.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:        user?.id,
          monthly_budget: Number(budget),
          month:          applyAll ? 0 : month,
          year:           applyAll ? 0 : year,
        }),
      });
      const data = await res.json();
      if (data.success) setStep(2);
      else setError('Could not save. Please try again.');
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  // Dots indicator
  const Dots = () => (
    <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:28 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: i === step ? 28 : 10, height:10,
          borderRadius:99,
          background: i <= step ? 'var(--primary-main,#3b82f6)' : 'var(--border-main,#e2e8f0)',
          transition:'all 0.3s ease',
        }}/>
      ))}
    </div>
  );

  // ── Step 0: Welcome ─────────────────────────────────────────────────────
  if (step === 0) return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:16 }}>
      <div style={{ background:'var(--bg-primary,white)', borderRadius:20,
        padding:'32px 32px 28px', maxWidth:440, width:'100%',
        boxShadow:'0 24px 60px rgba(0,0,0,0.18)', animation:'sbSlideUp 250ms ease' }}>
        <Dots />
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:64, lineHeight:1, marginBottom:20 }}>👋</div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', margin:'0 0 10px' }}>
            Welcome to SmartSpend!
          </h2>
          <p style={{ fontSize:14, color:'var(--text-secondary)', margin:'0 0 22px', lineHeight:1.6 }}>
            Your personal finance assistant for Lesotho.
          </p>
          <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-light)',
            borderRadius:12, padding:'14px 20px', fontSize:14, color:'var(--text-secondary)',
            lineHeight:1.7, marginBottom:28 }}>
            Track spending automatically from your bank SMS,<br/>
            set budgets, and reach your savings goals.
          </div>
          <button onClick={() => setStep(1)} style={{
            width:'100%', padding:'14px', background:'var(--primary-main,#3b82f6)',
            color:'white', border:'none', borderRadius:12,
            fontSize:16, fontWeight:700, cursor:'pointer', transition:'opacity 0.15s',
          }}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Get Started
          </button>
          <button onClick={finish} style={{ marginTop:14, background:'none', border:'none',
            fontSize:13, color:'var(--text-muted)', cursor:'pointer',
            width:'100%', padding:'4px' }}>
            Skip setup
          </button>
        </div>
      </div>
      <style>{`@keyframes sbSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );

  // ── Step 1: Set Budget ───────────────────────────────────────────────────
  if (step === 1) return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:16 }}>
      <div style={{ background:'var(--bg-primary,white)', borderRadius:20,
        padding:'32px 32px 28px', maxWidth:440, width:'100%',
        boxShadow:'0 24px 60px rgba(0,0,0,0.18)',
        maxHeight:'90vh', overflowY:'auto', animation:'sbSlideUp 250ms ease' }}>
        <Dots />
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ fontSize:48, lineHeight:1, marginBottom:14 }}>💰</div>
          <h2 style={{ fontSize:20, fontWeight:800, color:'var(--text-primary)', margin:'0 0 8px' }}>
            Set Your Monthly Budget
          </h2>
          <p style={{ fontSize:13, color:'var(--text-secondary)', margin:0, lineHeight:1.6 }}>
            How much do you plan to spend each month?
          </p>
        </div>

        {/* Amount */}
        <label style={{ display:'block', fontSize:11, fontWeight:700,
          color:'var(--text-secondary)', marginBottom:8,
          textTransform:'uppercase', letterSpacing:'0.5px' }}>Budget Amount (M)</label>
        <input autoFocus type="number" min="0" step="100" placeholder="e.g. 5000"
          value={budget} onChange={e=>{ setBudget(e.target.value); setError(''); }}
          style={{ width:'100%', padding:'13px 16px', fontSize:28, fontWeight:800,
            color:'var(--primary-main,#3b82f6)',
            border:`1.5px solid ${error?'#ef4444':'var(--border-main)'}`,
            borderRadius:10, background:'var(--bg-primary)', boxSizing:'border-box',
            outline:'none', marginBottom:4 }}/>
        {error && <p style={{ margin:'0 0 12px', fontSize:12, color:'#ef4444' }}>{error}</p>}
        {!error && <div style={{ marginBottom:14 }}/>}

        {/* Month/Year */}
        {!applyAll && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700,
                color:'var(--text-secondary)', marginBottom:7,
                textTransform:'uppercase', letterSpacing:'0.4px' }}>Month</label>
              <select value={month} onChange={e=>setMonth(Number(e.target.value))}
                style={{ width:'100%', padding:'10px 12px', border:'1px solid var(--border-main)',
                  borderRadius:8, fontSize:14, background:'var(--bg-primary)',
                  color:'var(--text-primary)', boxSizing:'border-box' }}>
                {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700,
                color:'var(--text-secondary)', marginBottom:7,
                textTransform:'uppercase', letterSpacing:'0.4px' }}>Year</label>
              <select value={year} onChange={e=>setYear(Number(e.target.value))}
                style={{ width:'100%', padding:'10px 12px', border:'1px solid var(--border-main)',
                  borderRadius:8, fontSize:14, background:'var(--bg-primary)',
                  color:'var(--text-primary)', boxSizing:'border-box' }}>
                {[2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Apply to all */}
        <div onClick={() => setApplyAll(v=>!v)} style={{
          display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
          background:'var(--bg-secondary)', border:'1px solid var(--border-light)',
          borderRadius:10, marginBottom:16, cursor:'pointer' }}>
          <div style={{ width:18, height:18, borderRadius:4, flexShrink:0,
            border:`2px solid ${applyAll?'var(--primary-main,#3b82f6)':'var(--border-main)'}`,
            background:applyAll?'var(--primary-main,#3b82f6)':'transparent',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.15s' }}>
            {applyAll && <Check size={11} color="white" strokeWidth={3}/>}
          </div>
          <div>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>
              Apply to all months
            </p>
            <p style={{ margin:0, fontSize:11, color:'var(--text-muted)' }}>
              Use this as the default monthly budget
            </p>
          </div>
        </div>

        {/* Summary */}
        {budget && Number(budget) > 0 && (
          <div style={{ padding:'10px 14px', marginBottom:16, background:'#eff6ff',
            borderRadius:8, fontSize:13, color:'#1d4ed8', fontWeight:500 }}>
            {applyAll
              ? `Setting M${Number(budget).toLocaleString()} as your default monthly budget`
              : `Setting M${Number(budget).toLocaleString()} for ${MONTHS[month-1]} ${year}`}
          </div>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setStep(0)} style={{ flex:1, padding:'12px',
            background:'none', border:'1px solid var(--border-main)',
            borderRadius:10, fontSize:14, cursor:'pointer', color:'var(--text-secondary)' }}>
            Back
          </button>
          <button onClick={saveBudget} disabled={saving || !budget || Number(budget)<=0}
            style={{ flex:2, padding:'12px', border:'none', borderRadius:10,
              fontSize:15, fontWeight:700, color:'white',
              background:'var(--primary-main,#3b82f6)',
              cursor:saving?'not-allowed':'pointer',
              opacity:(!budget||Number(budget)<=0)?0.5:1,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {saving ? 'Saving...' : <><Calendar size={15}/> Set Budget</>}
          </button>
        </div>
        <button onClick={finish} style={{ marginTop:12, background:'none', border:'none',
          fontSize:13, color:'var(--text-muted)', cursor:'pointer',
          width:'100%', padding:'4px' }}>
          I'll set this later
        </button>
      </div>
      <style>{`@keyframes sbSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );

  // ── Step 2: Done ─────────────────────────────────────────────────────────
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:16 }}>
      <div style={{ background:'var(--bg-primary,white)', borderRadius:20,
        padding:'32px 32px 28px', maxWidth:440, width:'100%',
        boxShadow:'0 24px 60px rgba(0,0,0,0.18)', animation:'sbSlideUp 250ms ease' }}>
        <Dots />
        <div style={{ textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'#dcfce7',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 20px' }}>
            <Check size={36} color="#16a34a" strokeWidth={2.5}/>
          </div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', margin:'0 0 10px' }}>
            You're all set!
          </h2>
          <p style={{ fontSize:14, color:'var(--text-secondary)', margin:'0 0 24px', lineHeight:1.7 }}>
            Your budget is saved. SmartSpend will now<br/>
            automatically track your spending from SMS alerts.
          </p>
          {[
            { icon:'📱', text:'Bank SMS are parsed automatically — no manual entry needed' },
            { icon:'🔔', text:'You\'ll get alerts when you approach your budget limit' },
            { icon:'🎯', text:'Set savings goals in the Savings tab to stay on track' },
          ].map((tip,i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12,
              textAlign:'left', marginBottom:10, padding:'10px 14px',
              background:'var(--bg-secondary)', borderRadius:10,
              fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>
              <span style={{ fontSize:18, lineHeight:1.4, flexShrink:0 }}>{tip.icon}</span>
              {tip.text}
            </div>
          ))}
          <button onClick={finish} style={{ width:'100%', marginTop:14, padding:'14px',
            background:'var(--primary-main,#3b82f6)', color:'white',
            border:'none', borderRadius:12, fontSize:16, fontWeight:700,
            cursor:'pointer', transition:'opacity 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Go to Dashboard
          </button>
        </div>
      </div>
      <style>{`@keyframes sbSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}