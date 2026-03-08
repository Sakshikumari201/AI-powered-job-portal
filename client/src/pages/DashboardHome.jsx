import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AnimatedCounter from '../components/AnimatedCounter';
import ScoreRing from '../components/ScoreRing';
import PageWrapper from '../components/PageWrapper';
import api from '../api/axios';
import {
  FileText, Target, Briefcase, TrendingUp,
  ArrowRight, Sparkles, Shield, BarChart3,
  Clock, Zap, Upload,
} from 'lucide-react';

const DashboardHome = () => {
  const { user, loadAnalysis } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  useEffect(() => {
    // Load user-specific cached analysis
    const cached = loadAnalysis();
    if (cached) {
      setLatestAnalysis(cached);
    }
    // Fetch profile for history
    api.get('/users/profile').then(res => setProfile(res.data)).catch(() => { });
  }, [user]);

  const hasAnalysis = !!latestAnalysis?.atsScore;
  const atsScore = latestAnalysis?.atsScore?.overallScore || 0;
  const industryReadiness = latestAnalysis?.industryReadiness || 0;
  const jobMarketReadiness = latestAnalysis?.jobMarketReadiness || 0;
  const skillCount = hasAnalysis ? (latestAnalysis?.extractedSkills?.length || 0) : '--';
  const topJobScore = hasAnalysis ? (latestAnalysis?.recommendedJobs?.[0]?.matchScore || 0) : '--';
  const missingSkills = hasAnalysis ? (latestAnalysis?.skillGap?.missing || []) : [];
  const missingCount = hasAnalysis ? missingSkills.length : '--';
  const history = profile?.analysisHistory || [];

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* ── Welcome Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hasAnalysis ? 'Here\'s your latest resume analysis at a glance.' : 'Upload a resume to get started with AI-powered analysis.'}
          </p>
        </div>
        <Link
          to="/upload"
          className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-sm font-semibold rounded-xl hover:from-primary-700 hover:to-accent-700 shadow-lg shadow-primary-200 transition-transform duration-200 hover:scale-[1.03] active:scale-95"
        >
          <Upload size={16} /> New Analysis
        </Link>
      </div>

      <>
        {/* ── Row 1: Score Cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* ATS Score */}
          <Link to="/analysis" className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border hover-lift hover-glow transition-all group animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Shield size={18} className="text-blue-500" />
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">ATS Score</span>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
            </div>
            <div className="flex items-end gap-2">
              {hasAnalysis ? (
                <AnimatedCounter target={atsScore} className="text-4xl font-bold text-gray-900 dark:text-white" />
              ) : (
                <span className="text-4xl font-bold text-gray-900 dark:text-white">--</span>
              )}
              <span className="text-gray-400 text-lg font-medium mb-1">/100</span>
            </div>
            <div className="mt-3 w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 animate-bar-grow" style={{ '--bar-width': `${atsScore}%`, width: `${atsScore}%` }} />
            </div>
          </Link>

          {/* Industry Readiness */}
          <Link to="/analysis" className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border hover-lift hover-glow transition-all group animate-fade-in-up stagger-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <BarChart3 size={18} className="text-purple-500" />
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Industry Readiness</span>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
            </div>
            <div className="flex items-end gap-2">
              {hasAnalysis ? (
                <AnimatedCounter target={industryReadiness} className="text-4xl font-bold text-gray-900 dark:text-white" suffix="%" />
              ) : (
                <span className="text-4xl font-bold text-gray-900 dark:text-white">--</span>
              )}
            </div>
            <div className="mt-3 w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 animate-bar-grow" style={{ '--bar-width': `${industryReadiness}%`, width: `${industryReadiness}%` }} />
            </div>
          </Link>

          {/* Skill Coverage */}
          <Link to="/analysis" className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border hover-lift hover-glow transition-all group animate-fade-in-up stagger-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Target size={18} className="text-emerald-500" />
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Job Market Fit</span>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
            </div>
            <div className="flex items-end gap-2">
              {hasAnalysis ? (
                <AnimatedCounter target={jobMarketReadiness} className="text-4xl font-bold text-gray-900 dark:text-white" suffix="%" />
              ) : (
                <span className="text-4xl font-bold text-gray-900 dark:text-white">--</span>
              )}
            </div>
            <div className="mt-3 w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 animate-bar-grow" style={{ '--bar-width': `${jobMarketReadiness}%`, width: `${jobMarketReadiness}%` }} />
            </div>
          </Link>
        </div>

        {/* ── Row 2: Quick Stats + History ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Quick Stats */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border animate-fade-in-up stagger-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <Zap size={16} className="text-amber-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills Detected</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{skillCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Best Job Match</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{hasAnalysis ? `${Math.round(topJobScore)}%` : '--'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <Target size={16} className="text-red-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Missing Skills</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{missingCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Analyses</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{history.length || 1}</span>
              </div>
            </div>
          </div>

          {/* Analysis History Trend / Upload CTA */}
          <div className="lg:col-span-3 bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border animate-fade-in-up stagger-4 relative overflow-hidden">
            {!hasAnalysis && (
              <div className="absolute inset-0 bg-white/80 dark:bg-dark-card/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Unlock Your Dashboard</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-5">Upload your resume to see your real-time ranking, missing skills, and top job matches.</p>
                <Link
                  to="/upload"
                  className="flex flex-shrink-0 items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-sm font-semibold rounded-xl shadow-lg transition-transform duration-200 hover:scale-[1.03] active:scale-95"
                >
                  <Upload size={16} /> Analyze Now
                </Link>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis History</h2>
              <span className="text-xs font-medium text-gray-400">{history.length} analyses</span>
            </div>
            {history.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                {[...history].reverse().slice(0, 8).map((snap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl animate-fade-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-600">{snap.atsScore}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">ATS: {snap.atsScore}/100</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{snap.industry}</span>
                      </div>
                      <div className="flex gap-3 mt-0.5 text-xs text-gray-400">
                        <span>Readiness: {snap.industryReadiness}%</span>
                        <span>Skills: {snap.skillCount}</span>
                        <span>Top Match: {snap.topMatchScore}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {snap.createdAt ? new Date(snap.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Your analysis history will appear here after multiple analyses.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up stagger-5">
          <Link
            to="/upload"
            className="flex items-center gap-4 p-5 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl text-white hover:from-primary-600 hover:to-primary-800 transition-all shadow-lg shadow-primary-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Upload New Resume</h3>
              <p className="text-xs text-white/70">Get a fresh AI analysis</p>
            </div>
            <ArrowRight size={18} className="ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            to="/analysis"
            className="flex items-center gap-4 p-5 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border hover-lift group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">View ATS Breakdown</h3>
              <p className="text-xs text-gray-400">Radar chart & heatmap</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-primary-500 transition-colors" />
          </Link>

          <Link
            to="/jobs"
            className="flex items-center gap-4 p-5 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border hover-lift group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">Job Recommendations</h3>
              <p className="text-xs text-gray-400">AI-ranked opportunities</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-primary-500 transition-colors" />
          </Link>
        </div>
      </>
    </PageWrapper>
  );
};

export default DashboardHome;
