import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import httpClient from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ScoreRing from '../components/ScoreRing';
import AnimatedCounter from '../components/AnimatedCounter';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';
import {
  AlertCircle, CheckCircle, TrendingUp, BookOpen,
  Zap, Shield, Award, Target, ArrowRight, Lightbulb,
} from 'lucide-react';

// Helper to style scores based on their value
const getScoreStyle = (score, max) => {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 80) return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', bar: 'bg-emerald-500', icon: '🟢', label: 'Strong' };
  if (pct >= 50) return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600', bar: 'bg-yellow-500', icon: '🟡', label: 'Needs Work' };
  return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', bar: 'bg-red-500', icon: '🔴', label: 'Weak' };
};

const sectionWeights = { skills: 35, keywords: 20, experience: 20, education: 10, structure: 10, grammar: 5 };

/* ─── Improvement suggestions map ─────────────────────────────────────────── */
const skillSuggestions = {
  docker: { tip: 'Learn Docker for DevOps readiness', icon: '🐳' },
  kubernetes: { tip: 'Master Kubernetes for cloud-native deployment', icon: '☸️' },
  aws: { tip: 'Get AWS Cloud Practitioner certified', icon: '☁️' },
  python: { tip: 'Add Python for data science versatility', icon: '🐍' },
  react: { tip: 'Build React projects for frontend mastery', icon: '⚛️' },
  typescript: { tip: 'Learn TypeScript for enterprise-level coding', icon: '📘' },
  sql: { tip: 'Strengthen SQL for database management roles', icon: '🗄️' },
  mongodb: { tip: 'Practice MongoDB for NoSQL expertise', icon: '🍃' },
  'node.js': { tip: 'Deepen Node.js for full-stack competence', icon: '🟢' },
  git: { tip: 'Master Git workflows (branching, rebasing)', icon: '📦' },
  linux: { tip: 'Learn Linux administration fundamentals', icon: '🐧' },
  azure: { tip: 'Explore Azure for multi-cloud readiness', icon: '🔷' },
  gcp: { tip: 'Study GCP for Google Cloud expertise', icon: '🌐' },
  java: { tip: 'Strengthen Java for enterprise backend roles', icon: '☕' },
  'c++': { tip: 'Learn C++ for systems programming', icon: '⚡' },
};

