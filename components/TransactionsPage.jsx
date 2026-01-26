import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faFilter,
  faCalendarAlt,
  faInfoCircle,
  faShareNodes,
  faUtensils,
  faCartShopping,
  faCoffee,
  faBolt,
  faWallet,
  faMoneyBillTransfer,
  faBell
} from '@fortawesome/free-solid-svg-icons';

/*
  TransactionsPage.jsx
  - Single-file React component (JavaScript only)
  - Injects its own CSS into document.head (no Tailwind)
  - Uses Font Awesome (react-fontawesome) for icons
  - Provides search, filters, grouped transactions, summary cards and floating actions
  - Export default functional component
*/

/* -------------------------
   Sample data (module scope)
   ------------------------- */
const SAMPLE = [
  {
    date: '2025-10-28',
    items: [
      { id: 1, merchant: 'KFC Downtown', note: 'Lunch with friends', amount: -45.5, time: '14:30', category: 'Food' },
      { id: 2, merchant: 'Salary', note: 'October Salary', amount: 1500.0, time: '09:00', category: 'Income' },
    ],
  },
  {
    date: '2025-10-25',
    items: [
      { id: 3, merchant: 'Grocer Mart', note: 'Weekly groceries', amount: -120.75, time: '18:10', category: 'Groceries' },
      { id: 4, merchant: 'Starbucks', note: 'Coffee', amount: -5.4, time: '10:05', category: 'Coffee' },
      { id: 5, merchant: 'Electric Co', note: 'Monthly bill', amount: -90.0, time: '08:20', category: 'Bills' },
      { id: 6, merchant: 'Transfer', note: 'Transfer to savings', amount: -200.0, time: '12:00', category: 'Transfer' },
    ],
  },
];

/* -------------------------
   CSS injection
   ------------------------- */
function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('tx-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'tx-page-styles';
  style.innerHTML = `
    :root{
      --bg: #ffffff;
      --surface: #f8fafc;
      --muted: #6b7280;
      --text: #0f1724;
      --primary: #3b82f6;
      --accent: #10b981;
      --danger: #ef4444;
      --card-radius: 14px;
      --shadow: 0 10px 30px rgba(2,6,23,0.08);
    }
    *{box-sizing:border-box}
    .tx-wrap{ background:var(--surface); min-height:100vh; padding:22px; color:var(--text); font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
    .tx-top{ display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap; margin-bottom:18px; }
    .tx-left{ display:flex; gap:12px; align-items:center; min-width:220px; flex:1; }
    .tx-search{ position:relative; flex:1; max-width:720px; }
    .tx-search input{ width:100%; padding:12px 14px 12px 44px; border-radius:999px; border:1px solid rgba(2,6,23,0.06); background:var(--bg); box-shadow: 0 6px 20px rgba(2,6,23,0.04); }
    .tx-search .fa-icon{ position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--muted) }
    .tx-profile{ display:flex; gap:12px; align-items:center; margin-left:auto; }
    .tx-avatar{ width:42px; height:42px; border-radius:999px; background:linear-gradient(135deg,var(--primary),#2563eb); color:white; font-weight:700; display:inline-flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(59,130,246,0.12); }

    /* Summary */
    .tx-cards{ display:flex; gap:14px; flex-wrap:wrap; margin-bottom:18px; }
    .tx-card{ background:var(--bg); padding:16px; border-radius:var(--card-radius); box-shadow: var(--shadow); min-width:200px; flex:1 1 220px; border:1px solid rgba(2,6,23,0.04); transition:transform .15s ease; }
    .tx-card:hover{ transform:translateY(-4px) }
    .tx-card .title{ font-size:13px; color:var(--muted); font-weight:700; margin-bottom:8px; }
    .tx-card .value{ font-size:20px; font-weight:800; color:var(--text); }
    .tx-card .meta{ font-size:12px; color:var(--muted); margin-top:6px; }

    /* Controls */
    .tx-controls{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:14px; }
    .tx-controls .control{ padding:10px 12px; border-radius:10px; border:1px solid rgba(2,6,23,0.06); background:var(--bg); min-width:160px; display:flex; gap:8px; align-items:center; }

    /* Groups */
    .tx-group{ margin-top:18px; }
    .tx-group-header{ display:flex; justify-content:space-between; align-items:center; padding:6px 2px; color:var(--muted); font-weight:700; font-size:13px; }
    .tx-list{ display:flex; flex-direction:column; gap:10px; margin-top:8px; }

    .tx-item{ display:flex; align-items:center; justify-content:space-between; background:var(--bg); padding:12px; border-radius:12px; box-shadow: 0 8px 20px rgba(2,6,23,0.05); border:1px solid rgba(2,6,23,0.04); transition:transform .12s ease, box-shadow .12s ease; }
    .tx-item:hover, .tx-item:focus{ transform:translateY(-3px); box-shadow: 0 12px 28px rgba(2,6,23,0.06); outline:none; }
    .tx-left-col{ display:flex; align-items:center; gap:12px; min-width:0; }
    .tx-thumb{ width:48px; height:48px; border-radius:999px; display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--text); background:linear-gradient(135deg,#f3f4f6,#eaf3ff); flex-shrink:0; }
    .tx-merchant{ min-width:0; }
    .tx-merchant .name{ font-weight:700; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .tx-merchant .note{ font-size:12px; color:var(--muted); margin-top:4px; }

    .tx-right{ text-align:right; min-width:110px; margin-left:12px; }
    .tx-amount{ font-weight:800; font-size:15px; }
    .tx-time{ font-size:12px; color:var(--muted); margin-top:4px; }

    .tx-pos{ color:var(--accent) }
    .tx-neg{ color:var(--danger) }

    /* Floating actions */
    .tx-fabs{ position:fixed; right:20px; bottom:20px; display:flex; flex-direction:column; gap:12px; z-index:70; }
    .tx-fab{ width:48px; height:48px; border-radius:999px; background:var(--bg); display:flex; align-items:center; justify-content:center; box-shadow:0 12px 30px rgba(2,6,23,0.12); border:1px solid rgba(2,6,23,0.06); cursor:pointer; }

    /* Responsive */
    @media (max-width:800px){
      .tx-left{ flex:1 1 100%; }
      .tx-profile{ width:100%; justify-content:flex-end; }
      .tx-cards{ gap:10px; }
      .tx-card{ flex:1 1 100%; }
      .tx-right{ min-width:80px; }
    }
  `;
  document.head.appendChild(style);
}

