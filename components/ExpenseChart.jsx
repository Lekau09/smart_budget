import React, { useEffect, useState } from 'react';

export default function ExpenseChart({ data = [
  { name: 'Food', value: 200 },
  { name: 'Groceries', value: 350 },
  { name: 'Bills', value: 90 },
  { name: 'Other', value: 60 },
] }) {
  const [Recharts, setRecharts] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;
    import('recharts')
      .then((mod) => {
        if (!mounted) return;
        setRecharts({
          PieChart: mod.PieChart,
          Pie: mod.Pie,
          Cell: mod.Cell,
          ResponsiveContainer: mod.ResponsiveContainer,
          Tooltip: mod.Tooltip,
        });
      })
      .catch((err) => {
        console.warn('ExpenseChart: recharts not available:', err && err.message ? err.message : err);
        if (mounted) setLoadError(true);
      });
    return () => { mounted = false; };
  }, []);

  const COLORS = ['#6366F1', '#34D399', '#F97316', '#F87171'];

  if (loadError) {
    return (
      <div role="img" aria-label="chart unavailable" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 220, background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.04)'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontWeight: 700, color: '#111827' }}>Chart unavailable</div>
          <div style={{ fontSize: 13 }}>Install "recharts" to view charts: npm install recharts</div>
        </div>
      </div>
    );
  }

  if (!Recharts) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 220, background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.04)'
      }}>
        <div style={{ color: '#6b7280' }}>Loading chart…</div>
      </div>
    );
  }

  const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } = Recharts;

  return (
    <div style={{ width: '100%', height: 220, background: '#fff', borderRadius: 12, padding: 8, boxSizing: 'border-box' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={30} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
