import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expireAt: number;
  onExpire: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expireAt,
  onExpire,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, expireAt - now);
      
      if (remaining === 0) {
        onExpire();
      }
      
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expireAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  
  const progress = timeLeft / (10 * 60 * 1000); // 10 minutes total
  const circumference = 2 * Math.PI * 18; // radius of 18
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Circular Progress */}
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-f1-dark"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ${
              progress > 0.5 ? 'text-success' : progress > 0.2 ? 'text-warning' : 'text-error'
            }`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock size={12} className="text-f1-gray" />
        </div>
      </div>

      {/* Time Display */}
      <div className="text-sm">
        <div className="font-mono font-semibold text-white">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-xs text-f1-gray">remaining</div>
      </div>
    </div>
  );
};