import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, Bell, Palette, Shield, User, Save, X, Eye, EyeOff, Sun, Moon, LogOut, Smartphone, Copy, Check, FlaskConical, Loader } from 'lucide-react';
import PushNotificationSettings from '../components/PushNotificationSettings';
import { API_BASE } from '../config/api';

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User    },
  { id: 'security',      label: 'Security',      icon: Shield  },
  { id: 'notifications', label: 'Notifications', icon: Bell    },
  { id: 'display',       label: 'Display',       icon: Palette },
  { id: 'sms',           label: 'SMS Setup',     icon: Smartphone },
];

function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: 42, height: 24, borderRadius: 99, cursor: 'pointer',
      background: checked ? 'var(--primary-main)' : 'var(--border-main)',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

const SAMPLE_SMS = [
  `FNB:-) M300.00 reserved for purchase @ Hotspot from Smart Account..123456 on 03May 10:22. Available balance M4700.00.`,
  `Your Acc XX6932 has been debited with LSL 570.00 on 03May 08:15. Ref : POS LEC Maseru. Available balance is LSL 2300.00. Helpline: 266 22322424`,
  `M56.00 sent to 33152 - PICK N PAY Maseru Merchant Payment. Balance M1200.00. 3May 09:00`,
  `Ecocash: CashOut Confirmation: M 200 from 29453-NeoLekoekoe Leribe. Approval Code: 440035.`,
  `Postbank: M1847.80 deducted. Purchase at DSTV Premium. Bal M491.18. 6Aug 20:31`,
];

