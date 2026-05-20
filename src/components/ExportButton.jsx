import React, { useState } from 'react';
import { Download, FileText, Loader } from 'lucide-react';
import { API_BASE } from '../config/api';

/**
 * ExportButton — generates and downloads a monthly PDF report.
 * Usage: <ExportButton userId={user?.id} month={4} year={2026} />
 */
export default function ExportButton({ userId, month, year, style }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res  = await fetch(
        `${API_BASE}/generate-pdf-report.php?user_id=${userId}&month=${month}&year=${year}`
      );
      const data = await res.json();

      if (!data.success) {
        alert('Failed to generate report: ' + data.error);
        return;
      }

      // Decode the HTML and open in a new tab for printing/saving as PDF
      const html     = atob(data.html);
      const blob     = new Blob([html], { type: 'text/html' });
      const url      = URL.createObjectURL(blob);
      const win      = window.open(url, '_blank');

      // Trigger print dialog after page loads
      if (win) {
        win.onload = () => {
          setTimeout(() => {
            win.print();
            URL.revokeObjectURL(url);
          }, 500);
        };
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate report. Make sure XAMPP is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 16px',
        background: loading ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
        border: '1px solid var(--border-main)',
        borderRadius: 'var(--radius-md)',
        fontSize: 13, fontWeight: 600,
        color: loading ? 'var(--text-muted)' : 'var(--text-primary)',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        ...style,
      }}
      onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = 'var(--primary-main)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-main)')}
      title="Export monthly report as PDF"
    >
      {loading
        ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }} /> Generating...</>
        : <><FileText size={14} /> Export PDF</>
      }
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
