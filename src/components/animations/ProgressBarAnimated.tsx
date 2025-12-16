import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface ProgressBarAnimatedProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  milestones?: number[]; // e.g., [25, 50, 75, 100]
  onMilestone?: (milestone: number) => void;
}

export function ProgressBarAnimated({
  value,
  max = 100,
  showLabel = true,
  color = 'gradient',
  size = 'md',
  animated = true,
  milestones = [25, 50, 75, 100],
  onMilestone,
}: ProgressBarAnimatedProps) {
  const [lastMilestone, setLastMilestone] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  // Check for milestone reached
  useEffect(() => {
    const currentMilestone = milestones.find(
      m => percentage >= m && m > lastMilestone
    );
    if (currentMilestone) {
      setLastMilestone(currentMilestone);
      onMilestone?.(currentMilestone);
    }
  }, [percentage, milestones, lastMilestone, onMilestone]);

  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500',
  };

  // Dynamic color based on percentage
  const getColorByPercentage = () => {
    if (color !== 'gradient') return colorClasses[color];
    if (percentage < 33) return 'bg-red-500';
    if (percentage < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <motion.span
            key={value}
            className="text-gray-900"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className={`relative w-full ${heightClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        {/* Background Shimmer */}
        {animated && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Progress Fill */}
        <motion.div
          className={`h-full ${colorClasses[color]} relative`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 1 : 0,
            ease: 'easeOut',
          }}
        >
          {/* Glow Effect */}
          {animated && (
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>

        {/* Milestone Markers */}
        {milestones.map((milestone) => (
          <motion.div
            key={milestone}
            className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
            style={{ left: `${milestone}%` }}
            animate={percentage >= milestone ? {
              backgroundColor: ['#9ca3af', '#ffffff', '#9ca3af'],
            } : {}}
            transition={{
              duration: 0.5,
            }}
          />
        ))}
      </div>

      {/* Milestone Pulse Animation */}
      {milestones.map((milestone) => (
        percentage >= milestone && percentage < milestone + 1 && (
          <motion.div
            key={`pulse-${milestone}`}
            className="absolute inset-0 border-2 border-white rounded-full"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )
      ))}
    </div>
  );
}

// XP Progress Bar - specific for XP tracking
interface XPProgressBarProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
}

export function XPProgressBar({ currentXP, nextLevelXP, level }: XPProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Level {level}</span>
        <span className="text-sm text-gray-900">
          {currentXP} / {nextLevelXP} XP
        </span>
      </div>
      <ProgressBarAnimated
        value={currentXP}
        max={nextLevelXP}
        showLabel={false}
        color="gradient"
        size="md"
        milestones={[25, 50, 75, 100]}
      />
    </div>
  );
}
