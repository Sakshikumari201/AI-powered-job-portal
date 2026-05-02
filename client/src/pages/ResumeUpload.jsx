import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, FileText, CheckCircle, X, Sparkles,
  MapPin, Search, ChevronDown, AlertCircle, Loader2,
  Shield, Zap, BarChart3, Briefcase, Brain, Target,
  Cpu, Database, ArrowRight, Lock, Clock, Star,
} from 'lucide-react';
import httpClient from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import PageWrapper from '../components/PageWrapper';

// Steps for the analysis process - using specific icons and colors for each phase
const analysisSteps = [
  { icon: FileText, label: 'Parsing Resume', desc: 'Extracting text and structure from your document...', color: 'from-blue-500 to-blue-600' },
  { icon: Brain, label: 'NLP Analysis', desc: 'Identifying skills, experience & education using AI...', color: 'from-purple-500 to-purple-600' },
  { icon: Shield, label: 'ATS Scoring', desc: 'Scoring against 6 industry benchmark categories...', color: 'from-emerald-500 to-emerald-600' },
  { icon: Database, label: 'Fetching Jobs', desc: 'Searching real-time job listings from Adzuna API...', color: 'from-orange-500 to-orange-600' },
  { icon: Cpu, label: 'TF-IDF Matching', desc: 'Running corpus-level cosine similarity engine...', color: 'from-pink-500 to-pink-600' },
  { icon: Target, label: 'Ranking Results', desc: 'Ordering by hybrid match confidence score...', color: 'from-cyan-500 to-cyan-600' },
];

// Just some random role suggestions for the placeholder effect
const ROLE_EXAMPLES = [
  'Software Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Full Stack Developer',
  'Machine Learning Engineer',
  'Cloud Architect',
  'Product Manager',
];

