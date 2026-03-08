import React from 'react';
import CountUp from 'react-countup';

/**
 * AnimatedCounter: Smoothly counts from 0 to a target value using react-countup.
 * @param {number} target — The final number to display
 * @param {number} duration — Animation duration in ms (default: 1200)
 * @param {string} suffix — Optional suffix like "%" or "/100"
 */
const AnimatedCounter = ({ target, duration = 1200, suffix = '', className = '' }) => {
  return (
    <span className={className}>
      <CountUp end={target} duration={duration / 1000} suffix={suffix} useEasing={true} />
    </span>
  );
};

export default AnimatedCounter;
