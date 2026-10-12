import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, Eye, EyeOff, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after login (default /dashboard)
  const from = location.state?.from?.pathname || "/dashboard";

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await login(email, password);
      toast.success(res?.message || "Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(msg);
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Column: Branding Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-tr from-indigo-900 via-indigo-700 to-violet-800 text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md">
            <Box className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">BorrowBox</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Campus Sharing Network
          </span>
          <h1 className="text-4xl font-extrabold leading-tight">
            "Don't buy it, <br />
            <span className="text-emerald-300">borrow it."</span>
          </h1>
          <p className="text-indigo-100 text-base leading-relaxed">
            Borrow books, calculators, lab coats, and gear from students around you. Simple, free, and sustainable.
          </p>
        </div>

        <div className="relative z-10 text-xs text-indigo-200/80">
          Peer-to-peer student lending • Secured with JWT
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/60">
          <div>
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white">
                <Box className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900">BorrowBox</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your email and password to access your items & requests.
            </p>
          </div>

          {errors.form && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 ${
                    errors.password ? "border-rose-500" : "border-slate-200"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-500 font-medium">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full justify-center text-base py-3 mt-2"
            >
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
