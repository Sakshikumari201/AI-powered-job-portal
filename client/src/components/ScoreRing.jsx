import React, { useEffect, useState, useRef } from 'react';

/**
 * ScoreRing — Animated circular progress ring with color grading.
 * @param {number} score — 0-100
 * @param {number} size — Ring size in px (default: 120)
 * @param {number} strokeWidth — Ring thickness (default: 8)
 * @param {string} label — Optional label below score (e.g., "ATS Score")
 * @param {string} sublabel — e.g., "High Fit", "Moderate Fit"
 */
const ScoreRing = ({ score, size = 120, strokeWidth = 8, label = '', sublabel = '' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = (s) => {
    if (s >= 75) return { stroke: '#10b981', text: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Excellent' };
    if (s >= 60) return { stroke: '#22c55e', text: 'text-green-500', bg: 'bg-green-50', label: 'Good' };
    if (s >= 45) return { stroke: '#eab308', text: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Moderate' };
    if (s >= 30) return { stroke: '#f97316', text: 'text-orange-500', bg: 'bg-orange-50', label: 'Low' };
    return { stroke: '#ef4444', text: 'text-red-500', bg: 'bg-red-50', label: 'Weak' };
  };

  const color = getScoreColor(score);
  const fitLabel = sublabel || color.label;

  useEffect(() => {
    const duration = 1200;
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    startRef.current = null;
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            className="text-gray-100 dark:text-gray-700"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Score ring with gradient */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`text-3xl font-bold ${color.text}`}>{animatedScore}</span>
          <span className="text-[10px] text-gray-400 font-medium">/100</span>
        </div>
      </div>
      {label && <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>}
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${color.bg} ${color.text}`}>
        {fitLabel}
      </span>
    </div>
  );
};

export default ScoreRing;
