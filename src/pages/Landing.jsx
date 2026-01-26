import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { DollarSign, BarChart3, CreditCard, PiggyBank, TrendingUp, Target, Clock, Plus, Play, Check } from "lucide-react";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh", overflow: "hidden" }}>
      {/* Sticky Header */}
      <header style={{ 
        position: "sticky", 
        top: 0, 
        background: "var(--bg)", 
        borderBottom: "1px solid var(--border-light)", 
        boxShadow: "var(--shadow-xs)",
        zIndex: 50
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: 700, fontSize: "20px", color: "var(--text-primary)" }}>
            <DollarSign size={24} /> SmartBudget
          </div>
          <nav style={{ display: "flex", gap: "28px", alignItems: "center" }}>
            <a href="#features" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "14px", fontWeight: 500 }}>Features</a>
            <a href="#how" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "14px", fontWeight: 500 }}>How It Works</a>
            <a href="#testimonials" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "14px", fontWeight: 500 }}>Testimonials</a>
            <a href="#pricing" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "14px", fontWeight: 500 }}>Pricing</a>
            <Link to="/signup" className="btn-primary" style={{ background: "#0B5FFF", color: "#111", fontWeight: "bold", fontSize: "16px", padding: "14px 32px", borderRadius: "12px", border: "none", boxShadow: "0 2px 8px rgba(11,95,255,0.08)", textDecoration: "none", display: "inline-block", transition: "all 0.15s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0946CC";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(11,95,255,0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0B5FFF";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(11,95,255,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "80px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "52px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", lineHeight: 1.2 }}>
            Master Your Money, <span style={{ color: "var(--primary)" }}>Transform Your Future</span>
          </h1>
          <p style={{ fontSize: "18px", color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.6 }}>
            SmartBudget helps students like you take control of expenses, build savings goals, and develop financial habits that last a lifetime.
          </p>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link 
              to="/signup" 
              className="btn-primary" 
              style={{ background: "#0B5FFF", color: "#111", fontWeight: "bold", fontSize: "16px", padding: "14px 32px", borderRadius: "12px", border: "none", boxShadow: "0 2px 8px rgba(11,95,255,0.08)", textDecoration: "none", display: "inline-block", transition: "all 0.15s ease", cursor: "pointer" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0946CC";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(11,95,255,0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0B5FFF";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(11,95,255,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Plus size={16} style={{ marginRight: "8px" }} /> Start Free Today
            </Link>
            <button 
              style={{ background: "transparent", color: "var(--primary)", border: "1px solid var(--primary)", padding: "14px 32px", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: "pointer", transition: "all 0.15s ease" }} 
              onMouseEnter={(e) => { 
                e.currentTarget.style.background = "rgba(11,95,255,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(11,95,255,0.1)";
              }} 
              onMouseLeave={(e) => { 
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Play size={16} style={{ marginRight: "8px" }} /> Watch Demo
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Financial Dashboard" style={{ width: "100%", height: "400px", borderRadius: "18px", objectFit: "cover", border: "1px solid var(--border-light)" }} />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ maxWidth: "1400px", margin: "0 auto", padding: "80px 28px", background: "var(--bg)", borderRadius: "18px", marginBottom: "80px" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "42px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>Features Built for You</h2>
          <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>Everything you need to manage money responsibly</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {[
            { icon: <BarChart3 size={40} />, title: "Dashboard", desc: "Real-time overview of your spending, budget, and savings goals", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
            { icon: <CreditCard size={40} />, title: "Transactions", desc: "Track every expense with smart categorization and search", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
            { icon: <PiggyBank size={40} />, title: "Savings Goals", desc: "Set targets and watch your progress visualized in real-time", img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
            { icon: <TrendingUp size={40} />, title: "Analytics", desc: "Deep insights into spending patterns and trends", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
            { icon: <Target size={40} />, title: "Goals & Plans", desc: "Plan for the future with personalized financial goals", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
            { icon: <Clock size={40} />, title: "Session History", desc: "Track your activity and insights over time", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
          ].map((f, i) => (
            <div key={i} style={{ padding: "28px", borderRadius: "14px", background: "var(--surface)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)", transition: "all var(--transition-normal)" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <img src={f.img} alt={f.title} style={{ width: "100%", height: "120px", borderRadius: "8px", objectFit: "cover", marginBottom: "16px" }} />
              <div style={{ marginBottom: "16px" }}>{f.icon}</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>{f.title}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" style={{ maxWidth: "1400px", margin: "0 auto", padding: "80px 28px" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "42px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>How It Works</h2>
          <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>Get started in 3 simple steps</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px" }}>
          {[
            { step: "1", title: "Sign Up", desc: "Create your free account and set your budget" },
            { step: "2", title: "Track Spending", desc: "Log expenses or connect your bank accounts" },
            { step: "3", title: "Achieve Goals", desc: "Watch insights grow and reach your financial targets" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 800, margin: "0 auto 20px" }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>{item.title}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={{ maxWidth: "1400px", margin: "0 auto", padding: "80px 28px" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "42px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>Loved by Students</h2>
          <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>See what our users have to say</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {[
            { name: "Sarah M.", role: "University Student", text: "SmartBudget helped me save M10,000 in just 6 months. The insights are incredible!" },
            { name: "James T.", role: "College Senior", text: "Finally understanding where my money goes. This app is a game-changer for students." },
            { name: "Emma L.", role: "First Year", text: "The goal-setting feature kept me accountable. Highly recommend to all students!" },
          ].map((t, i) => (
            <div key={i} style={{ padding: "28px", borderRadius: "14px", background: "var(--bg)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px", fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{t.name}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ maxWidth: "1400px", margin: "0 auto", padding: "80px 28px" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "42px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>Simple, Transparent Pricing</h2>
          <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>Choose the plan that works for you</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {[
            { plan: "Free", price: "0", features: ["Dashboard & tracking", "Basic insights", "Up to 5 goals", "Community support"] },
            { plan: "Pro", price: "4.99", features: ["Everything in Free", "Advanced analytics", "Unlimited goals", "Priority support", "Export reports"], highlight: true },
            { plan: "Premium", price: "9.99", features: ["Everything in Pro", "AI-powered insights", "Bank integration", "Family sharing", "Custom budgets"] },
          ].map((p, i) => (
            <div key={i} style={{ padding: "40px", borderRadius: "14px", background: "var(--bg)", border: p.highlight ? "2px solid var(--primary)" : "1px solid var(--border-light)", boxShadow: p.highlight ? "var(--shadow-md)" : "var(--shadow-sm)", position: "relative" }}>
              {p.highlight && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--primary)", color: "white", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>Popular</div>}
              <h3 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>{p.plan}</h3>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)", marginBottom: "4px" }}>M{p.price}<span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/mo</span></div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "28px" }}>Billed monthly</p>
              <Link
                to="/signup"
                style={{
                  display: "block",
                  textAlign: "center",
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  border: p.highlight ? "none" : "1px solid var(--border-light)",
                  background: p.highlight ? "var(--primary)" : "transparent",
                  color: p.highlight ? "white" : "var(--primary)",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginBottom: "24px",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => { 
                  if (p.highlight) {
                    e.currentTarget.style.background = "#0946CC";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(11,95,255,0.3)";
                  } else {
                    e.currentTarget.style.background = "rgba(11,95,255,0.08)";
                  }
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => { 
                  if (p.highlight) {
                    e.currentTarget.style.background = "var(--primary)";
                    e.currentTarget.style.boxShadow = "none";
                  } else {
                    e.currentTarget.style.background = "transparent";
                  }
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Get Started
              </Link>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", display: "flex", gap: "8px" }}>
                    <Check size={14} color="var(--success)" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "80px 28px", background: "var(--primary)", borderRadius: "18px", textAlign: "center", color: "white", marginBottom: "80px" }}>
        <h2 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "16px" }}>Ready to Take Control?</h2>
        <p style={{ fontSize: "18px", marginBottom: "32px" }}>Join thousands of students mastering their finances</p>
        <Link to="/signup" className="btn-primary" style={{ textDecoration: "none", background: "white", color: "var(--primary)", fontSize: "16px", padding: "14px 40px", borderRadius: "12px", fontWeight: 700, display: "inline-block", transition: "all 0.15s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
          Start Your Free Account Today
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--bg)", borderTop: "1px solid var(--border-light)", padding: "60px 28px 28px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px", marginBottom: "40px" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><DollarSign size={16} /> SmartBudget</div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Empowering students to take control of their financial future.</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "12px" }}>Product</div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {["Features", "Pricing", "Security", "Blog"].map((item, i) => (
                <li key={i} style={{ marginBottom: "8px" }}><a href="#" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "14px" }}>{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "12px" }}>Company</div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {["About", "Contact", "Careers", "Press"].map((item, i) => (
                <li key={i} style={{ marginBottom: "8px" }}><a href="#" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "14px" }}>{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "12px" }}>Follow Us</div>
            <div style={{ display: "flex", gap: "12px" }}>
              {["Twitter", "Facebook", "LinkedIn", "Instagram"].map((social, i) => (
                <a key={i} href="#" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "14px", transition: "color var(--transition-fast)" }} onMouseEnter={(e) => e.target.style.color = "var(--primary)"} onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}>
                  {social[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>© 2024 SmartBudget. All rights reserved.</p>
          <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "var(--text-muted)" }}>
            <a href="#" style={{ textDecoration: "none", color: "inherit" }}>Privacy Policy</a>
            <a href="#" style={{ textDecoration: "none", color: "inherit" }}>Terms of Service</a>
            <a href="#" style={{ textDecoration: "none", color: "inherit" }}>Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
