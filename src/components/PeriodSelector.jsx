import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function PeriodSelector() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1–12
  const [selectedYear,  setSelectedYear]  = useState(today.getFullYear());
  const [monthOpen,     setMonthOpen]     = useState(false);
  const [yearOpen,      setYearOpen]      = useState(false);
  const monthRef = useRef(null);
  const yearRef  = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = e => {
      if (monthRef.current && !monthRef.current.contains(e.target)) setMonthOpen(false);
      if (yearRef.current  && !yearRef.current.contains(e.target))  setYearOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Broadcast period change so Dashboard / Analytics / Transactions all react
  const broadcast = (month, year) => {
    window.dispatchEvent(new CustomEvent('periodChanged', {
      detail: { month, year }
    }));
  };

  const selectMonth = (m) => {
    setSelectedMonth(m);
    setMonthOpen(false);
    broadcast(m, selectedYear);
  };

  const selectYear = (y) => {
    setSelectedYear(y);
    setYearOpen(false);
    broadcast(selectedMonth, y);
  };

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 10px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 8,
    fontSize: 13, fontWeight: 600,
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  };

  const years = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

      {/* Month selector */}
      <div ref={monthRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setMonthOpen(v => !v); setYearOpen(false); }}
          style={btnStyle}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-main)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
        >
          {MONTHS[selectedMonth - 1]}
          {monthOpen
            ? <ChevronUp  size={13} style={{ color: 'var(--text-muted)' }} />
            : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          }
        </button>

        {monthOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            padding: 8, zIndex: 9999,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4,
            minWidth: 160,
            animation: 'periodDropIn 150ms ease',
          }}>
            {MONTHS.map((m, i) => {
              const isActive = (i + 1) === selectedMonth;
              return (
                <button key={m} onClick={() => selectMonth(i + 1)} style={{
                  padding: '7px 10px',
                  background: isActive ? 'var(--primary-main)' : 'none',
                  border: 'none', borderRadius: 7,
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer', transition: 'all 0.1s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}>
                  {m}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Year selector */}
      <div ref={yearRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setYearOpen(v => !v); setMonthOpen(false); }}
          style={btnStyle}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-main)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
        >
          {yearOpen
            ? <ChevronUp  size={13} style={{ color: 'var(--text-muted)' }} />
            : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          }
        </button>

        {yearOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            padding: 8, zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: 2,
            minWidth: 90,
            animation: 'periodDropIn 150ms ease',
          }}>
            {years.map(y => {
              const isActive = y === selectedYear;
              return (
                <button key={y} onClick={() => selectYear(y)} style={{
                  padding: '7px 14px',
                  background: isActive ? 'var(--primary-main)' : 'none',
                  border: 'none', borderRadius: 7,
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer', transition: 'all 0.1s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}>
                  {y}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes periodDropIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}