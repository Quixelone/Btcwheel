import { motion, type Variants } from 'motion/react';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  type?: 'text' | 'card' | 'avatar' | 'chart';
}

export function LoadingSkeleton({
  className = '',
  count = 1,
  type = 'text'
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count });

  const shimmerVariants: Variants = {
    shimmer: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };


  const pulseVariants: Variants = {
    pulse: {
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <motion.div
            className={`rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 p-6 ${className}`}
            style={{
              backgroundSize: '200% 100%',
            }}
            variants={shimmerVariants}
            animate="shimmer"
          >
            <div className="space-y-4">
              <div className="h-6 bg-gray-400/30 rounded w-3/4" />
              <div className="h-4 bg-gray-400/30 rounded w-full" />
              <div className="h-4 bg-gray-400/30 rounded w-5/6" />
            </div>
          </motion.div>
        );

      case 'avatar':
        return (
          <motion.div
            className={`rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 w-12 h-12 ${className}`}
            style={{
              backgroundSize: '200% 100%',
            }}
            variants={shimmerVariants}
            animate="shimmer"
          />
        );

      case 'chart':
        return (
          <motion.div
            className={`rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-64 ${className}`}
            style={{
              backgroundSize: '200% 100%',
            }}
            variants={shimmerVariants}
            animate="shimmer"
          />
        );

      case 'text':
      default:
        return (
          <motion.div
            className={`h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded ${className}`}
            style={{
              backgroundSize: '200% 100%',
            }}
            variants={shimmerVariants}
            animate="shimmer"
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      {skeletons.map((_, index) => (
        <motion.div
          key={index}
          variants={pulseVariants}
          animate="pulse"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </div>
  );
}

// Skeleton Transition - smooth transition to real content
interface SkeletonTransitionProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}

export function SkeletonTransition({
  loading,
  skeleton,
  children
}: SkeletonTransitionProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: loading ? 0.6 : 1 }}
      transition={{ duration: 0.3 }}
    >
      {loading ? skeleton : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
