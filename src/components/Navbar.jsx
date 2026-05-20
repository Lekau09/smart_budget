import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, X, Settings, LogOut, ChevronDown } from 'lucide-react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import PeriodSelector from './PeriodSelector';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onToggle }) {
  const { user, logout }  = useAuth();
  const navigate  = useNavigate();

  const [searchQuery,  setSearchQuery]  = useState('');
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('globalSearch', { detail: { query: searchQuery } }));
  }, [searchQuery]);

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = q => {
    setSearchQuery(q);
    if (q.trim()) navigate('/app/transactions');
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const initials  = (user?.name || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const firstName = user?.name?.split(' ')[0] || 'Account';

  return (
    <>
      {/* ── Main navbar bar ── */}
      <div className="app-navbar" style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: 64,
        padding: '0 16px',
        boxSizing: 'border-box',
        position: 'relative',
      }}>

        {/* LEFT — hamburger + period selector */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <button onClick={onToggle} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'var(--text-secondary)', padding:6, borderRadius:6,
            display:'flex', alignItems:'center',
          }}>
            <Menu size={20} />
          </button>
          {!isMobile && <PeriodSelector />}
        </div>

        {/* CENTER — search bar grows to fill space */}
        {!isMobile ? (
          <div className="search-bar" style={{
            flex: 1, maxWidth: 400, margin: '0 16px',
          }}>
            <Search size={15} style={{ color:'var(--text-muted)', flexShrink:0 }} />
            <input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) navigate('/app/transactions');
                if (e.key === 'Escape') setSearchQuery('');
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{
                background:'none', border:'none', cursor:'pointer',
                color:'var(--text-muted)', padding:0, display:'flex',
              }}>
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          /* On mobile just push right section to the end */
          <div style={{ flex:1 }} />
        )}

        {/* RIGHT — theme + bell + avatar — pushed to absolute right edge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          marginLeft: 'auto',   /* ← guarantees rightmost position */
        }}>

          {/* Mobile search icon */}
          {isMobile && (
            <button onClick={() => setSearchOpen(s => !s)} style={{
              background:'none', border:'none', cursor:'pointer',
              color:'var(--text-secondary)', padding:6, display:'flex',
            }}>
              <Search size={18} />
            </button>
          )}

          {!isMobile && <ThemeToggle />}
          {user?.id  && <NotificationBell userId={user.id} />}

          {/* Avatar pill dropdown */}
          <div ref={dropdownRef} style={{ position:'relative' }}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              style={{
                display:'flex', alignItems:'center', gap:7,
                background:'var(--bg-secondary)',
                border:'1px solid var(--border-light)',
                borderRadius:99, padding:'4px 10px 4px 4px',
                cursor:'pointer', transition:'border-color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-main)'}
              onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.borderColor = 'var(--border-light)'; }}
            >
              <div style={{
                width:28, height:28, borderRadius:'50%',
                background:'var(--primary-main)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'white', fontSize:11, fontWeight:700, flexShrink:0,
              }}>
                {initials}
              </div>
              {!isMobile && (
                <span style={{
                  fontSize:13, fontWeight:600, color:'var(--text-primary)',
                  maxWidth:110, overflow:'hidden',
                  textOverflow:'ellipsis',
                }}>
                  {firstName}
                </span>
              )}
              <ChevronDown size={13} style={{
                color:'var(--text-muted)',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition:'transform 0.2s',
              }} />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div style={{
                position:'absolute', top:'calc(100% + 8px)', right:0,
                background:'var(--bg-primary)',
                border:'1px solid var(--border-light)',
                borderRadius:'var(--radius-xl)',
                boxShadow:'0 8px 32px rgba(0,0,0,0.12)',
                minWidth:210, zIndex:9999, overflow:'hidden',
                animation:'navDropIn 150ms ease',
              }}>
                <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border-light)' }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>
                    {user?.name || 'User'}
                  </p>
                  <p style={{ margin:'3px 0 0', fontSize:12, color:'var(--text-muted)',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {user?.email || ''}
                  </p>
                </div>
                <div style={{ padding:'6px 0' }}>
                  <button onClick={() => { setDropdownOpen(false); navigate('/app/settings'); }}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:10,
                      padding:'10px 16px', background:'none', border:'none',
                      cursor:'pointer', fontSize:13, fontWeight:500,
                      color:'var(--text-primary)', textAlign:'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <Settings size={15} style={{ color:'var(--text-muted)' }} />
                    Settings
                  </button>
                  <div style={{ height:1, background:'var(--border-light)', margin:'4px 8px' }} />
                  <button onClick={handleLogout}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:10,
                      padding:'10px 16px', background:'none', border:'none',
                      cursor:'pointer', fontSize:13, fontWeight:500,
                      color:'#EF4444', textAlign:'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar — slides down below navbar */}
      {isMobile && searchOpen && (
        <div style={{
          position:'absolute', top:64, left:0, right:0, zIndex:200,
          padding:'10px 16px', background:'var(--bg-primary)',
          borderBottom:'1px solid var(--border-light)',
        }}>
          <div className="search-bar">
            <Search size={15} style={{ color:'var(--text-muted)' }} />
            <input autoFocus placeholder="Search transactions..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate('/app/transactions');
                  setSearchOpen(false);
                }
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{
                background:'none', border:'none', cursor:'pointer',
                color:'var(--text-muted)', padding:0 }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes navDropIn {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </>
  );
}