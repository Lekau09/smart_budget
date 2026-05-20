import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Award } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function WeeklyDigest({ userId, expenses }) {
  const [show, setShow] = useState(false);

  // Show digest only on Mondays or if user hasn't seen it this week
  useEffect(() => {
    const lastSeen = localStorage.getItem('sb:digest_seen');
    const now      = new Date();
    const weekKey  = `${now.getFullYear()}-W${Math.ceil(now.getDate()/7)}`;
    if (lastSeen !== weekKey) setShow(true);
  }, []);

  if (!show || !expenses || expenses.length === 0) return null;

  // Calculate last 7 days stats
  const now  = new Date();
  const week = new Date(now - 7 * 86400000);

  const weekExpenses = expenses.filter(e => new Date(e.date) >= week);
  const total  = weekExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const topCat = weekExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});
  const topCategory = Object.entries(topCat).sort((a,b)=>b[1]-a[1])[0];

  const dismiss = () => {
    const now    = new Date();
    const weekKey= `${now.getFullYear()}-W${Math.ceil(now.getDate()/7)}`;
    localStorage.setItem('sb:digest_seen', weekKey);
    setShow(false);
  };

  return (
    <div className="digest-card" style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ position:'relative', zIndex:1 }}>
          <p style={{ margin:'0 0 4px', fontSize:11, opacity:0.8, fontWeight:500,
            textTransform:'uppercase', letterSpacing:'0.5px' }}>
            Weekly Summary
          </p>
          <h3 style={{ margin:'0 0 12px', fontSize:20, fontWeight:700 }}>
            M{total.toFixed(2)} spent
          </h3>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6,
              background:'rgba(255,255,255,0.15)', borderRadius:20,
              padding:'4px 10px', fontSize:12 }}>
              <TrendingDown size={13} />
              {weekExpenses.length} transactions
            </div>
            {topCategory && (
              <div style={{ display:'flex', alignItems:'center', gap:6,
                background:'rgba(255,255,255,0.15)', borderRadius:20,
                padding:'4px 10px', fontSize:12 }}>
                <Award size={13} />
                Top: {topCategory[0]}
              </div>
            )}
          </div>
        </div>
        <button onClick={dismiss} style={{
          background:'rgba(255,255,255,0.2)', border:'none',
          borderRadius:'50%', width:28, height:28,
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', color:'white', fontSize:16, flexShrink:0,
          position:'relative', zIndex:1
        }}>×</button>
      </div>
    </div>
  );
}
