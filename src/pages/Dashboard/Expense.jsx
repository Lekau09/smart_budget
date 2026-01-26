import React, { useState } from "react";
import { Plus, Filter, Download, X, Edit2, Trash2, Search, Calendar } from "lucide-react";

const Expense = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [showAddModal, setShowAddModal] = useState(false);
	const [expenses, setExpenses] = useState([
		{ id: 1, description: "Grocery Shopping", amount: 45.99, category: "Food", date: "2024-01-20", payment: "Credit Card" },
		{ id: 2, description: "Electric Bill", amount: 125.50, category: "Utilities", date: "2024-01-19", payment: "Bank Transfer" },
		{ id: 3, description: "Movie Tickets", amount: 32.00, category: "Entertainment", date: "2024-01-18", payment: "Cash" },
		{ id: 4, description: "Uber Ride", amount: 18.75, category: "Transport", date: "2024-01-17", payment: "Credit Card" },
		{ id: 5, description: "Coffee", amount: 5.50, category: "Food", date: "2024-01-17", payment: "Cash" },
		{ id: 6, description: "Gym Membership", amount: 50.00, category: "Health", date: "2024-01-15", payment: "Credit Card" },
		{ id: 7, description: "Internet Bill", amount: 60.00, category: "Utilities", date: "2024-01-15", payment: "Bank Transfer" },
		{ id: 8, description: "Restaurant", amount: 68.50, category: "Food", date: "2024-01-14", payment: "Credit Card" },
	]);

	const categories = [
		{ name: "all", label: "All Categories", color: "var(--accent)" },
		{ name: "food", label: "Food", color: "#FF6B6B" },
		{ name: "transport", label: "Transport", color: "#4ECDC4" },
		{ name: "entertainment", label: "Entertainment", color: "#FFE66D" },
		{ name: "utilities", label: "Utilities", color: "#95E1D3" },
		{ name: "health", label: "Health", color: "#C44569" },
		{ name: "shopping", label: "Shopping", color: "#F38181" },
	];

	const filteredExpenses = expenses.filter(expense => {
		const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = selectedCategory === "all" || expense.category.toLowerCase() === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

	const handleDelete = (id) => {
		setExpenses(expenses.filter(e => e.id !== id));
	};

	return (
		<div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px 20px" }}>
			<div style={{ maxWidth: "1200px", margin: "0 auto" }}>
				{/* Page Header */}
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
					<div>
					<h1 style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", margin: 0, marginBottom: "8px", letterSpacing: "-0.5px" }}>Expenses</h1>
					<p style={{ fontSize: "16px", color: "var(--text-secondary)", margin: 0 }}>Track and manage your spending</p>
					</div>
					<button
						onClick={() => setShowAddModal(true)}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							padding: "12px 20px",
							background: "var(--accent)",
							color: "white",
							border: "none",
							borderRadius: "8px",
							fontWeight: 600,
							cursor: "pointer",
							transition: "all 0.2s"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "#0946CC";
							e.currentTarget.style.boxShadow = "0 4px 12px rgba(11,95,255,0.3)";
							e.currentTarget.style.transform = "translateY(-2px)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "var(--accent)";
							e.currentTarget.style.boxShadow = "none";
							e.currentTarget.style.transform = "translateY(0)";
						}}
					>
						<Plus size={18} /> Add Expense
					</button>
				</div>

				{/* Summary Card */}
				<div style={{
					padding: "24px",
					background: "var(--surface)",
					borderRadius: "14px",
					border: "1px solid var(--border-light)",
					marginBottom: "32px",
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: "20px"
				}}>
					<div>
						<div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Expenses</div>
						<div style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)" }}>
							${totalExpenses.toFixed(2)}
						</div>
					</div>
					<div>
						<div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Number of Expenses</div>
						<div style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)" }}>
							{filteredExpenses.length}
						</div>
					</div>
					<div>
						<div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Average Expense</div>
						<div style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)" }}>
							${(totalExpenses / (filteredExpenses.length || 1)).toFixed(2)}
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
									placeholder="Search expenses..."
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

					{/* Category Filters */}
					<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
						{categories.map(cat => (
							<button
								key={cat.name}
								onClick={() => setSelectedCategory(cat.name)}
								style={{
									padding: "8px 16px",
									background: selectedCategory === cat.name ? cat.color : "var(--bg)",
									color: selectedCategory === cat.name ? "white" : "var(--slate-600)",
									border: selectedCategory === cat.name ? `2px solid ${cat.color}` : "1px solid var(--border-light)",
									borderRadius: "20px",
									cursor: "pointer",
									fontSize: "13px",
									fontWeight: 500,
									transition: "all 0.2s"
								}}
							>
								{cat.label}
							</button>
						))}
					</div>
				</div>

				{/* Expenses Table */}
				<div style={{
					background: "var(--surface)",
					borderRadius: "14px",
					border: "1px solid var(--border-light)",
					overflow: "hidden"
				}}>
					<div style={{
						display: "grid",
						gridTemplateColumns: "2fr 1fr 1fr 1fr 100px",
						gap: "0",
						padding: "0",
						borderBottom: "1px solid var(--border-light)"
					}}>
					<div style={{ padding: "16px", fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Description</div>
					<div style={{ padding: "16px", fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</div>
					<div style={{ padding: "16px", fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</div>
					<div style={{ padding: "16px", fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)", textAlign: "right", textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount</div>
					<div style={{ padding: "16px", fontWeight: 600, fontSize: "14px", color: "var(--text-secondary)" }}></div>
					</div>

					{filteredExpenses.length === 0 ? (
						<div style={{ padding: "40px", textAlign: "center", color: "var(--slate-600)" }}>
							No expenses found
						</div>
					) : (
						filteredExpenses.map((expense, idx) => (
							<div
								key={expense.id}
								style={{
									display: "grid",
									gridTemplateColumns: "2fr 1fr 1fr 1fr 100px",
									gap: "0",
									padding: "0",
									borderBottom: idx !== filteredExpenses.length - 1 ? "1px solid var(--border-light)" : "none",
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
									<div style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: "15px" }}>{expense.description}</div>
									<div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{expense.payment}</div>
								</div>
								<div style={{ padding: "16px" }}>
									<span style={{
										padding: "4px 10px",
										background: "rgba(255,107,107,0.1)",
										color: "#FF6B6B",
										borderRadius: "6px",
										fontSize: "13px",
										fontWeight: 500
									}}>
										{expense.category}
									</span>
								</div>
								<div style={{ padding: "16px", fontSize: "15px", color: "var(--text-secondary)" }}>
									{new Date(expense.date).toLocaleDateString()}
								</div>
								<div style={{ padding: "16px", textAlign: "right", fontWeight: 600, fontSize: "15px", color: "var(--danger)" }}>
									-${expense.amount.toFixed(2)}
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
										onClick={() => handleDelete(expense.id)}
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

export default Expense;