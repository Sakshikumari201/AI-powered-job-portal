import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  UserPlus, Moon, Sun, Sparkles, Mail, Lock, Eye, EyeOff,
  User, ArrowRight, ChevronRight, Briefcase, CheckCircle,
  Shield, Zap, BarChart3,
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', industry: 'Technology'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 2-step form

  const { register, googleLogin } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email) {
        setError('Please fill in all fields');
        return;
      }
      setError('');
      setStep(2);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(formData.name, formData.email, formData.password, formData.industry);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
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

  const industries = [
    { value: 'Technology', label: 'Technology', icon: '💻' },
    { value: 'Data Science', label: 'Data Science', icon: '📊' },
    { value: 'Finance', label: 'Finance', icon: '💰' },
    { value: 'Healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'General', label: 'General', icon: '🌐' },
  ];

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
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-primary-700 to-primary-600" />
        <div className="absolute top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-12 w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative flex flex-col justify-center px-12 py-16 text-white z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Resume<span className="text-white/70">Match</span>
            </span>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Start Your<br />
            Career Journey
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-10">
            Join thousands of professionals using AI to optimize their resumes and land their dream jobs.
          </p>

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
            <p className="text-xs text-white/30">Free to use • No credit card required</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Register Form ───────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-7 animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create an account</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Get started with your free AI resume analysis
            </p>
          </div>

          {/* Google Sign-Up */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Sign-Up was cancelled')}
                theme={darkMode ? 'filled_black' : 'outline'}
                size="large"
                width="400"
                text="signup_with"
                shape="pill"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-secondary-50 dark:bg-dark-bg text-gray-400 font-medium">or register with email</span>
              </div>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${step >= 1 ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
              {step > 1 ? <CheckCircle size={12} /> : <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>}
              Profile
            </div>
            <div className="w-6 h-px bg-gray-200 dark:bg-gray-700" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${step >= 2 ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
              <span className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              Security
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2.5 rounded-xl border border-red-100 dark:border-red-800 animate-fade-in font-medium">
                {error}
              </div>
            )}

            {step === 1 ? (
              /* ── Step 1: Name, Email, Industry ──────────────── */
              <div className="space-y-3 animate-fade-in">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={16} /></div>
                  <input
                    name="name" type="text" required placeholder="Full name"
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-card placeholder-gray-400 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                    value={formData.name} onChange={handleChange}
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={16} /></div>
                  <input
                    name="email" type="email" required placeholder="Email address"
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-card placeholder-gray-400 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                    value={formData.email} onChange={handleChange}
                  />
                </div>

                {/* Industry selector */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 pl-1">
                    <Briefcase size={12} /> Select your industry
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {industries.map(ind => (
                      <button
                        key={ind.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, industry: ind.value })}
                        className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-center transition-all duration-200 ${formData.industry === ind.value
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-300 dark:border-primary-700 shadow-sm'
                            : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-800'
                          }`}
                      >
                        <span className="text-lg">{ind.icon}</span>
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight">{ind.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Step 2: Password ──────────────────────────── */
              <div className="space-y-3 animate-fade-in">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                  <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Mail size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formData.name}</p>
                    <p className="text-xs text-gray-400">{formData.email}</p>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-primary-600 hover:text-primary-700 font-medium">Edit</button>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16} /></div>
                  <input
                    name="password" type={showPassword ? 'text' : 'password'} required placeholder="Create a password (min 6 characters)"
                    minLength={6}
                    className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-card placeholder-gray-400 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                    value={formData.password} onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${formData.password.length >= i * 3
                            ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-orange-400' : i <= 3 ? 'bg-yellow-400' : 'bg-emerald-400'
                            : 'bg-gray-200 dark:bg-gray-700'
                          }`} />
                      ))}
                    </div>
                    <p className={`text-[10px] font-medium ${formData.password.length >= 12 ? 'text-emerald-500' :
                        formData.password.length >= 9 ? 'text-yellow-500' :
                          formData.password.length >= 6 ? 'text-orange-500' : 'text-red-500'
                      }`}>
                      {formData.password.length >= 12 ? 'Strong password' :
                        formData.password.length >= 9 ? 'Good password' :
                          formData.password.length >= 6 ? 'Fair password' : 'Too short'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg shadow-primary-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                {!loading && <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />}
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : step === 1 ? (
                  <>
                    Continue <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <UserPlus size={18} /> Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center gap-1 group">
              Sign in <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
