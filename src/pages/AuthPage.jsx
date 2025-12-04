import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSun, FiMoon } from "react-icons/fi";

// Use Vite dev proxy: see vite.config.js (`/api` -> backend)
const API_BASE = "/api";

export function AuthPage() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [theme, setTheme] = useState("light");

  const navigate = useNavigate();

  // Sync theme on first load so login page respects saved preference
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              full_name: form.name,
              email: form.email,
              password: form.password,
            };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (mode === "login") {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        Swal.fire({
          title: "Welcome back 👋",
          text: "Login successful, redirecting to dashboard",
          icon: "success",
          timer: 1400,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        Swal.fire({
          title: "Account created 🎉",
          text: "You can now login with your new account",
          icon: "success",
          confirmButtonColor: "#6366f1",
        });
        setMode("login");
      }
    } catch (err) {
      Swal.fire({
        title: "Oops",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 hover:bg-[var(--bg-tertiary)] text-base shadow-sm"
      >
        {theme === "light" ? <FiSun /> : <FiMoon />}
      </button>
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left: marketing / hero */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)]/80 px-3 py-1 text-xs font-medium text-[var(--text-secondary)] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-color)] animate-pulse" />
            Realtime AI content workflow
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            Design, ship, and manage AI content in one place.
          </h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
            Consist helps your marketing, product, and engineering teams
            orchestrate AI-generated content with audit trails, collaboration,
            and analytics on top of your existing stack.
          </p>

          <div className="grid grid-cols-3 gap-4 text-xs text-[var(--text-secondary)]">
            <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)]/70 p-3 backdrop-blur">
              <p className="font-semibold text-[var(--text-primary)] mb-1">
                Content AI
              </p>
              <p>
                Generate and iterate blog posts, ads, and onboarding flows with
                guardrails.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)]/70 p-3 backdrop-blur">
              <p className="font-semibold text-[var(--text-primary)] mb-1">
                Team Hub
              </p>
              <p>
                Assign owners, review drafts, and keep approvals in sync across
                teams.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)]/70 p-3 backdrop-blur">
              <p className="font-semibold text-[var(--text-primary)] mb-1">
                Insights
              </p>
              <p>
                Measure performance by channel, campaign, and content type in
                real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="relative">
          <div className="pointer-events-none absolute -inset-1 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(99,102,241,0.65),transparent_40%,rgba(6,182,212,0.7),transparent_70%)] blur-xl opacity-70" />
          <div className="relative rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/90 shadow-2xl shadow-[var(--shadow-color-dark)] p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-[0.25em]">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </p>
                <p className="text-lg md:text-xl font-semibold mt-1">
                  {mode === "login"
                    ? "Sign in to Consist"
                    : "Start with Consist AI"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-xs font-medium text-[var(--primary-color)] hover:text-[var(--primary-dark)] underline-offset-4 hover:underline"
              >
                {mode === "login"
                  ? "Need an account?"
                  : "Already have an account?"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/80 px-3 py-2.5 text-sm outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30 transition"
                    placeholder="e.g. Alex from Growth"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/80 px-3 py-2.5 text-sm outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30 transition"
                  placeholder="you@company.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/80 px-3 py-2.5 text-sm outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/30 transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--gradient-primary)] text-white text-sm font-medium py-2.5 shadow-lg shadow-[var(--shadow-color-dark)] hover:shadow-xl hover:brightness-110 active:scale-[0.99] transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading && (
                  <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                )}
                <span>{mode === "login" ? "Sign in" : "Create account"}</span>
              </button>
            </form>

            <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
              <span className="h-[1px] flex-1 bg-[var(--border-light)]" />
              <span>Single workspace preview</span>
              <span className="h-[1px] flex-1 bg-[var(--border-light)]" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--success-color)] animate-pulse" />
                <p>JWT-secured API</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
                <p>Role-based workflows</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--info-color)] animate-pulse" />
                <p>Live activity timeline</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
