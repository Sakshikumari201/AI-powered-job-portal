import React, { useState, useEffect, useContext } from 'react';
import httpClient from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ScoreRing from '../components/ScoreRing';
import PageWrapper from '../components/PageWrapper';
import {
  Briefcase, Building2, Target, CheckCircle, XCircle,
  ExternalLink, TrendingUp, MapPin, FileText, Sparkles, X, Mic
} from 'lucide-react';
import MockInterviewModal from '../components/MockInterviewModal';

// Helper to determine the fit level based on the match percentage
const determineFitLevel = (score) => {
  if (score >= 75) return 'High Fit';
  if (score >= 50) return 'Moderate Fit';
  if (score >= 30) return 'Low Fit';
  return 'Weak Fit';
};

const JobMatches = () => {
  const { loadAnalysis } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingLetterFor, setGeneratingLetterFor] = useState(null);
  const [coverLetterContent, setCoverLetterContent] = useState('');
  const [showLetterModal, setShowLetterModal] = useState(false);

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewJob, setInterviewJob] = useState(null);

  const handleStartInterview = (job) => {
    setInterviewJob(job);
    setShowInterviewModal(true);
  };

  const handleGenerateLetter = async (job) => {
    try {
      setGeneratingLetterFor(job._id || job.id || job.title);
      setShowLetterModal(true);
      setCoverLetterContent('Generating your tailored cover letter with Google Gemini AI...');
      const cached = loadAnalysis() || {};
      const payload = {
        resumeData: cached.skills || cached.extractedData || cached,
        jobData: job
      };
      const res = await httpClient.post('/cover-letter/generate', payload);
      setCoverLetterContent(res.data.data);
    } catch (err) {
      setCoverLetterContent('Failed to generate cover letter. ' + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingLetterFor(null);
    }
  };

  useEffect(() => {
    // Inner function to load recommendations
    const getRecommendations = async () => {
      try {
        const cached = loadAnalysis();
        // If we already have jobs from the upload step, use them first
        if (Array.isArray(cached?.recommendedJobs)) {
          setJobs(cached.recommendedJobs);
          return;
        }
        
        // Otherwise fetch fresh ones from the backend
        const res = await httpClient.get('/jobs/recommendations');
        setJobs(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch job recommendations.');
      } finally {
        setLoading(false);
      }
    };
    
    getRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4" style={{ minHeight: '60vh' }}>
        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center animate-pulse-soft">
          <Briefcase className="w-8 h-8 text-primary-500" />
        </div>
        <p className="text-gray-400 text-sm font-medium">Finding your perfect matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center" style={{ minHeight: '60vh' }}>
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center" style={{ minHeight: '60vh' }}>
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Target className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No jobs found matching your profile.</p>
        <p className="text-sm text-gray-400">Upload a resume to get personalized recommendations.</p>
      </div>
    );
  }

  return (
    <PageWrapper className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-200">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended Jobs</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ranked by hybrid AI scoring — {jobs.length} matches found
            </p>
          </div>
        </div>
      </div>

      {/* Job cards */}
      <div className="space-y-5">
        {jobs.map((item, idx) => {
          const isLegacy = !!item?.job;
          const job = isLegacy ? item.job : item;
          const matchScore = isLegacy ? item.matchScore : item.matchScore;
          const gapAnalysis = isLegacy
            ? item.gapAnalysis
            : { missingSkills: item.missingSkills || [], matchedSkills: [], matchPercentage: item.coverage || 0 };

          return (
            <div
              key={job._id || idx}
              className="bg-white dark:bg-dark-card rounded-2xl p-0 shadow-sm hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500 border border-gray-100 dark:border-dark-border hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Rank badge */}
              <div className="flex items-stretch">
                {/* Left — Job Info */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Rank number / Company Logo */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800 shadow-sm">
                        <Building2 className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        idx === 1 ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                          idx === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                            'bg-gray-50 text-gray-400 border border-gray-200'
                        }`}>
                        #{idx + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1 cursor-pointer hover:text-primary-600 transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                        <span className="flex items-center gap-1.5 font-medium"><Building2 size={16} className="text-gray-400" /> {job.company}</span>
                        {job.location && <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" />{job.location}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Skill gap badges */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Skill Analysis</h4>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(gapAnalysis.matchPercentage || 0) >= 60
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                        }`}>
                        {gapAnalysis.matchPercentage || 0}% Coverage
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(gapAnalysis.matchedSkills || []).map(skill => (
                        <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 transition-transform hover:scale-105">
                          <CheckCircle size={11} /> {skill}
                        </span>
                      ))}
                      {(gapAnalysis.missingSkills || []).map(skill => (
                        <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 transition-transform hover:scale-105">
                          <XCircle size={11} /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right — Match Score Ring */}
                <div className="w-52 flex flex-col items-center justify-center border-l border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-gray-800/30 p-5">
                  <ScoreRing
                    score={Math.round(matchScore)}
                    size={100}
                    strokeWidth={7}
                    sublabel={determineFitLevel(matchScore)}
                  />
                  <a
                    href={job.redirect_url || job.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-xl transition-transform duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.03] active:scale-95"
                  >
                    Apply Now <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => handleGenerateLetter(job)}
                    disabled={generatingLetterFor === (job._id || job.id || job.title)}
                    className="mt-2 w-full py-2.5 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 text-sm font-semibold rounded-xl transition-transform hover:scale-[1.03] active:scale-95 duration-200 flex items-center justify-center gap-2"
                  >
                    {generatingLetterFor === (job._id || job.id || job.title) ? (
                      <span className="animate-pulse">Generating...</span>
                    ) : (
                      <>Cover Letter <Sparkles size={14} /></>
                    )}
                  </button>
                  <button
                    onClick={() => handleStartInterview(job)}
                    className="mt-2 w-full py-2.5 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-sm font-semibold rounded-xl transition-transform hover:scale-[1.03] active:scale-95 duration-200 flex items-center justify-center gap-2"
                  >
                    Practice Interview <Mic size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cover Letter Modal */}
      {showLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <FileText className="text-primary-500" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">AI Generated Cover Letter</h3>
              </div>
              <button onClick={() => setShowLetterModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {coverLetterContent}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowLetterModal(false)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 rounded-xl font-medium transition-transform hover:scale-[1.03] active:scale-95 duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(coverLetterContent);
                  alert('Copied to clipboard!');
                }}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-transform duration-200 hover:scale-[1.03] active:scale-95 flex items-center gap-2"
              >
                Copy Details
              </button>
            </div>
          </div>
        </div>
      )}

      <MockInterviewModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        jobTitle={interviewJob?.title || 'Unknown Role'}
        resumeSkills={loadAnalysis()?.skills || 'General Software Engineering'}
      />
    </PageWrapper>
  );
};

export default JobMatches;
