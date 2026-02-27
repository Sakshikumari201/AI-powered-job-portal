import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LogIn, Moon, Sun, Sparkles, Mail, Lock, Eye, EyeOff,
  ArrowRight, Shield, Zap, BarChart3, ChevronRight,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Shield, label: 'ATS Scoring', desc: 'AI-powered resume analysis' },
    { icon: Zap, label: 'Skill Detection', desc: 'NLP-based gap analysis' },
    { icon: BarChart3, label: 'Job Matching', desc: 'TF-IDF ranked results' },
  ];

  return (
    <div className="min-h-screen flex bg-secondary-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 w-10 h-10 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-center hover:shadow-lg transition-all z-10"
      >
        {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-gray-500" />}
      </button>

      {/* ── Left Panel — Branding ──────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
        {/* Decorative circles */}
        <div className="absolute top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-12 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute bottom-1/3 left-8 w-3 h-3 bg-white/20 rounded-full" />
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white/15 rounded-full" />

        <div className="relative flex flex-col justify-center px-12 py-16 text-white z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Resume<span className="text-white/70">Match</span>
            </span>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            AI-Powered<br />
            Resume Analysis
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-10">
            Get instant ATS scoring, intelligent skill gap detection, and personalized job recommendations powered by NLP and TF-IDF matching.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:bg-white/15 transition-colors">
                    <Icon size={18} className="text-white/80" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{f.label}</p>
                    <p className="text-xs text-white/50">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-12">
            <p className="text-xs text-white/30">Trusted by 1000+ job seekers worldwide</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Login Form ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sign in to continue analyzing your resume
            </p>
          </div>

          {/* Google Sign-In */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Sign-In was cancelled')}
                theme={darkMode ? 'filled_black' : 'outline'}
                size="large"
                width="400"
                text="signin_with"
                shape="pill"
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-secondary-50 dark:bg-dark-bg text-gray-400 font-medium">or continue with email</span>
              </div>
            </div>
          </div>

          {/* Email/Password Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2.5 rounded-xl border border-red-100 dark:border-red-800 animate-fade-in font-medium">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Email */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email-address" name="email" type="email" required
                  className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-card placeholder-gray-400 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'} required
                  className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-card placeholder-gray-400 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg shadow-primary-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {!loading && <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />}
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} /> Sign In
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center gap-1 group">
              Create one <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
