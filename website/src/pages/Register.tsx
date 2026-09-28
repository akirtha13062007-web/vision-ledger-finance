import { FormEvent, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Mail, Lock, User, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/\d/.test(password)) {
      setError("Password must contain a number.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain an uppercase letter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Unable to create account.");
        return;
      }

      navigate("/login");
    } catch (_error) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="min-h-screen grid lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex bg-emerald-500 p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <Wallet size={26} />
              </div>

              <span className="text-2xl font-bold">
                Vision Ledger
              </span>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-wide uppercase">
              Start your financial journey
            </p>

            <h1 className="mt-6 text-5xl font-bold leading-tight">
              Build better money habits.
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/90">
              Create your Vision Ledger account and get a clear view of
              your income, expenses, budgets, savings, and financial goals.
            </p>

            <div className="mt-10 space-y-5">
              {[
                "Track your daily spending",
                "Create and manage budgets",
                "Get intelligent financial insights",
                "Generate detailed financial reports",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                    <Check size={17} />
                  </div>

                  <span className="text-base">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/80">
            Smart finance management made simple.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-xl">

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Wallet size={24} />
              </div>

              <span className="text-xl font-bold">
                Vision Ledger
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold">
              Create your account
            </h2>

            <p className="mt-3 text-slate-400">
              Start managing your finances with Vision Ledger.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* NAME */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full name
                </label>

                <div className="relative">
                  <User
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-11 py-3.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-11 py-3.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-11 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  <p
                    className={
                      password.length >= 8
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }
                  >
                    ✓ At least 8 characters
                  </p>

                  <p
                    className={
                      /\d/.test(password)
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }
                  >
                    ✓ Contains a number
                  </p>

                  <p
                    className={
                      /[A-Z]/.test(password)
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }
                  >
                    ✓ Contains an uppercase letter
                  </p>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm password
                </label>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-11 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* TERMS */}
              <label className="flex items-start gap-3 text-sm text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) =>
                    setAcceptedTerms(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-emerald-500"
                />

                <span>
                  I agree to the{" "}
                  <span className="text-emerald-400">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-emerald-400">
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 py-3.5 font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
                {!isSubmitting && <ArrowRight size={18} />}
              </button>
            </form>

            {/* LOGIN */}
            <div className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Sign in
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}