import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Lock, Mail, Bell, Palette, Shield, LogOut, User, Save, X, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Settings() {
	const { user } = useAuth();
	const [email, setEmail] = useState(user?.email || "");
	const [name, setName] = useState(user?.name || "");
	const [message, setMessage] = useState(null);
	const [activeTab, setActiveTab] = useState("profile");

	// Password change state
	const [showPwd, setShowPwd] = useState(false);
	const [showNewPwd, setShowNewPwd] = useState(false);
	const [currentPwd, setCurrentPwd] = useState("");
	const [newPwd, setNewPwd] = useState("");
	const [confirmPwd, setConfirmPwd] = useState("");
	const [saving, setSaving] = useState(false);

	// Notification preferences
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [weeklyDigest, setWeeklyDigest] = useState(true);
	const [budgetAlerts, setBudgetAlerts] = useState(true);

	const handleSaveSettings = async () => {
		if (!name.trim() || !email.trim()) {
			setMessage({ type: "error", text: "Please fill all required fields" });
			setTimeout(() => setMessage(null), 3000);
			return;
		}

		setSaving(true);
		try {
			const updated = { ...user, name: name.trim(), email: email.trim() };
			localStorage.setItem("sb:user", JSON.stringify(updated));
			setMessage({ type: "success", text: "Profile updated successfully" });
			setTimeout(() => {
				window.location.reload();
			}, 1500);
		} catch (e) {
			setMessage({ type: "error", text: "Failed to save profile" });
		} finally {
			setSaving(false);
			setTimeout(() => setMessage(null), 3000);
		}
	};

	const handleChangePassword = () => {
		if (!currentPwd.trim() || !newPwd.trim() || !confirmPwd.trim()) {
			setMessage({ type: "error", text: "Please fill all password fields" });
			setTimeout(() => setMessage(null), 3000);
			return;
		}

		if (newPwd !== confirmPwd) {
			setMessage({ type: "error", text: "Passwords don't match" });
			setTimeout(() => setMessage(null), 3000);
			return;
		}

		if (newPwd.length < 6) {
			setMessage({ type: "error", text: "Password must be at least 6 characters" });
			setTimeout(() => setMessage(null), 3000);
			return;
		}

		setMessage({ type: "success", text: "Password changed successfully" });
		setCurrentPwd("");
		setNewPwd("");
		setConfirmPwd("");
		setShowPwd(false);
		setTimeout(() => setMessage(null), 3000);
	};

	const tabs = [
		{ id: "profile", label: "Profile", icon: <User size={18} /> },
		{ id: "security", label: "Security", icon: <Shield size={18} /> },
		{ id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
		{ id: "display", label: "Display", icon: <Palette size={18} /> },
	];

	return (
		<div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 20px" }}>
			<div style={{ maxWidth: "1000px", margin: "0 auto" }}>
				{/* Page Header */}
				<div className="page-header">
					<h1 className="page-title">Settings</h1>
					<p className="page-subtitle">Manage your account, security, and preferences</p>
				</div>

				{/* Status Messages */}
				{message && (
					<div className={`alert alert-${message.type}`} style={{ marginBottom: "24px", animation: "slideInUp 300ms ease" }}>
						{message.type === "success" ? "âœ“" : "!"} {message.text}
					</div>
				)}

				{/* Tabs Navigation */}
				<div className="tabs" style={{ marginBottom: "32px", background: "var(--surface)", borderRadius: "12px", padding: "8px", border: "1px solid var(--border-light)", gap: "4px" }}>
					{tabs.map(tab => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
							style={{
								flex: "1",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "8px",
								borderRadius: "8px",
								padding: "10px 16px",
								margin: 0,
								borderBottom: "none",
								backgroundColor: activeTab === tab.id ? "var(--accent-50)" : "transparent",
								border: activeTab === tab.id ? "1px solid var(--accent)" : "none"
							}}
						>
							{tab.icon}
							<span style={{ fontSize: "14px", fontWeight: activeTab === tab.id ? "600" : "500" }}>{tab.label}</span>
						</button>
					))}
				</div>

				{/* Tab Content */}
				<div className="slide-in-up">
					{/* Profile Tab */}
					{activeTab === "profile" && (
						<div style={{ display: "grid", gap: "24px" }}>
							{/* Profile Card */}
							<div className="section" style={{ padding: "32px" }}>
								<div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "32px", marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid var(--border)" }}>
									{/* Avatar */}
									<div style={{ textAlign: "center" }}>
										<div style={{
											width: "120px",
											height: "120px",
											borderRadius: "16px",
											background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-600) 100%)",
											color: "white",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: "48px",
											fontWeight: 800,
											boxShadow: "0 4px 16px rgba(11, 95, 255, 0.24)"
										}}>
											{(name || user?.name || "U").charAt(0).toUpperCase()}
										</div>
										<button className="btn btn-secondary btn-small" style={{ marginTop: "12px", width: "100%" }}>
											Change Photo
										</button>
									</div>

									{/* Profile Info */}
									<div>
										<h3 className="section-title" style={{ marginTop: 0 }}>Personal Information</h3>
										<div style={{ display: "grid", gap: "16px" }}>
											<div className="form-group">
												<label className="form-label required">Full Name</label>
												<input
													type="text"
													placeholder="Your full name"
													value={name}
													onChange={(e) => setName(e.target.value)}
													className="form-input"
													style={{ width: "100%" }}
												/>
											</div>

											<div className="form-group">
												<label className="form-label required">Email Address</label>
												<input
													type="email"
													placeholder="your@email.com"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													className="form-input"
													style={{ width: "100%" }}
												/>
											</div>

											<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
												<button 
													onClick={() => {
														setName(user?.name || "");
														setEmail(user?.email || "");
													}}
													className="btn btn-secondary"
													style={{ width: "100%" }}
												>
													<X size={16} /> Cancel
												</button>
												<button 
													onClick={handleSaveSettings}
													disabled={saving}
													className="btn btn-primary"
													style={{ width: "100%", opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer" }}
												>
													<Save size={16} /> {saving ? "Saving..." : "Save Changes"}
												</button>
											</div>
										</div>
									</div>
								</div>

								{/* Account Info Grid */}
								<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
									<div style={{ padding: "16px", background: "var(--bg)", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
										<div className="form-help">Account Created</div>
										<div style={{ fontWeight: 600, color: "var(--navy-900)", marginTop: "4px" }}>January 2024</div>
									</div>
									<div style={{ padding: "16px", background: "var(--bg)", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
										<div className="form-help">Account Status</div>
										<div style={{ fontWeight: 600, color: "var(--success)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
											âœ“ Active
										</div>
									</div>
									<div style={{ padding: "16px", background: "var(--bg)", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
										<div className="form-help">Last Login</div>
										<div style={{ fontWeight: 600, color: "var(--navy-900)", marginTop: "4px" }}>Today at 2:30 PM</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Security Tab */}
					{activeTab === "security" && (
						<div style={{ display: "grid", gap: "24px" }}>
							{/* Change Password */}
							<div className="section" style={{ padding: "32px" }}>
								<h3 className="section-title" style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "8px" }}>
									<Lock size={20} /> Change Password
								</h3>
								<p style={{ color: "var(--slate-600)", marginBottom: "24px", fontSize: "14px" }}>
									Keep your account secure with a strong password
								</p>

								{!showPwd ? (
									<button className="btn btn-primary">
										Update Password
									</button>
								) : (
									<div style={{ display: "grid", gap: "16px", maxWidth: "400px" }}>
										<div className="form-group">
											<label className="form-label required">Current Password</label>
											<div style={{ position: "relative" }}>
												<input
													type={showNewPwd ? "text" : "password"}
													placeholder="Enter current password"
													value={currentPwd}
													onChange={(e) => setCurrentPwd(e.target.value)}
													className="form-input"
													style={{ width: "100%", paddingRight: "40px" }}
												/>
												<button
													type="button"
													onClick={() => setShowNewPwd(!showNewPwd)}
													style={{
														position: "absolute",
														right: "14px",
														top: "50%",
														transform: "translateY(-50%)",
														background: "none",
														border: "none",
														cursor: "pointer",
														color: "var(--slate-600)",
														padding: 0
													}}
												>
													{showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
												</button>
											</div>
										</div>

										<div className="form-group">
											<label className="form-label required">New Password</label>
											<input
												type="password"
												placeholder="Enter new password (min 6 chars)"
												value={newPwd}
												onChange={(e) => setNewPwd(e.target.value)}
												className="form-input"
												style={{ width: "100%" }}
											/>
											<div className="form-help">Min 6 characters, mix of letters and numbers recommended</div>
										</div>

										<div className="form-group">
											<label className="form-label required">Confirm Password</label>
											<input
												type="password"
												placeholder="Confirm new password"
												value={confirmPwd}
												onChange={(e) => setConfirmPwd(e.target.value)}
												className="form-input"
												style={{ width: "100%" }}
											/>
										</div>

										<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
											<button 
												onClick={() => {
													setShowPwd(false);
													setCurrentPwd("");
													setNewPwd("");
													setConfirmPwd("");
												}}
												className="btn btn-secondary"
												style={{ width: "100%" }}
											>
												<X size={16} /> Cancel
											</button>
											<button 
												onClick={handleChangePassword}
												className="btn btn-primary"
												style={{ width: "100%" }}
											>
												<Lock size={16} /> Update Password
											</button>
										</div>
									</div>
								)}
							</div>

							{/* Security Features */}
							<div className="section" style={{ padding: "32px" }}>
								<h3 className="section-title" style={{ marginTop: 0 }}>Security Features</h3>
								<div style={{ display: "grid", gap: "12px" }}>
									<div style={{ padding: "16px", background: "var(--bg)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
										<div>
											<div style={{ fontWeight: 600, color: "var(--navy-900)" }}>Two-Factor Authentication</div>
											<div className="form-help" style={{ marginTop: "4px" }}>Add an extra security layer</div>
										</div>
										<button className="btn btn-secondary btn-small">Enable</button>
									</div>

									<div style={{ padding: "16px", background: "var(--bg)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
										<div>
											<div style={{ fontWeight: 600, color: "var(--navy-900)" }}>Active Sessions</div>
											<div className="form-help" style={{ marginTop: "4px" }}>Manage your login sessions</div>
										</div>
										<button className="btn btn-secondary btn-small">Manage</button>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Notifications Tab */}
					{activeTab === "notifications" && (
						<div style={{ display: "grid", gap: "24px" }}>
							<div className="section" style={{ padding: "32px" }}>
								<h3 className="section-title" style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "8px" }}>
									<Bell size={20} /> Notification Preferences
								</h3>
								<p style={{ color: "var(--slate-600)", marginBottom: "24px", fontSize: "14px" }}>
									Choose how and when we contact you
								</p>

								<div style={{ display: "grid", gap: "12px" }}>
									<div style={{ padding: "16px", background: "var(--bg)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border-light)" }}>
										<div>
											<div style={{ fontWeight: 600, color: "var(--navy-900)" }}>Email Notifications</div>
											<div className="form-help" style={{ marginTop: "4px" }}>Receive notifications about your account</div>
										</div>
										<label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
											<input
												type="checkbox"
												checked={emailNotifications}
												onChange={(e) => setEmailNotifications(e.target.checked)}
												style={{ cursor: "pointer", width: "20px", height: "20px", accentColor: "var(--accent)" }}
											/>
										</label>
									</div>

									<div style={{ padding: "16px", background: "var(--bg)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border-light)" }}>
										<div>
											<div style={{ fontWeight: 600, color: "var(--navy-900)" }}>Weekly Digest</div>
											<div className="form-help" style={{ marginTop: "4px" }}>Get a weekly summary of your spending</div>
										</div>
										<label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
											<input
												type="checkbox"
												checked={weeklyDigest}
												onChange={(e) => setWeeklyDigest(e.target.checked)}
												style={{ cursor: "pointer", width: "20px", height: "20px", accentColor: "var(--accent)" }}
											/>
										</label>
									</div>

									<div style={{ padding: "16px", background: "var(--bg)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border-light)" }}>
										<div>
											<div style={{ fontWeight: 600, color: "var(--navy-900)" }}>Budget Alerts</div>
											<div className="form-help" style={{ marginTop: "4px" }}>Notify when approaching budget limits</div>
										</div>
										<label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
											<input
												type="checkbox"
												checked={budgetAlerts}
												onChange={(e) => setBudgetAlerts(e.target.checked)}
												style={{ cursor: "pointer", width: "20px", height: "20px", accentColor: "var(--accent)" }}
											/>
										</label>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Display Tab */}
					{activeTab === "display" && (
						<div style={{ display: "grid", gap: "24px" }}>
							<div className="section" style={{ padding: "32px" }}>
								<h3 className="section-title" style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "8px" }}>
									<Palette size={20} /> Display & Language
								</h3>

								<div style={{ display: "grid", gap: "16px" }}>
									<div>
										<label className="form-label">Theme</label>
										<select className="form-input" style={{ width: "100%", maxWidth: "300px" }}>
											<option>Light (Default)</option>
											<option>Dark</option>
											<option>Auto (Based on system)</option>
										</select>
									</div>

									<div>
										<label className="form-label">Currency</label>
										<select className="form-input" style={{ width: "100%", maxWidth: "300px" }}>
											<option value="MZN">MZN - Mozambican Metical</option>
											<option value="USD">USD - US Dollar</option>
											<option value="EUR">EUR - Euro</option>
											<option value="GBP">GBP - British Pound</option>
										</select>
										<div className="form-help">Affects all currency displays in the app</div>
									</div>

									<div>
										<label className="form-label">Language</label>
										<select className="form-input" style={{ width: "100%", maxWidth: "300px" }}>
											<option>English</option>
											<option>Portuguese</option>
											<option>Spanish</option>
										</select>
									</div>

									<div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
										<button className="btn btn-primary">Save Preferences</button>
									</div>
								</div>
							</div>

							{/* Danger Zone */}
							<div className="section" style={{ padding: "32px", border: "1px solid var(--danger-50)", background: "rgba(251, 230, 230, 0.3)" }}>
								<h3 className="section-title" style={{ marginTop: 0, color: "var(--danger)" }}>Danger Zone</h3>
								<p style={{ color: "var(--slate-600)", marginBottom: "16px", fontSize: "14px" }}>
									These actions are irreversible. Please proceed with caution.
								</p>

								<button style={{
									padding: "10px 20px",
									background: "var(--danger-50)",
									color: "var(--danger)",
									border: "1px solid var(--danger)",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
									transition: "all 200ms",
									fontSize: "14px"
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = "var(--danger)";
									e.currentTarget.style.color = "white";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = "var(--danger-50)";
									e.currentTarget.style.color = "var(--danger)";
								}}
								>
									Delete Account
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