const ResumeUpload = () => {
  const navigate = useNavigate();
  const { saveAnalysis } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('us');
  const [industry, setIndustry] = useState('software_development');
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [shakeError, setShakeError] = useState(false);

  // Loop through placeholder roles every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % ROLE_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fake progress animation for better UX - makes it feel like AI is "thinking"
  useEffect(() => {
    if (!loading) return;
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev >= analysisSteps.length - 1) { clearInterval(stageInterval); return prev; }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(stageInterval);
  }, [loading]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const ext = e.dataTransfer.files[0].name.split('.').pop().toLowerCase();
      if (['pdf', 'doc', 'docx'].includes(ext)) {
        setFile(e.dataTransfer.files[0]);
        setError('');
        setSuccess(false);
      } else {
        setShakeError(true);
        setError('Only PDF, DOC, and DOCX files are supported.');
        setTimeout(() => setShakeError(false), 600);
      }
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) { setFile(e.target.files[0]); setError(''); setSuccess(false); }
  };

  const removeFile = () => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄';
    return '📝';
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a file first.'); return; }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('keyword', keyword);
    formData.append('location', location);
    formData.append('industry', industry);

    setLoading(true);
    setError('');
    setProgress(0);
    setCurrentStage(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 92) { clearInterval(progressInterval); return 92; }
        return prev + Math.random() * 10;
      });
    }, 600);

    try {
      const res = await httpClient.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStage(analysisSteps.length - 1);
      saveAnalysis(res.data);
      setSuccess(true);
      // Wait a bit before navigating to show the success state
      setTimeout(() => navigate('/analysis'), 1800);
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      setCurrentStage(0);
      setError(err.response?.data?.message || err.response?.data?.errors?.map(e => e.message).join(', ') || 'Error uploading file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    { value: 'software_development', label: 'Software Development', icon: '💻' },
    { value: 'data_science', label: 'Data Science', icon: '📊' },
    { value: 'devops', label: 'DevOps', icon: '⚙️' },
  ];

  // Render different UI based on state (Loading/Success/Form)
  if (success) {
    return (
      <PageWrapper className="p-12 flex flex-col items-center justify-center space-y-6 text-center animate-fade-in-up" style={{ minHeight: '70vh' }}>
        <div className="max-w-md w-full p-8 bg-white dark:bg-dark-card rounded-[2rem] shadow-2xl space-y-8 border border-gray-100 dark:border-dark-border">
          {/* Success badge */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl animate-pulse-soft opacity-30 scale-125" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl shadow-green-300">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Analysis Complete! 🎉</h2>
            <p className="text-gray-500 dark:text-gray-400">Your AI-powered resume report is ready</p>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-400" /> ATS Scored</span>
            <span className="flex items-center gap-1"><Target size={12} className="text-blue-400" /> Skills Mapped</span>
            <span className="flex items-center gap-1"><Briefcase size={12} className="text-purple-400" /> Jobs Ranked</span>
          </div>
          <div className="w-56 mx-auto h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-progress" />
          </div>
          <p className="text-xs text-gray-400">Redirecting to your results...</p>
        </div>
      </PageWrapper>
    );
  }

  // Main view for file selection and settings
  return (
    <PageWrapper className="max-w-4xl mx-auto space-y-7 pb-8">
      {/* ─── Hero Header ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 p-8 text-white shadow-xl animate-fade-in">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-6 right-8 w-3 h-3 bg-white/20 rounded-full" />
        <div className="absolute top-14 right-20 w-2 h-2 bg-white/15 rounded-full" />

        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight">Upload & Analyze Resume</h1>
            <p className="mt-2 text-sm text-white/70 max-w-lg leading-relaxed">
              Get an instant AI-powered analysis with ATS scoring, TF-IDF skill gap detection,
              industry readiness mapping, and personalized job recommendations.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <Clock size={12} /> ~15 seconds
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <Lock size={12} /> Secure & private
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <Star size={12} /> AI-powered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Feature Chips Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Shield, label: 'ATS Score', desc: 'Scored out of 100', gradient: 'from-blue-500 to-blue-600' },
          { icon: Zap, label: 'Skill Gap', desc: 'Missing skills found', gradient: 'from-amber-500 to-orange-500' },
          { icon: BarChart3, label: 'Industry Fit', desc: 'Readiness analysis', gradient: 'from-purple-500 to-purple-600' },
          { icon: Briefcase, label: 'Job Match', desc: 'AI-ranked roles', gradient: 'from-emerald-500 to-emerald-600' },
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.label}
              className="flex items-center gap-3 bg-white dark:bg-dark-card rounded-xl px-4 py-3.5 border border-gray-100 dark:border-dark-border shadow-sm hover-lift group animate-fade-in-up cursor-default"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{f.label}</div>
                <div className="text-xs text-gray-400">{f.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Main Upload Card ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Drop Zone */}
        <div
          className={`relative transition-all duration-300 ${shakeError ? 'animate-shake' : ''}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          style={{ animation: shakeError ? 'shake 0.5s ease-in-out' : undefined }}
        >
          <input ref={fileInputRef} type="file" id="resume-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />

          {!file ? (
            /* ── Empty drop zone ─────────────────────────────────── */
            <label
              htmlFor="resume-upload"
              className={`cursor-pointer block p-10 m-4 rounded-2xl transition-all duration-300 border-2 border-dashed ${dragActive
                ? 'bg-blue-50 dark:bg-primary-900/20 border-blue-500 scale-105 shadow-xl'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            >
              <div className="flex flex-col items-center space-y-5">
                {/* Upload icon with animated ring */}
                <div className="relative">
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${dragActive ? 'bg-primary-500/10 scale-150' : 'bg-transparent scale-100'
                    }`} />
                  <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragActive
                    ? 'bg-gradient-to-br from-primary-500 to-accent-600 scale-110 shadow-xl shadow-primary-300 rotate-3'
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-500'
                    }`}>
                    <UploadCloud className={`w-9 h-9 transition-all duration-300 ${dragActive ? 'text-white scale-110' : 'text-gray-400 dark:text-gray-500'
                      }`} />
                  </div>
                </div>

                <div className="text-center space-y-1.5">
                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    <span className="text-primary-600 dark:text-primary-400 hover:text-primary-700 underline underline-offset-4 decoration-primary-200">Browse files</span>
                    <span className="text-gray-400"> or drag & drop</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Supports <span className="font-medium text-gray-500 dark:text-gray-400">PDF</span>, <span className="font-medium text-gray-500 dark:text-gray-400">DOC</span>, <span className="font-medium text-gray-500 dark:text-gray-400">DOCX</span> • Max 5MB
                  </p>
                </div>

                {/* File type badges */}
                <div className="flex gap-2">
                  {['PDF', 'DOC', 'DOCX'].map(type => (
                    <span key={type} className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                      .{type.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            </label>
          ) : (
            /* ── File selected preview ───────────────────────────── */
            <div className="p-6 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10">
              <div className="flex items-center gap-4">
                {/* File icon with glow */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500/10 rounded-2xl scale-125 blur-sm" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
                    <span className="text-2xl">{getFileIcon(file.name)}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase">{file.name.split('.').pop()}</span>
                    <span className="text-gray-300">•</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle size={12} /> Ready for analysis
                    </span>
                  </div>
                </div>

                <button
                  onClick={removeFile}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-all duration-200 group shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  <X className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Settings Section — Premium Config Cards ────────────── */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-primary-500 to-accent-500" />
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Analysis Configuration</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Customize your AI analysis parameters</p>
              </div>
            </div>
          </div>

          {/* ── Config Card 1: Target Role ──────────────────────────── */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-800/80 dark:to-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm shadow-primary-200">
                <Search size={18} className="text-white" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200">Target Role</label>
                <p className="text-[11px] text-gray-400">What position are you applying for?</p>
              </div>
            </div>
            <div className="relative">
              <input
                value={keyword} onChange={(e) => setKeyword(e.target.value)}
                placeholder={`e.g. ${ROLE_EXAMPLES[placeholderIdx]}`}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-200 shadow-sm"
              />
            </div>
            {/* Quick-pick chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[10px] text-gray-400 mr-1 self-center">Popular:</span>
              {['React Developer', 'Data Scientist', 'DevOps Engineer', 'Full Stack', 'ML Engineer'].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setKeyword(role)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 ${keyword === role
                    ? 'bg-primary-500 text-white shadow-sm shadow-primary-200'
                    : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* ── Config Row: Location + Industry ─────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Config Card 2: Location */}
            <div className="bg-gradient-to-br from-gray-50 to-rose-50/50 dark:from-gray-800/80 dark:to-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-rose-200 dark:hover:border-rose-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm shadow-rose-200">
                  <MapPin size={18} className="text-white" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-800 dark:text-gray-200">Location</label>
                  <p className="text-[11px] text-gray-400">Where do you want to work?</p>
                </div>
              </div>
              <input
                value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. us, gb, in"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-200 shadow-sm"
              />
              {/* Region quick-picks */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  { code: 'us', flag: '🇺🇸', label: 'USA' },
                  { code: 'gb', flag: '🇬🇧', label: 'UK' },
                  { code: 'in', flag: '🇮🇳', label: 'India' },
                  { code: 'de', flag: '🇩🇪', label: 'Germany' },
                  { code: 'ca', flag: '🇨🇦', label: 'Canada' },
                  { code: 'au', flag: '🇦🇺', label: 'Australia' },
                ].map(loc => (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => setLocation(loc.code)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 ${location === loc.code
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                      : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400'
                      }`}
                  >
                    <span>{loc.flag}</span> {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Config Card 3: Industry — Visual Selector Cards */}
            <div className="bg-gradient-to-br from-gray-50 to-amber-50/50 dark:from-gray-800/80 dark:to-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm shadow-amber-200">
                  <Briefcase size={18} className="text-white" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-800 dark:text-gray-200">Industry</label>
                  <p className="text-[11px] text-gray-400">Select your target industry</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'software_development', label: 'Software Development', icon: '💻', desc: 'Web, Mobile & Systems', activeClass: 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-sm' },
                  { value: 'data_science', label: 'Data Science', icon: '📊', desc: 'ML, Analytics & AI', activeClass: 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 shadow-sm' },
                  { value: 'devops', label: 'DevOps & Cloud', icon: '⚙️', desc: 'CI/CD, AWS & K8s', activeClass: 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700 shadow-sm' },
                ].map(ind => (
                  <button
                    key={ind.value}
                    type="button"
                    onClick={() => setIndustry(ind.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${industry === ind.value
                      ? ind.activeClass
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                      }`}
                  >
                    <span className="text-2xl">{ind.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${industry === ind.value ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {ind.label}
                      </p>
                      <p className="text-[11px] text-gray-400">{ind.desc}</p>
                    </div>
                    {industry === ind.value && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/15 text-red-700 dark:text-red-400 rounded-xl px-4 py-3.5 text-sm border border-red-200 dark:border-red-800 animate-fade-in">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* 🔥 Staged Loading Experience ─────────────────────────── */}
          {loading && (
            <div className="space-y-5 animate-fade-in">
              {/* Main progress */}
              <div className="p-5 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-soft" />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">AI Analysis in Progress</span>
                  </div>
                  <span className="text-sm font-extrabold text-primary-600 dark:text-primary-400 tabular-nums">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-400 transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 animate-shimmer rounded-full" />
                  </div>
                </div>
              </div>

              {/* Mapping through analysis steps */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {analysisSteps.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isActive = idx === currentStage;
                  const isDone = idx < currentStage;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-500 ${isActive
                        ? 'bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-400 border-2 border-primary-300 dark:border-primary-700 shadow-md shadow-primary-100'
                        : isDone
                          ? 'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 border border-gray-100 dark:border-gray-700'
                        }`}
                    >
                      {isDone ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      ) : isActive ? (
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          <Loader2 size={14} className="animate-spin text-primary-500" />
                        </div>
                      ) : (
                        <Icon size={14} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{stage.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Current action text */}
              <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 px-1">
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="font-medium">{analysisSteps[currentStage]?.desc}</span>
              </div>
            </div>
          )}

          {/* ─── Submit Button ──────────────────────────────────── */}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-transform duration-200 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden ${!file || loading
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed scale-100'
              : 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white hover:shadow-2xl hover:shadow-primary-300/40 group'
              }`}
          >
            {/* Button shine effect */}
            {file && !loading && (
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Analyzing your resume...</>
            ) : (
              <>
                <Sparkles size={18} />
                Upload & Analyze
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Trust Footer ──────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Lock size={11} /> Encrypted upload
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Shield size={11} /> GDPR compliant
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <CheckCircle size={11} /> No data stored
          </span>
        </div>
        <p className="text-xs text-gray-300 dark:text-gray-600">
          Your resume is processed securely and never shared with third parties.
        </p>
      </div>
    </PageWrapper>
  );
};

export default ResumeUpload;