const ATSAnalysis = () => {
  const { loadAnalysis } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Fetch analysis data from cache or API
    const loadReportData = async () => {
      try {
        const cached = loadAnalysis();
        if (cached?.atsScore) {
          setData({
            atsScore: {
              overall: cached.atsScore.overallScore,
              breakdown: cached.atsScore.breakdown,
            },
            suggestions: cached.atsScore.suggestions || [],
            skills: cached.extractedSkills || [],
            industryReadiness: cached.industryReadiness || 0,
            jobMarketReadiness: cached.jobMarketReadiness || 0,
            industrySkillGap: cached.industrySkillGap || null,
            skillGap: cached.skillGap || null,
            performance: cached.performance || null,
          });
          // Small delay before revealing to trigger animations
          setTimeout(() => setRevealed(true), 150);
          return;
        }
        
        const res = await httpClient.get('/resumes/analysis');
        setData(res.data);
        setTimeout(() => setRevealed(true), 150);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analysis');
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, []);

  /* ─── Radar data ──────────────────────────────────────────────────────── */
  const radarData = useMemo(() => {
    if (!data?.atsScore?.breakdown) return [];
    return Object.entries(data.atsScore.breakdown).map(([key, value]) => ({
      subject: key.charAt(0).toUpperCase() + key.slice(1),
      score: Math.round((value / sectionWeights[key]) * 100),
      fullMark: 100,
    }));
  }, [data]);

  /* ─── Missing skill suggestions ───────────────────────────────────────── */
  const missingSkills = useMemo(() => {
    const gap = data?.skillGap?.missing || data?.industrySkillGap?.missing || [];
    return gap.map(skill => ({
      skill,
      ...(skillSuggestions[skill.toLowerCase()] || { tip: `Add ${skill} to boost your profile`, icon: '📚' }),
    }));
  }, [data]);

  /* ─── Loading state ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4" style={{ minHeight: '60vh' }}>
        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center animate-pulse-soft">
          <Shield className="w-8 h-8 text-primary-500" />
        </div>
        <p className="text-gray-400 text-sm font-medium">Loading your analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center" style={{ minHeight: '60vh' }}>
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-500 font-medium">{error}</p>
        <p className="text-sm text-gray-400">Upload a resume first to see your analysis.</p>
      </div>
    );
  }

  if (!data) return null;

  const { atsScore, suggestions, skills, industryReadiness, jobMarketReadiness, industrySkillGap } = data;

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ATS Score & Analysis</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Detailed breakdown of how your resume performs against industry standards.
        </p>
      </div>

      {/* ── Row 1: Score Ring + Industry Readiness + Skill Coverage ─────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ATS Score Ring */}
        <div className={`bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border flex flex-col items-center justify-center hover-lift ${revealed ? 'animate-scale-in' : 'opacity-0'}`}>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Overall ATS Score</h2>
          <ScoreRing score={atsScore.overall} size={140} strokeWidth={10} />
        </div>

        {/* Industry Readiness */}
        <div className={`bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border flex flex-col items-center justify-center hover-lift ${revealed ? 'animate-scale-in stagger-2' : 'opacity-0'}`}>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Industry Readiness</h2>
          <ScoreRing
            score={industryReadiness}
            size={140}
            strokeWidth={10}
            sublabel={industrySkillGap?.industry || 'General'}
          />
        </div>

        {/* Job Market Readiness */}
        <div className={`bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border flex flex-col items-center justify-center hover-lift ${revealed ? 'animate-scale-in stagger-4' : 'opacity-0'}`}>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Job Market Fit</h2>
          <ScoreRing
            score={jobMarketReadiness}
            size={140}
            strokeWidth={10}
            sublabel="Market Readiness"
          />
        </div>
      </div>

      {/* ── Row 2: Radar Chart + Heatmap Breakdown ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🔥 Radar Chart */}
        <div className={`bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border hover-lift ${revealed ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Resume Strength Radar</h2>
          <p className="text-xs text-gray-400 mb-4">Multi-dimensional analysis of your resume quality</p>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Your Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🔥 Resume Strength Heatmap */}
        <div className={`bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border hover-lift ${revealed ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Score Breakdown</h2>
          <p className="text-xs text-gray-400 mb-5">Section-by-section resume strength</p>
          <div className="space-y-4">
            {Object.entries(atsScore.breakdown).map(([key, value], idx) => {
              const max = sectionWeights[key];
              const pct = Math.round((value / max) * 100);
              const color = getScoreStyle(value, max);
              return (
                <div key={key} className={`animate-fade-in-up`} style={{ animationDelay: `${idx * 0.08}s` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{color.icon}</span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">{key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>{color.label}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{value}<span className="text-gray-400 text-xs font-normal">/{max}</span></span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color.bar} animate-bar-grow`}
                      style={{ '--bar-width': `${pct}%`, width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Skill Coverage + Suggestions ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🔥 Skill Gap Visualization */}
        <div className={`bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border hover-lift ${revealed ? 'animate-fade-in-up stagger-5' : 'opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Extracted Skills</h2>
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
              {skills.length} found
            </span>
          </div>

          {/* Skill Coverage Bar */}
          {industrySkillGap && (
            <div className="mb-5 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-gray-600 dark:text-gray-400">Skill Coverage</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  <AnimatedCounter target={industrySkillGap.coverage || 0} suffix="%" />
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 animate-bar-grow"
                  style={{ '--bar-width': `${industrySkillGap.coverage || 0}%`, width: `${industrySkillGap.coverage || 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Matched + Missing badges */}
          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill, idx) => {
              const isMatched = industrySkillGap?.matched?.includes(skill.toLowerCase());
              // Randomly assign a pastel color for unmatched skills to create a "skill cloud" feel
              const cloudColors = [
                'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
                'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
                'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
                'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
                'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800'
              ];
              const randomColor = cloudColors[idx % cloudColors.length];

              return (
                <motion.span
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-default border ${isMatched
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700'
                    : randomColor
                    }`}
                >
                  {isMatched && <CheckCircle size={13} />}
                  {skill}
                </motion.span>
              );
            })}
          </div>

          {/* Missing skills */}
          {industrySkillGap?.missing?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Missing for {industrySkillGap.industry}</p>
              <div className="flex flex-wrap gap-2">
                {industrySkillGap.missing.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  >
                    <AlertCircle size={12} />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🔥 Improvement Suggestions + Skill Coaching */}
        <div className={`bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border hover-lift ${revealed ? 'animate-fade-in-up stagger-6' : 'opacity-0'}`}>
          {/* ATS Suggestions */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-500" />
            Improvement Suggestions
          </h2>
          <ul className="space-y-3 mb-6">
            {suggestions.length > 0 ? suggestions.map((sug, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <span>{sug}</span>
              </li>
            )) : (
              <li className="text-green-600 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Looks good! No critical issues found.
              </li>
            )}
          </ul>

          {/* 🔥 Career Coach — Skill Focus Areas */}
          {missingSkills.length > 0 && (
            <div className="pt-5 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Target size={16} className="text-primary-500" />
                Suggested Focus Areas
              </h3>
              <div className="space-y-2.5">
                {missingSkills.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors group cursor-default"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-700 transition-colors">
                        Learn {item.skill}
                      </p>
                      <p className="text-xs text-gray-400">{item.tip}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Performance Badge ──────────────────────────────────────────── */}
      {data.performance && (
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400 animate-fade-in">
          <span className="flex items-center gap-1.5"><Zap size={12} className="text-primary-400" /> Analyzed in {data.performance.totalMs}ms</span>
          <span>•</span>
          <span>Parse: {data.performance.parseMs}ms</span>
          <span>•</span>
          <span>Match: {data.performance.matchMs}ms</span>
        </div>
      )}
    </PageWrapper>
  );
};

export default ATSAnalysis;
