import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedCounter: Smoothly counts from 0 to a target value.
 * @param {number} target — The final number to display
 * @param {number} duration — Animation duration in ms (default: 1200)
 * @param {string} suffix — Optional suffix like "%" or "/100"
 */
const AnimatedCounter = ({ target, duration = 1200, suffix = '', className = '' }) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return <span className={className}>{count}{suffix}</span>;
};

export default AnimatedCounter;