/* -------------------------
   Helpers
   ------------------------- */
const fmt = (n) => {
  const v = Number(n);
  if (!isFinite(v)) return 'M0.00';
  const abs = Math.abs(v);
  return `M${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs)}`;
};

const subtotal = (items) => items.reduce((s, it) => s + (Number(it.amount) || 0), 0);

/* category -> icon mapping */
const CATEGORY_ICON = {
  Food: faUtensils,
  Groceries: faCartShopping,
  Coffee: faCoffee,
  Bills: faBolt,
  Income: faWallet,
  Transfer: faMoneyBillTransfer,
  default: faWallet,
};

/* -------------------------
   Component
   ------------------------- */
export default function TransactionsPage() {
	// ensure styles are injected immediately (safe because injectStyles guards duplicates)
	injectStyles();
	console.log('[TransactionsPage] render - styles injected');

	const [query, setQuery] = useState('');
	const [category, setCategory] = useState('all');
	const [range, setRange] = useState('month');
	const [transactions, setTransactions] = useState(SAMPLE); // Use SAMPLE as initial data

	useEffect(() => {
		console.log('[TransactionsPage] mounted (useEffect)');
	}, []);

	const handleAddExpense = (newTx) => {
		// Group by date
		const dateGroup = transactions.find(g => g.date === newTx.date);
		
		if (dateGroup) {
			setTransactions(transactions.map(g => 
				g.date === newTx.date 
					? { ...g, items: [newTx, ...g.items] }
					: g
			));
		} else {
			setTransactions([
				{ date: newTx.date, items: [newTx] },
				...transactions
			]);
		}
	};

	// totals computed from current transactions (use transactions, not SAMPLE)
	const totals = useMemo(() => {
		const all = transactions.flatMap(g => g.items);
		const totalBudget = 5000;
		const spent = all.reduce((s, it) => s + (it.amount < 0 ? -it.amount : 0), 0);
		const savings = 800;
		const remaining = totalBudget - spent;
		return { totalBudget, spent, savings, remaining };
	}, [transactions]);

	// derive list of categories for filter from current transactions
	const categories = useMemo(() => {
		const set = new Set();
		transactions.flatMap(g => g.items).forEach(it => set.add(it.category));
		return ['all', ...Array.from(set)];
	}, [transactions]);

	// filter groups by query/category/range using current transactions
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return transactions
			.map(g => ({
				date: g.date,
				items: g.items.filter(it => {
					if (category !== 'all' && it.category !== category) return false;
					if (q && !`${it.merchant} ${it.note} ${it.category}`.toLowerCase().includes(q)) return false;
					return true;
				}),
			}))
			.filter(g => g.items.length > 0);
	}, [transactions, query, category, range]);

	return (
		// ensure injected styles apply
		<div className="tx-wrap flex flex-col h-screen">
			{/* Visible debug banner so mounting is obvious */}
			<div
				style={{
					background: '#fffbeb',
					border: '1px solid #f59e0b',
					color: '#92400e',
					padding: '8px 12px',
					borderRadius: 8,
					marginBottom: 12,
					textAlign: 'center',
					fontWeight: 700
				}}
				role="status"
				aria-live="polite"
			>
				Transactions Page mounted — debug banner
			</div>

			{/* Fixed Header - Matches Dashboard Style */}
			<header className="bg-white border-b border-gray-100 sticky top-0 z-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
					<div className="flex items-center justify-between gap-4">
						{/* Search Bar */}
						<div className="flex-1 max-w-md relative">
							<FontAwesomeIcon 
								icon={faMagnifyingGlass} 
								className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
							/>
							<input
								type="search"
								placeholder="Search transactions..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 
										 rounded-full shadow-sm placeholder:text-gray-400
										 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
							/>
						</div>

						{/* Notification & Profile */}
						<div className="flex items-center gap-4">
							<button 
								className="btn-icon relative"
								aria-label="Notifications"
								title="View notifications"
							>
								<FontAwesomeIcon icon={faBell} className="w-5 h-5 text-neutral-600" />
								<span className="absolute top-0 right-0 w-5 h-5 bg-error text-white 
											 rounded-full text-xs flex items-center justify-center
											 border-2 border-white font-bold">
									3
								</span>
							</button>
							<button 
								className="btn btn-secondary btn-small"
								aria-label="Profile"
								title="View profile"
							>
								<span>Student</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto">
				{/* Summary cards */}
				<section className="tx-cards" aria-label="Summary">
					<div className="tx-card" aria-labelledby="c1">
						<div id="c1" className="title">Total Budget</div>
						<div className="value">{fmt(totals.totalBudget)}</div>
						<div className="meta">Planned for period</div>
					</div>

					<div className="tx-card" aria-labelledby="c2">
						<div id="c2" className="title">Amount Spent</div>
						<div className="value">{fmt(totals.spent)}</div>
						<div className="meta">{totals.totalBudget ? `${Math.round((totals.spent / totals.totalBudget) * 100)}% used` : '—'}</div>
					</div>

					<div className="tx-card" aria-labelledby="c3">
						<div id="c3" className="title">Savings This Month</div>
						<div className="value" style={{ color: 'var(--accent)' }}>{fmt(totals.savings)}</div>
						<div className="meta">Performance vs last month</div>
					</div>

					<div className="tx-card" aria-labelledby="c4">
						<div id="c4" className="title">Remaining Budget</div>
						<div className="value" style={{ color: 'var(--primary)' }}>{fmt(totals.remaining)}</div>
						<div className="meta">Keep tracking</div>
					</div>
				</section>

				{/* Transaction groups */}
				<section aria-label="Transactions">
					{filtered.length === 0 ? (
						<div style={{ padding: 18, color: 'var(--muted)' }}>No transactions found.</div>
					) : filtered.map(group => {
						const groupTotal = subtotal(group.items);
						return (
							<div key={group.date} className="tx-group">
								<div className="tx-group-header">
									<div>{new Date(group.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
									<div style={{ fontWeight: 800 }}>{fmt(groupTotal)}</div>
								</div>

								<ul className="tx-list" aria-label={`Transactions on ${group.date}`}>
									{group.items.map(tx => {
										const positive = Number(tx.amount) > 0;
										const icon = CATEGORY_ICON[tx.category] || CATEGORY_ICON.default;
										const initials = tx.merchant.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
										return (
											<li key={tx.id}>
												<article
													className="tx-item"
													role="button"
													tabIndex="0"
													aria-label={`${tx.merchant} ${tx.note} ${fmt(tx.amount)}`}
												>
													<div className="tx-left-col">
														<div className="tx-thumb" aria-hidden>
															<FontAwesomeIcon icon={icon} />
														</div>
														<div className="tx-merchant">
															<div className="name">{tx.merchant}</div>
															<div className="note">{tx.note}</div>
														</div>
													</div>

													<div className="tx-right">
														<div className={`tx-amount ${positive ? 'tx-pos' : 'tx-neg'}`}>
															{positive ? '' : '-'}{fmt(Math.abs(tx.amount))}
														</div>
														<div className="tx-time">{tx.time}</div>
													</div>
												</article>
											</li>
										);
									})}
								</ul>
							</div>
						);
					})}
				</section>
			</div>
		</div>
	);
}
