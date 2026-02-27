import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ScoreRing from '../components/ScoreRing';
import {
  Briefcase, Building2, Target, CheckCircle, XCircle,
  ExternalLink, TrendingUp, MapPin,
} from 'lucide-react';

const getFitLabel = (score) => {
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

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const cached = loadAnalysis();
        if (Array.isArray(cached?.recommendedJobs)) {
          setJobs(cached.recommendedJobs);
          return;
        }
        const res = await api.get('/jobs/recommendations');
        setJobs(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch job recommendations.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
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
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
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
              className="bg-white dark:bg-dark-card rounded-2xl p-0 shadow-sm border border-gray-100 dark:border-dark-border hover-lift hover-glow transition-all duration-300 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Rank badge */}
              <div className="flex items-stretch">
                {/* Left — Job Info */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    {/* Rank number */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-400'
                      }`}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{job.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><Building2 size={14} />{job.company}</span>
                        {job.location && <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>}
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
                    sublabel={getFitLabel(matchScore)}
                  />
                  <a
                    href={job.redirect_url || job.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.97]"
                  >
                    Apply Now <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobMatches;
