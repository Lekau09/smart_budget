import React, { useState, useEffect } from 'react';
import { Flame, ChevronRight } from 'lucide-react';
import { API_BASE } from '../config/api';

const LEVEL_NAMES = [
  '', 'Beginner', 'Saver', 'Tracker', 'Planner',
  'Analyst', 'Pro', 'Expert', 'Master', 'Elite', 'Legend',
];

export default function GamificationCard({ userId }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetch(`${API_BASE}/gamification.php?user_id=${userId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d  => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="card" style={{ padding: '18px 22px' }}>
      <div className="skeleton skeleton-text" style={{ width: '50%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 48, borderRadius: 8 }} />
    </div>
  );

  if (!data) return null;

  const lvlName    = LEVEL_NAMES[Math.min(data.level, LEVEL_NAMES.length - 1)] || 'Legend';
  const earned     = data.badges.filter(b => b.earned);
  const nextBadge  = data.badges.find(b => !b.earned);
  const activeChal = data.challenges.find(c => !c.complete);
  const doneChal   = data.challenges.filter(c => c.complete).length;

  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      {/* Compact horizontal layout - like TikTok/Discord */}
      <div style={{ display:'flex', alignItems:'center', gap:14, justifyContent:'space-between' }}>
        
        {/* Left: Level badge circle */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center',
          width:56, height:56, borderRadius:'50%',
          background:`linear-gradient(135deg, var(--primary-main), #7C3AED)`,
          flexShrink:0, boxShadow:'0 4px 12px rgba(59,130,246,0.3)'
        }}>
          <div style={{ textAlign:'center' }}>
            <p style={{ margin:0, fontSize:20, fontWeight:800, color:'white', lineHeight:1 }}>
              {data.level}
            </p>
            <p style={{ margin:0, fontSize:9, color:'rgba(255,255,255,0.8)', fontWeight:600 }}>
              {lvlName.substring(0,3)}
            </p>
          </div>
        </div>

        {/* Middle: XP progress */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
            <p style={{ margin:0, fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>
              {lvlName}
            </p>
            <p style={{ margin:0, fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>
              {data.xp} / {data.xp + Math.max(0, data.next_xp - (data.xp % data.next_xp || data.next_xp))} XP
            </p>
          </div>
          <div style={{
            height:4, background:'var(--bg-tertiary)',
            borderRadius:99, overflow:'hidden'
          }}>
            <div style={{
              height:'100%', borderRadius:99,
              width:`${data.progress_pct}%`,
              background:'var(--primary-main)',
              transition:'width 0.8s ease',
            }} />
          </div>
        </div>

        {/* Right: Streak or next badge */}
        {data.streak > 0 ? (
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center',
            padding:'8px 10px', background:'#FFF7ED', borderRadius:8,
            border:'1px solid #FED7AA', flexShrink:0
          }}>
            <Flame size={16} style={{ color:'#F97316', marginBottom:2 }} />
            <p style={{ margin:0, fontSize:13, fontWeight:800, color:'#EA580C', lineHeight:1 }}>
              {data.streak}
            </p>
            <p style={{ margin:0, fontSize:8, color:'#9A3412', fontWeight:600 }}>
              days
            </p>
          </div>
        ) : (
          nextBadge && (
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'center',
              width:44, height:44, borderRadius:8,
              background:'var(--bg-secondary)', border:'1px solid var(--border-light)',
              flexShrink:0, fontSize:20
            }} title={nextBadge.desc}>
              {nextBadge.icon || '🔒'}
            </div>
          )
        )}
      </div>

      {/* Optional: Show active challenge on hover/expand */}
      {activeChal && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border-light)' }}>
          <p style={{ margin:0, fontSize:11, color:'var(--text-muted)', fontWeight:600, marginBottom:8 }}>
            Current challenge
          </p>
          <div style={{ padding:'10px 12px', background:'var(--bg-secondary)',
            borderRadius:8, border:'1px solid var(--border-light)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ margin:0, fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>
                  {activeChal.title}
                </p>
                <p style={{ margin:'2px 0 0', fontSize:11, color:'var(--text-secondary)' }}>
                  {activeChal.desc}
                </p>
              </div>
              <span style={{ fontSize:10, fontWeight:700, color:'#7C3AED', flexShrink:0 }}>
                +{activeChal.xp}XP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Show earned badges */}
      {earned.length > 0 && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border-light)' }}>
          <p style={{ margin:0, fontSize:11, color:'var(--text-muted)', fontWeight:600, marginBottom:8 }}>
            Badges ({earned.length})
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {earned.slice(0, 5).map(b => (
              <div key={b.id} title={b.desc} style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                width:32, height:32, borderRadius:6,
                background:'var(--bg-secondary)',
                border:'1px solid var(--border-light)',
                fontSize:16, cursor:'default'
              }}>
                {b.icon || '⭐'}
              </div>
            ))}
            {earned.length > 5 && (
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'center',
                width:32, height:32, borderRadius:6,
                background:'var(--bg-tertiary)', fontSize:11, fontWeight:700,
                color:'var(--text-muted)'
              }}>
                +{earned.length - 5}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}