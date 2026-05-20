import React from "react";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from "lucide-react";

const Home = () => {
	const [showBalance, setShowBalance] = React.useState(true);

	// Sample data - replace with actual data from your store/API
	const dashboardData = {
		totalBalance: 12450.50,
		totalIncome: 5000.00,
		totalExpenses: 2549.50,
		budgetUsed: 65,
		savingsGoal: 8000.00,
		savingsProgress: 45,
		recentTransactions: [
			{ id: 1, description: "Grocery Store", amount: -45.99, date: "Today", category: "Food", type: "expense" },
			{ id: 2, description: "Monthly Salary", amount: 2500.00, date: "Yesterday", category: "Income", type: "income" },
			{ id: 3, description: "Electric Bill", amount: -125.50, date: "2 days ago", category: "Utilities", type: "expense" },
			{ id: 4, description: "Freelance Project", amount: 400.00, date: "3 days ago", category: "Income", type: "income" },
			{ id: 5, description: "Restaurant", amount: -32.75, date: "4 days ago", category: "Food", type: "expense" },
		],
		spendingByCategory: [
			{ name: "Food", amount: 245.50, percentage: 32 },
			{ name: "Transport", amount: 185.25, percentage: 24 },
			{ name: "Entertainment", amount: 142.00, percentage: 19 },
			{ name: "Utilities", amount: 125.50, percentage: 16 },
			{ name: "Other", amount: 95.25, percentage: 9 },
		],
	};

	const formatCurrency = (value) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
		}).format(value);
	};

	return (
		<div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px 20px" }}>
			<div style={{ maxWidth: "1400px", margin: "0 auto" }}>
				{/* Page Header */}
				<div style={{ marginBottom: "32px" }}>
					<h1 className="page-title">Dashboard</h1>
					<p className="page-subtitle">Welcome back! Here's your financial overview</p>
				</div>

				{/* Summary Cards Grid */}
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "32px" }}>
					{/* Total Balance Card */}
					<div style={{
						padding: "24px",
						background: "linear-gradient(135deg, var(--accent) 0%, #0946CC 100%)",
						borderRadius: "14px",
						color: "white",
						boxShadow: "0 8px 20px rgba(11, 95, 255, 0.15)"
					}}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
							<div>
								<div style={{ fontSize: "13px", opacity: 0.9 }}>Total Balance</div>
								<div style={{ fontSize: "28px", fontWeight: 700, marginTop: "8px" }}>
									{showBalance ? formatCurrency(dashboardData.totalBalance) : "••••••"}
								</div>
							</div>
							<button
								onClick={() => setShowBalance(!showBalance)}
								style={{
									background: "rgba(255,255,255,0.2)",
									border: "none",
									color: "white",
									borderRadius: "8px",
									padding: "8px",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center"
								}}
							>
								{showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
							</button>
						</div>
						<div style={{ display: "flex", gap: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
							<div>
								<div style={{ fontSize: "11px", opacity: 0.8 }}>Income</div>
								<div style={{ fontSize: "14px", fontWeight: 600, marginTop: "4px" }}>+{formatCurrency(dashboardData.totalIncome)}</div>
							</div>
							<div>
								<div style={{ fontSize: "11px", opacity: 0.8 }}>Expenses</div>
								<div style={{ fontSize: "14px", fontWeight: 600, marginTop: "4px" }}>-{formatCurrency(dashboardData.totalExpenses)}</div>
							</div>
						</div>
					</div>

					{/* Income Card */}
					<div style={{
						padding: "24px",
						background: "var(--surface)",
						borderRadius: "14px",
						border: "1px solid var(--border-light)",
						boxShadow: "var(--shadow-sm)"
					}}>
						<div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
							<div style={{
								width: "48px",
								height: "48px",
								borderRadius: "10px",
								background: "rgba(15, 157, 88, 0.1)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							}}>
								<ArrowUpRight size={24} style={{ color: "var(--success)" }} />
							</div>
							<div>
								<div style={{ fontSize: "13px", color: "var(--slate-600)" }}>Total Income</div>
								<div style={{ fontSize: "22px", fontWeight: 700, color: "var(--navy-900)", marginTop: "4px" }}>
									{formatCurrency(dashboardData.totalIncome)}
								</div>
							</div>
						</div>
						<div style={{ fontSize: "12px", color: "var(--success)", display: "flex", alignItems: "center", gap: "4px" }}>
							<TrendingUp size={14} /> +12% from last month
						</div>
					</div>

					{/* Expenses Card */}
					<div style={{
						padding: "24px",
						background: "var(--surface)",
						borderRadius: "14px",
						border: "1px solid var(--border-light)",
						boxShadow: "var(--shadow-sm)"
					}}>
						<div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
							<div style={{
								width: "48px",
								height: "48px",
								borderRadius: "10px",
								background: "rgba(214, 69, 69, 0.1)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							}}>
								<ArrowDownLeft size={24} style={{ color: "var(--danger)" }} />
							</div>
							<div>
								<div style={{ fontSize: "13px", color: "var(--slate-600)" }}>Total Expenses</div>
								<div style={{ fontSize: "22px", fontWeight: 700, color: "var(--navy-900)", marginTop: "4px" }}>
									{formatCurrency(dashboardData.totalExpenses)}
								</div>
							</div>
						</div>
						<div style={{ fontSize: "12px", color: "var(--danger)", display: "flex", alignItems: "center", gap: "4px" }}>
							<TrendingDown size={14} /> -8% from last month
						</div>
					</div>
				</div>

				{/* Budget and Savings Progress */}
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "32px" }}>
					{/* Budget Progress */}
					<div style={{
						padding: "24px",
						background: "var(--surface)",
						borderRadius: "14px",
						border: "1px solid var(--border-light)",
						boxShadow: "var(--shadow-sm)"
					}}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
							<h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--navy-900)" }}>Monthly Budget</h3>
							<div style={{ fontSize: "14px", fontWeight: 600, color: "var(--accent)" }}>{dashboardData.budgetUsed}% Used</div>
						</div>
						<div style={{
							width: "100%",
							height: "12px",
							background: "var(--border-light)",
							borderRadius: "8px",
							overflow: "hidden",
							marginBottom: "12px"
						}}>
							<div style={{
								width: `${dashboardData.budgetUsed}%`,
								height: "100%",
								background: dashboardData.budgetUsed > 80 ? "var(--danger)" : "var(--accent)",
								borderRadius: "8px",
								transition: "width 0.3s ease"
							}} />
						</div>
						<div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--slate-600)" }}>
							<span>Spent: {formatCurrency(dashboardData.totalExpenses)}</span>
							<span>Budget: $4,000</span>
						</div>
					</div>

					{/* Savings Goal Progress */}
					<div style={{
						padding: "24px",
						background: "var(--surface)",
						borderRadius: "14px",
						border: "1px solid var(--border-light)",
						boxShadow: "var(--shadow-sm)"
					}}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
							<h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--navy-900)" }}>Savings Goal</h3>
							<div style={{ fontSize: "14px", fontWeight: 600, color: "var(--success)" }}>{dashboardData.savingsProgress}% Complete</div>
						</div>
						<div style={{
							width: "100%",
							height: "12px",
							background: "var(--border-light)",
							borderRadius: "8px",
							overflow: "hidden",
							marginBottom: "12px"
						}}>
							<div style={{
								width: `${dashboardData.savingsProgress}%`,
								height: "100%",
								background: "var(--success)",
								borderRadius: "8px",
								transition: "width 0.3s ease"
							}} />
						</div>
						<div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--slate-600)" }}>
							<span>Saved: {formatCurrency(dashboardData.savingsGoal * (dashboardData.savingsProgress / 100))}</span>
							<span>Goal: {formatCurrency(dashboardData.savingsGoal)}</span>
						</div>
					</div>
				</div>

				{/* Main Content Grid */}
				<div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
					{/* Recent Transactions */}
					<div style={{
						padding: "24px",
						background: "var(--surface)",
						borderRadius: "14px",
						border: "1px solid var(--border-light)",
						boxShadow: "var(--shadow-sm)"
					}}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
							<h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--navy-900)" }}>Recent Transactions</h3>
							<a href="/transactions" style={{ fontSize: "13px", color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>View All →</a>
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
							{dashboardData.recentTransactions.map((tx) => (
								<div key={tx.id} style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									padding: "14px",
									background: "var(--bg)",
									borderRadius: "10px",
									border: "1px solid var(--border-light)"
								}}>
									<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
										<div style={{
											width: "40px",
											height: "40px",
											borderRadius: "10px",
											background: tx.type === "income" ? "rgba(15, 157, 88, 0.1)" : "rgba(214, 69, 69, 0.1)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center"
										}}>
											{tx.type === "income" ? 
												<ArrowDownLeft size={20} style={{ color: "var(--success)" }} /> : 
												<ArrowUpRight size={20} style={{ color: "var(--danger)" }} />
											}
										</div>
										<div>
											<div style={{ fontSize: "14px", fontWeight: 500, color: "var(--navy-900)" }}>{tx.description}</div>
											<div style={{ fontSize: "12px", color: "var(--slate-600)" }}>{tx.date}</div>
										</div>
									</div>
									<div style={{ fontSize: "14px", fontWeight: 600, color: tx.type === "income" ? "var(--success)" : "var(--navy-900)" }}>
										{tx.type === "income" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Spending by Category */}
					<div style={{
						padding: "24px",
						background: "var(--surface)",
						borderRadius: "14px",
						border: "1px solid var(--border-light)",
						boxShadow: "var(--shadow-sm)"
					}}>
						<h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--navy-900)", marginBottom: "20px" }}>Spending by Category</h3>
						<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
							{dashboardData.spendingByCategory.map((cat, i) => (
								<div key={i}>
									<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
										<span style={{ fontSize: "13px", fontWeight: 500, color: "var(--navy-900)" }}>{cat.name}</span>
										<span style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent)" }}>{cat.percentage}%</span>
									</div>
									<div style={{
										width: "100%",
										height: "6px",
										background: "var(--border-light)",
										borderRadius: "4px",
										overflow: "hidden"
									}}>
										<div style={{
											width: `${cat.percentage}%`,
											height: "100%",
											background: "var(--accent)",
											borderRadius: "4px"
										}} />
									</div>
									<div style={{ fontSize: "11px", color: "var(--slate-600)", marginTop: "4px" }}>{formatCurrency(cat.amount)}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
