import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PageWrapper from '../components/PageWrapper';
import {
  Sparkles, Shield, Zap, BarChart3, ArrowRight, 
  Upload, FileText, CheckCircle, Globe, LayoutDashboard,
  Moon, Sun
} from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const features = [
    { 
      icon: Shield, 
      label: 'ATS Optimization', 
      desc: 'See exactly how applicant tracking systems read your resume.',
      color: 'blue'
    },
    { 
      icon: Zap, 
      label: 'Skill Gap Analysis', 
      desc: 'Identify missing keywords for your target industry.',
      color: 'amber'
    },
    { 
      icon: BarChart3, 
      label: 'AI Matching', 
      desc: 'TF-IDF based ranking against real job listings.',
      color: 'emerald'
    }
  ];

  return (
    <PageWrapper className="min-h-screen bg-secondary-50 dark:bg-dark-bg transition-colors duration-300 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-dark-bg/70 backdrop-blur-lg border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Resume<span className="text-primary-600">Match</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              {darkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
            </button>
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-all"
              >
                Dashboard <LayoutDashboard size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors px-4">Login</Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all hover:scale-[1.03] active:scale-95"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-xs font-bold animate-fade-in">
            <Sparkles size={14} /> NEW: Google Gemini 2.5 Integration
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white animate-fade-in-up">
            Optimize Your Resume <br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent italic">With Precision AI</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 animate-fade-in-up stagger-1">
            Don't let applicant tracking systems ignore your talent. Our AI analyzes your resume, 
            detects skill gaps, and matches you with high-probability job opportunities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-2">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-200 transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3"
            >
              Get Started Now <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-dark-card text-gray-700 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
            >
              View Preview
            </Link>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-20 relative max-w-5xl mx-auto animate-fade-in-up stagger-3">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-400/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-400/20 blur-3xl rounded-full" />
            
            <div className="relative bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-dark-border shadow-2xl overflow-hidden group">
              <div className="h-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-dark-border flex items-center px-4 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Mockup Dashboard content */}
                <div className="md:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="h-2 w-48 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-secondary-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
                      <div className="h-3 w-16 bg-blue-100 dark:bg-blue-900/40 rounded-full" />
                      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
                    </div>
                    <div className="h-32 bg-secondary-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
                      <div className="h-3 w-16 bg-purple-100 dark:bg-purple-900/40 rounded-full" />
                      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="h-40 bg-secondary-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex justify-between mb-4">
                      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-700 rounded-full" />
                            <div className="h-2 w-1/2 bg-gray-50 dark:bg-gray-800 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Sidebar mock */}
                <div className="space-y-4 pt-4 md:pt-0">
                  <div className="h-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 space-y-6">
                    <div className="space-y-3">
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg" />)}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-2 w-24 bg-gray-100 dark:bg-gray-700 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Login/Register Overlay */}
              {!user && (
                <div className="absolute inset-0 bg-white/40 dark:bg-dark-bg/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-dark-border max-w-sm w-full space-y-6 animate-scale-in">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ready to match?</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Join thousands of job seekers today</p>
                    </div>
                    <div className="space-y-3">
                      <Link
                        to="/register"
                        className="block w-full py-3.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all"
                      >
                        Create Free Account
                      </Link>
                      <Link
                        to="/login"
                        className="block w-full py-3.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                      >
                        Login
                      </Link>
                    </div>
                    <p className="text-[10px] text-gray-400">No credit card required • Instant analysis</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-dark-surface border-y border-gray-100 dark:border-dark-border px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Why Choose ResumeMatch?</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Our advanced NLP engine goes beyond keyword stuffing to understand the context of your professional experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-8 rounded-3xl bg-secondary-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border hover-lift group">
                  <div className={`w-14 h-14 rounded-2xl bg-${f.color}-50 dark:bg-${f.color}-900/20 flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`text-${f.color}-500 w-7 h-7`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{f.label}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6 border-t border-gray-100 dark:border-dark-border pt-12">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-gray-900 dark:text-white">ResumeMatch © 2026</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-primary-600">Features</a>
            <a href="#" className="hover:text-primary-600">Privacy</a>
            <a href="#" className="hover:text-primary-600">Contact</a>
          </div>
          <div className="text-xs text-gray-400">
            v2.0 • Build with ❤️
          </div>
        </div>
      </footer>
    </PageWrapper>
  );
};

export default Home;