function SimulateSMS({ userId }) {
  const [sms,     setSms]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');

  const CONFIDENCE_COLORS = { hardcoded: '#10B981', memory: '#3B82F6', ml: '#8B5CF6' };
  const SOURCE_LABELS     = { hardcoded: 'Known store', memory: 'Learned store', ml: 'ML model' };

  const process = async () => {
    if (!sms.trim()) return;
    setLoading(true); setResult(null); setError('');
    try {
      const res = await fetch(`${API_BASE}/simulate-sms.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, sms_text: sms.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Failed to process SMS');
    } finally {
      setLoading(false);
    }
  };

  const CATEGORY_COLORS = {
    Food: '#EF4444', Groceries: '#F59E0B', Transport: '#3B82F6',
    Entertainment: '#8B5CF6', Health: '#10B981', Utilities: '#FBBF24',
    Shopping: '#EC4899', Subscriptions: '#06B6D4', Other: '#64748B',
  };

  return (
    <div style={{ marginTop: 28, borderTop: '1px solid var(--border-light)', paddingTop: 24 }}>
      <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700,
        color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
        <FlaskConical size={15} style={{ color: '#8B5CF6' }} />
        Simulate SMS
      </h4>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
        Paste a real bank SMS to test classification and auto-save without a phone.
      </p>

      {/* Sample SMS buttons */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.4px', margin: '0 0 8px' }}>
        Quick samples
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {SAMPLE_SMS.map((s, i) => {
          const labels = ['FNB Purchase', 'LEC Utility', 'M-Pesa Grocery', 'Ecocash Withdrawal', 'DSTV Subscription'];
          return (
            <button key={i} onClick={() => { setSms(s); setResult(null); setError(''); }}
              style={{
                padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', border: '1px solid var(--border-main)',
                background: sms === s ? '#8B5CF620' : 'var(--bg-secondary)',
                color: sms === s ? '#8B5CF6' : 'var(--text-secondary)',
                borderColor: sms === s ? '#8B5CF6' : 'var(--border-main)',
                transition: 'all 150ms',
              }}>
              {labels[i]}
            </button>
          );
        })}
      </div>

      {/* SMS textarea */}
      <textarea
        value={sms}
        onChange={e => { setSms(e.target.value); setResult(null); setError(''); }}
        placeholder="Paste any bank SMS here e.g. FNB:-) M300.00 reserved for purchase @ Hotspot..."
        rows={4}
        style={{
          width: '100%', padding: '10px 12px', boxSizing: 'border-box',
          border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)',
          fontSize: 12, fontFamily: 'monospace', lineHeight: 1.6,
          background: 'var(--bg-secondary)', color: 'var(--text-primary)',
          resize: 'vertical', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = '#8B5CF6'}
        onBlur={e  => e.target.style.borderColor = 'var(--border-main)'}
      />

      <button onClick={process} disabled={loading || !sms.trim()}
        style={{
          marginTop: 10, padding: '9px 20px', borderRadius: 'var(--radius-md)',
          background: loading || !sms.trim() ? 'var(--border-main)' : '#8B5CF6',
          color: 'white', border: 'none', fontSize: 13, fontWeight: 700,
          cursor: loading || !sms.trim() ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 7, transition: 'background 150ms',
        }}>
        {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FlaskConical size={14} />}
        {loading ? 'Processing...' : 'Process SMS'}
      </button>

      {/* Error */}
      {error && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)',
          background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ marginTop: 14, borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)', overflow: 'hidden' }}>

          {result.skipped ? (
            <div style={{ padding: '14px 16px', background: '#FFFBEB',
              borderLeft: '4px solid #F59E0B', fontSize: 13, color: '#92400E' }}>
              <strong>Skipped:</strong> {result.reason}
            </div>
          ) : (
            <>
              {/* Category banner */}
              <div style={{
                padding: '14px 16px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
                background: `${CATEGORY_COLORS[result.ml?.category] || '#64748B'}18`,
                borderBottom: '1px solid var(--border-light)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: CATEGORY_COLORS[result.ml?.category] || '#64748B',
                  }} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {result.ml?.category}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                    background: CONFIDENCE_COLORS[result.ml?.source] + '20',
                    color: CONFIDENCE_COLORS[result.ml?.source],
                    border: `1px solid ${CONFIDENCE_COLORS[result.ml?.source]}40`,
                  }}>
                    {SOURCE_LABELS[result.ml?.source] || result.ml?.source}
                  </span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                  M{Number(result.ml?.amount || 0).toFixed(2)}
                </span>
              </div>

              {/* Details grid */}
              <div style={{ padding: '12px 16px', display: 'grid',
                gridTemplateColumns: '1fr 1fr', gap: '8px 16px',
                background: 'var(--bg-primary)' }}>
                {[
                  ['Store / Merchant', result.ml?.store || '—'],
                  ['Transaction type', result.ml?.transaction_type],
                  ['ML Confidence', `${(result.ml?.confidence * 100).toFixed(1)}%`],
                  ['Saved to DB', result.saved ? '✅ Yes' : '❌ No'],
                  result.ml?.needs_manual && ['Status', '⚠️ Low confidence — review needed'],
                  result.remaining !== null && ['Budget remaining', `M${Number(result.remaining).toFixed(2)}`],
                ].filter(Boolean).map(([label, val]) => (
                  <div key={label}>
                    <p style={{ margin: '0 0 1px', fontSize: 10, fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {label}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {val}
                    </p>
                  </div>
                ))}
              </div>

              {/* Top 3 predictions */}
              {result.ml?.top_predictions?.length > 0 && (
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-light)',
                  background: 'var(--bg-secondary)' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700,
                    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Model confidence breakdown
                  </p>
                  {result.ml.top_predictions.map(p => (
                    <div key={p.category} style={{ display: 'flex', alignItems: 'center',
                      gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 12, width: 100, color: 'var(--text-secondary)',
                        fontWeight: 600 }}>{p.category}</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 99,
                        background: 'var(--border-light)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${p.confidence * 100}%`, height: '100%', borderRadius: 99,
                          background: CATEGORY_COLORS[p.category] || '#64748B',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)',
                        fontWeight: 600, minWidth: 36, textAlign: 'right' }}>
                        {(p.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [copied,    setCopied]    = useState(false);
  const [message,   setMessage]   = useState(null);
  const [saving,    setSaving]    = useState(false);

  // Profile
  const [name,  setName]  = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');

  // Security
  const [showPwdForm,  setShowPwdForm]  = useState(false);
  const [showCurrPwd,  setShowCurrPwd]  = useState(false);
  const [showNewPwd,   setShowNewPwd]   = useState(false);
  const [currentPwd,   setCurrentPwd]   = useState('');
  const [newPwd,       setNewPwd]       = useState('');
  const [confirmPwd,   setConfirmPwd]   = useState('');

  // Notifications (persist to localStorage)
  const [emailNotif,   setEmailNotif]   = useState(() => JSON.parse(localStorage.getItem('sb:emailNotif') ?? 'true'));
  const [weeklyDigest, setWeeklyDigest] = useState(() => JSON.parse(localStorage.getItem('sb:weeklyDigest') ?? 'true'));
  const [budgetAlerts, setBudgetAlerts] = useState(() => JSON.parse(localStorage.getItem('sb:budgetAlerts') ?? 'true'));

  // Display (persist to localStorage)
  const [theme,    setTheme]    = useState(() => localStorage.getItem('sb:theme') || 'light');
  const [currency, setCurrency] = useState(() => localStorage.getItem('sb:currency') || 'LSL');
  const [language, setLanguage] = useState(() => localStorage.getItem('sb:language') || 'English');

  const msg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const input = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--border-main)',
    borderRadius: 'var(--radius-md)', fontSize: 14,
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
    boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim() || !email.includes('@')) {
      msg('error', 'Please fill all fields with valid values'); return;
    }
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/update-user.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('sb:user', JSON.stringify({ ...user, name: name.trim(), email: email.trim() }));
        msg('success', 'Profile updated successfully');
        setTimeout(() => window.location.reload(), 1500);
      } else msg('error', data.error || 'Failed to update profile');
    } catch { msg('error', 'Failed to save profile'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) { msg('error', 'Fill all password fields'); return; }
    if (newPwd !== confirmPwd) { msg('error', "Passwords don't match"); return; }
    if (newPwd.length < 6) { msg('error', 'Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/change-password.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, current_password: currentPwd, new_password: newPwd }),
      });
      const data = await res.json();
      if (data.success) {
        msg('success', 'Password changed successfully');
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); setShowPwdForm(false);
      } else msg('error', data.error || 'Failed to change password');
    } catch { msg('error', 'Failed to change password'); }
    finally { setSaving(false); }
  };

  const initials = (name || user?.name || 'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  const sectionStyle = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: '24px 28px',
    marginBottom: 16,
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)',
          margin: 0, letterSpacing: '-0.4px' }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Alert */}
      {message && (
        <div style={{
          padding: '10px 14px', marginBottom: 20, borderRadius: 'var(--radius-md)',
          background: message.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          color: message.type === 'success' ? 'var(--success-dark)' : 'var(--danger-dark)',
          fontSize: 13, fontWeight: 500,
          border: `1px solid ${message.type==='success'?'var(--success)':'var(--danger)'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-lg)', marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: 1, minWidth: 100, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 7, padding: '9px 14px',
              border: 'none', borderRadius: 'var(--radius-md)',
              background: active ? 'var(--bg-primary)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: active ? 600 : 400, fontSize: 13, cursor: 'pointer',
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s',
            }}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── PROFILE ──────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div>
          <div style={sectionStyle}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center',
              marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-main)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, flexShrink: 0,
              }}>
                {initials}
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
                  margin: 0 }}>{user?.name || 'Your Name'}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {user?.email || 'your@email.com'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
              <Field label="Name" required>
                <input type="text" value={name} onChange={e=>setName(e.target.value)}
                  placeholder="e.g. Lekau Mokhesi" style={input} />
              </Field>
              <Field label="Email" required>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="e.g. lekau@gmail.com" style={input} />
              </Field>
              {user?.phone_number && (
                <Field label="Phone (linked to SMS)">
                  <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)',
                    fontSize: 14, color: 'var(--text-secondary)' }}>
                    {user.phone_number}
                  </div>
                </Field>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => { setName(user?.name||''); setEmail(user?.email||''); }}
                style={{ padding: '9px 18px', background: 'none',
                  border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)',
                  fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={saving} style={{
                padding: '9px 20px', background: 'var(--primary-main)',
                border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 13, fontWeight: 700, color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Account actions */}
          <div style={{ ...sectionStyle, borderColor: '#FCA5A5' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)',
              margin: '0 0 10px' }}>Delete your account</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>
              This removes all your data permanently. You cannot undo this.
            </p>
            <button onClick={() => {
              if (window.confirm('Are you sure? This cannot be undone.')) {
                localStorage.removeItem('sb:user');
                window.location.href = '/';
              }
            }} style={{
              padding: '8px 16px', background: 'none',
              border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)',
              fontSize: 12, fontWeight: 600, color: 'var(--danger)',
              cursor: 'pointer' }}>
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* ── SECURITY ─────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div>
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
              margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={16} /> Change Password
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
              Keep your account secure with a strong password.
            </p>
            {!showPwdForm ? (
              <button onClick={() => setShowPwdForm(true)} style={{
                padding: '9px 18px', background: 'var(--primary-main)',
                border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                Update Password
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                <Field label="Current Password" required>
                  <div style={{ position: 'relative' }}>
                    <input type={showCurrPwd?'text':'password'} value={currentPwd}
                      onChange={e=>setCurrentPwd(e.target.value)}
                      placeholder="Current password"
                      style={{ ...input, paddingRight: 40 }} />
                    <button type="button" onClick={()=>setShowCurrPwd(v=>!v)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex' }}>
                      {showCurrPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </Field>
                <Field label="New Password" required>
                  <div style={{ position: 'relative' }}>
                    <input type={showNewPwd?'text':'password'} value={newPwd}
                      onChange={e=>setNewPwd(e.target.value)}
                      placeholder="Min 6 characters"
                      style={{ ...input, paddingRight: 40 }} />
                    <button type="button" onClick={()=>setShowNewPwd(v=>!v)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex' }}>
                      {showNewPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm Password" required>
                  <input type="password" value={confirmPwd}
                    onChange={e=>setConfirmPwd(e.target.value)}
                    placeholder="Repeat new password" style={input} />
                </Field>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={()=>{setShowPwdForm(false);setCurrentPwd('');setNewPwd('');setConfirmPwd('');}}
                    style={{ flex:1, padding:'9px', background:'none',
                      border:'1px solid var(--border-main)', borderRadius:'var(--radius-md)',
                      fontSize:13, cursor:'pointer', color:'var(--text-secondary)' }}>Cancel</button>
                  <button onClick={handleChangePassword} disabled={saving} style={{
                    flex:2, padding:'9px', background:'var(--primary-main)',
                    border:'none', borderRadius:'var(--radius-md)',
                    fontSize:13, fontWeight:700, color:'white',
                    cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS ────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div>
          <PushNotificationSettings userId={user?.id} />
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
              margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={16} /> Notification Preferences
            </h3>
            {[
              { label: 'Email Notifications', help: 'Receive account notifications via email', val: emailNotif, set: setEmailNotif, key: 'sb:emailNotif' },
              { label: 'Weekly Digest',        help: 'Get a weekly spending summary',          val: weeklyDigest, set: setWeeklyDigest, key: 'sb:weeklyDigest' },
              { label: 'Budget Alerts',        help: 'Alert when approaching budget limits',   val: budgetAlerts, set: setBudgetAlerts, key: 'sb:budgetAlerts' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '14px 16px', marginBottom: 8,
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {item.help}
                  </p>
                </div>
                <Toggle checked={item.val} onChange={v => { item.set(v); localStorage.setItem(item.key, JSON.stringify(v)); }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DISPLAY ──────────────────────────────────────── */}
      {activeTab === 'display' && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
            margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={16} /> Display & Language
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 360 }}>
            <Field label="Theme">
              <select value={theme} onChange={e=>setTheme(e.target.value)} style={{ ...input }}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </Field>
            <Field label="Currency">
              <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{ ...input }}>
                <option value="LSL">LSL — Lesotho Loti (M)</option>
                <option value="ZAR">ZAR — South African Rand (R)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
              </select>
            </Field>
            <Field label="Language">
              <select value={language} onChange={e=>setLanguage(e.target.value)} style={{ ...input }}>
                <option value="English">English</option>
                <option value="Sesotho">Sesotho</option>
              </select>
            </Field>
            <button onClick={() => {
              localStorage.setItem('sb:theme', theme);
              localStorage.setItem('sb:currency', currency);
              localStorage.setItem('sb:language', language);
              msg('success', 'Preferences saved');
            }} style={{
              alignSelf: 'flex-start', padding: '9px 20px',
              background: 'var(--primary-main)', border: 'none',
              borderRadius: 'var(--radius-md)', fontSize: 13,
              fontWeight: 700, color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={14} /> Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* ── SMS SETUP ──────────────────────────────────────── */}
      {activeTab === 'sms' && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
            margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Smartphone size={16} /> SMS Auto-Import Setup
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
            Forward bank SMS messages to SmartSpend automatically.
          </p>

          {/* Registered phone */}
          <div style={{ padding: '14px 16px', background: '#F0FDF4',
            border: '1px solid #86EFAC', borderRadius: 'var(--radius-lg)', marginBottom: 20 }}>
            <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700,
              color: '#166534', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Registered phone
            </p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#15803D' }}>
              {user?.phone_number || 'Not set — update in Profile'}
            </p>
            {user?.phone_number && (
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#166534' }}>
                Verified and ready for SMS
              </p>
            )}
          </div>

          {/* Webhook URL */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700,
              color: 'var(--text-muted)', marginBottom: 7,
              textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Your Webhook URL
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <div style={{ flex: 1, padding: '10px 12px',
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: 11, color: 'var(--text-secondary)',
                wordBreak: 'break-all', lineHeight: 1.6 }}>
                {user?.phone_number
                  ? `http://${window.location.hostname}/smart_budget/backend/api/sms-ingest.php?phone_number=${encodeURIComponent(user.phone_number)}&key=${user?.webhook_key || ''}`
                  : 'Set your phone number in Profile first'}
              </div>
              {user?.phone_number && (
                <button
                  onClick={() => {
                    const url = `http://${window.location.hostname}/smart_budget/backend/api/sms-ingest.php?phone_number=${encodeURIComponent(user.phone_number)}&key=${user?.webhook_key || ''}`;
                    // Fallback for non-HTTPS (navigator.clipboard requires secure context)
                    if (navigator.clipboard && window.isSecureContext) {
                      navigator.clipboard.writeText(url);
                    } else {
                      const ta = document.createElement('textarea');
                      ta.value = url;
                      ta.style.position = 'fixed';
                      ta.style.left = '-9999px';
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand('copy');
                      document.body.removeChild(ta);
                    }
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    padding: '10px 14px', border: '1px solid var(--border-main)',
                    borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    gap: 6, fontSize: 13, fontWeight: 600, flexShrink: 0,
                    color: copied ? 'var(--success)' : 'var(--text-secondary)',
                    transition: 'color 0.2s',
                  }}>
                  {copied ? <Check size={14}/> : <Copy size={14}/>}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          {/* Steps */}
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>
            Quick Setup
          </p>
          {[
            'Install SMS Forwarder from F-Droid on your Android phone',
            'Open the app and grant SMS read permission',
            'Tap "Add New Forwarder" \u2192 Select HTTP',
            'Add sender filters: Mpesa:MPESA, Ecocash:199, Standard Bank:StdLesBank, FNB:+26652000002',
            'Paste your Webhook URL above into the URL field',
            'Save and test \u2014 transactions will appear on Dashboard automatically',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12,
              alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--primary-main)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, flexShrink: 0,
              }}>{i + 1}</div>
              <p style={{ margin: '3px 0 0', fontSize: 13,
                color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {step}
              </p>
            </div>
          ))}

          {/* Supported banks */}
          <div style={{ marginTop: 20, padding: '12px 14px',
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)' }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700,
              color: 'var(--text-muted)', textTransform: 'uppercase',
              letterSpacing: '0.4px' }}>
              Supported banks
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['FNB', 'Standard Lesotho Bank', 'M-Pesa', 'Ecocash', 'Vodacom', 'MTN', 'Econet'].map(b => (
                <span key={b} style={{
                  padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                  background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                }}>{b}</span>
              ))}
            </div>
          </div>

          {/* ── Simulate SMS ────────────────────────────────────── */}
          <SimulateSMS userId={user?.id} />
        </div>
      )}
    </div>
  );
}