import React, { useState } from "react";
import { Plus, Filter, Download, Edit2, Trash2, Search, Calendar, TrendingUp } from "lucide-react";

const Income = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSource, setSelectedSource] = useState("all");
	const [incomes, setIncomes] = useState([
		{ id: 1, description: "Monthly Salary", amount: 2500.00, source: "Employment", date: "2024-01-01", status: "received" },
		{ id: 2, description: "Freelance Project", amount: 400.00, source: "Freelance", date: "2024-01-18", status: "received" },
		{ id: 3, description: "Investment Dividend", amount: 125.50, source: "Investment", date: "2024-01-15", status: "received" },
		{ id: 4, description: "Side Gig Payment", amount: 85.00, source: "Side Income", date: "2024-01-12", status: "received" },
		{ id: 5, description: "Bonus", amount: 500.00, source: "Employment", date: "2024-01-10", status: "received" },
		{ id: 6, description: "Freelance Project 2", amount: 600.00, source: "Freelance", date: "2024-01-05", status: "received" },
		{ id: 7, description: "Consulting Work", amount: 300.00, source: "Consulting", date: "2024-01-02", status: "received" },
		{ id: 8, description: "Upwork Job", amount: 150.00, source: "Freelance", date: "2023-12-28", status: "received" },
	]);

	const sources = [
		{ name: "all", label: "All Sources", color: "var(--accent)" },
		{ name: "employment", label: "Employment", color: "#10B981" },
		{ name: "freelance", label: "Freelance", color: "#3B82F6" },
		{ name: "investment", label: "Investment", color: "#F59E0B" },
		{ name: "consulting", label: "Consulting", color: "#8B5CF6" },
		{ name: "side income", label: "Side Income", color: "#EC4899" },
	];

	const filteredIncomes = incomes.filter(income => {
		const matchesSearch = income.description.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesSource = selectedSource === "all" || income.source.toLowerCase() === selectedSource;
		return matchesSearch && matchesSource;
	});

	const totalIncome = filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0);
	const monthlyAverage = (totalIncome / (filteredIncomes.length || 1));

	const handleDelete = (id) => {
		setIncomes(incomes.filter(i => i.id !== id));
	};

	return (
		<div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px 20px" }}>
			<div style={{ maxWidth: "1200px", margin: "0 auto" }}>
				{/* Page Header */}
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
					<div>
						<h1 className="page-title">Income</h1>
						<p className="page-subtitle">Track and manage your income sources</p>
					</div>
					<button
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							padding: "12px 20px",
							background: "var(--success)",
							color: "white",
							border: "none",
							borderRadius: "8px",
							fontWeight: 600,
							cursor: "pointer",
							transition: "all 0.2s"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "#0D8A4E";
							e.currentTarget.style.boxShadow = "0 4px 12px rgba(15,157,88,0.3)";
							e.currentTarget.style.transform = "translateY(-2px)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "var(--success)";
							e.currentTarget.style.boxShadow = "none";
							e.currentTarget.style.transform = "translateY(0)";
						}}
					>
						<Plus size={18} /> Add Income
					</button>
				</div>

				{/* Summary Cards */}
				<div style={{
					padding: "24px",
					background: "linear-gradient(135deg, var(--success) 0%, #0D8A4E 100%)",
					borderRadius: "14px",
					color: "white",
					marginBottom: "32px",
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					gap: "20px",
					boxShadow: "0 8px 20px rgba(15, 157, 88, 0.15)"
				}}>
					<div>
						<div style={{ fontSize: "13px", opacity: 0.9 }}>Total Income (Filtered)</div>
						<div style={{ fontSize: "28px", fontWeight: 700, marginTop: "8px" }}>
							${totalIncome.toFixed(2)}
						</div>
					</div>
					<div>
						<div style={{ fontSize: "13px", opacity: 0.9 }}>Number of Entries</div>
						<div style={{ fontSize: "28px", fontWeight: 700, marginTop: "8px" }}>
							{filteredIncomes.length}
						</div>
					</div>
					<div>
						<div style={{ fontSize: "13px", opacity: 0.9 }}>Average per Entry</div>
						<div style={{ fontSize: "28px", fontWeight: 700, marginTop: "8px" }}>
							${monthlyAverage.toFixed(2)}
						</div>
					</div>
					<div>
						<div style={{ fontSize: "13px", opacity: 0.9 }}>This Month</div>
						<div style={{ fontSize: "28px", fontWeight: 700, marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
							${(totalIncome * 0.7).toFixed(2)} <TrendingUp size={20} />
						</div>
					</div>
				</div>

				{/* Filters */}
				<div style={{
					padding: "20px",
					background: "var(--surface)",
					borderRadius: "14px",
					border: "1px solid var(--border-light)",
					marginBottom: "24px"
				}}>
					{/* Search */}
					<div style={{ marginBottom: "20px" }}>
						<div style={{ position: "relative", display: "flex", gap: "12px", alignItems: "center" }}>
							<div style={{ position: "relative", flex: 1 }}>
								<Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--slate-600)" }} />
								<input
									type="text"
									placeholder="Search income..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									style={{
										width: "100%",
										padding: "10px 12px 10px 40px",
										border: "1px solid var(--border-light)",
										borderRadius: "8px",
										fontSize: "14px",
										fontFamily: "var(--font-family)"
									}}
								/>
							</div>
							<button style={{
								padding: "10px 14px",
								background: "var(--border-light)",
								border: "none",
								borderRadius: "8px",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "6px",
								color: "var(--slate-600)",
								fontWeight: 500,
								fontSize: "13px"
							}}>
								<Calendar size={16} /> Date Range
							</button>
							<button style={{
								padding: "10px 14px",
								background: "var(--border-light)",
								border: "none",
								borderRadius: "8px",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "6px",
								color: "var(--slate-600)",
								fontWeight: 500,
								fontSize: "13px"
							}}>
								<Download size={16} /> Export
							</button>
						</div>
					</div>

					{/* Source Filters */}
					<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
						{sources.map(src => (
							<button
								key={src.name}
								onClick={() => setSelectedSource(src.name)}
								style={{
									padding: "8px 16px",
									background: selectedSource === src.name ? src.color : "var(--bg)",
									color: selectedSource === src.name ? "white" : "var(--slate-600)",
									border: selectedSource === src.name ? `2px solid ${src.color}` : "1px solid var(--border-light)",
									borderRadius: "20px",
									cursor: "pointer",
									fontSize: "13px",
									fontWeight: 500,
									transition: "all 0.2s"
								}}
							>
								{src.label}
							</button>
						))}
					</div>
				</div>

				{/* Income Table */}
				<div style={{
					background: "var(--surface)",
					borderRadius: "14px",
					border: "1px solid var(--border-light)",
					overflow: "hidden"
				}}>
					<div style={{
						display: "grid",
						gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
						gap: "0",
						padding: "0",
						borderBottom: "1px solid var(--border-light)"
					}}>
						<div style={{ padding: "16px", fontWeight: 600, fontSize: "13px", color: "var(--slate-600)" }}>Description</div>
						<div style={{ padding: "16px", fontWeight: 600, fontSize: "13px", color: "var(--slate-600)" }}>Source</div>
						<div style={{ padding: "16px", fontWeight: 600, fontSize: "13px", color: "var(--slate-600)" }}>Date</div>
						<div style={{ padding: "16px", fontWeight: 600, fontSize: "13px", color: "var(--slate-600)", textAlign: "right" }}>Amount</div>
						<div style={{ padding: "16px", fontWeight: 600, fontSize: "13px", color: "var(--slate-600)" }}></div>
					</div>

					{filteredIncomes.length === 0 ? (
						<div style={{ padding: "40px", textAlign: "center", color: "var(--slate-600)" }}>
							No income found
						</div>
					) : (
						filteredIncomes.map((income, idx) => (
							<div
								key={income.id}
								style={{
									display: "grid",
									gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
									gap: "0",
									padding: "0",
									borderBottom: idx !== filteredIncomes.length - 1 ? "1px solid var(--border-light)" : "none",
									alignItems: "center",
									transition: "background 0.2s"
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = "var(--bg)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = "transparent";
								}}
							>
								<div style={{ padding: "16px" }}>
									<div style={{ fontWeight: 500, color: "var(--navy-900)", fontSize: "14px" }}>{income.description}</div>
									<div style={{ fontSize: "12px", color: "var(--success)", marginTop: "4px" }}>✓ {income.status}</div>
								</div>
								<div style={{ padding: "16px" }}>
									<span style={{
										padding: "4px 10px",
										background: "rgba(16, 185, 129, 0.1)",
										color: "#10B981",
										borderRadius: "6px",
										fontSize: "12px",
										fontWeight: 500
									}}>
										{income.source}
									</span>
								</div>
								<div style={{ padding: "16px", fontSize: "14px", color: "var(--slate-600)" }}>
									{new Date(income.date).toLocaleDateString()}
								</div>
								<div style={{ padding: "16px", textAlign: "right", fontWeight: 600, fontSize: "14px", color: "var(--success)" }}>
									+${income.amount.toFixed(2)}
								</div>
								<div style={{ padding: "16px", display: "flex", gap: "6px", justifyContent: "center" }}>
									<button
										style={{
											background: "none",
											border: "none",
											color: "var(--accent)",
											cursor: "pointer",
											padding: "4px"
										}}
									>
										<Edit2 size={16} />
									</button>
									<button
										onClick={() => handleDelete(income.id)}
										style={{
											background: "none",
											border: "none",
											color: "var(--danger)",
											cursor: "pointer",
											padding: "4px"
										}}
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default Income;