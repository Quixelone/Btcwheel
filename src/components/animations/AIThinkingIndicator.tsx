import { motion } from 'motion/react';
import { Brain, Sparkles, Zap } from 'lucide-react';

interface AIThinkingIndicatorProps {
  variant?: 'dots' | 'brain' | 'pulse' | 'sparkles';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function AIThinkingIndicator({ 
  variant = 'dots',
  size = 'md',
  message = 'Prof Satoshi sta pensando...'
}: AIThinkingIndicatorProps) {
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  // Variant 1: Three dots (classic)
  if (variant === 'dots') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`${dotSizes[size]} bg-blue-500 rounded-full`}
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        {message && (
          <span className={`${sizeClasses[size]} text-gray-500 ml-2`}>
            {message}
          </span>
        )}
      </div>
    );
  }

  // Variant 2: Brain with gears
  if (variant === 'brain') {
    return (
      <div className="flex items-center gap-3">
        <motion.div
          className="relative"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Brain 
            className={`${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} text-purple-600`}
          />
          
          {/* Rotating gears overlay */}
          <motion.div
            className="absolute inset-0"
            animate={{
              rotate: [0, -360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div className="absolute top-1 right-0 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute bottom-1 left-0 w-1.5 h-1.5 bg-orange-500 rounded-full" />
          </motion.div>
        </motion.div>
        
        {message && (
          <span className={`${sizeClasses[size]} text-gray-700`}>
            {message}
          </span>
        )}
      </div>
    );
  }

  // Variant 3: Pulsing circle
  if (variant === 'pulse') {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* Outer pulse rings */}
          <motion.div
            className={`absolute inset-0 ${
              size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'
            } rounded-full bg-blue-400`}
            animate={{
              scale: [1, 1.8],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.div
            className={`absolute inset-0 ${
              size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'
            } rounded-full bg-purple-400`}
            animate={{
              scale: [1, 1.8],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.3,
              ease: 'easeOut',
            }}
          />
          
          {/* Center circle */}
          <motion.div
            className={`relative ${
              size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'
            } rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center`}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Zap className="w-4 h-4 text-white" />
          </motion.div>
        </div>
        
        {message && (
          <span className={`${sizeClasses[size]} text-gray-700`}>
            {message}
          </span>
        )}
      </div>
    );
  }

  // Variant 4: Sparkles animation
  if (variant === 'sparkles') {
    return (
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12">
          {/* Sparkles appearing around */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: i === 0 ? '0%' : i === 1 ? '100%' : '50%',
                left: i === 2 ? '0%' : i === 3 ? '100%' : '50%',
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </motion.div>
          ))}
          
          {/* Center brain */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Brain className="w-6 h-6 text-purple-600" />
          </motion.div>
        </div>
        
        {message && (
          <span className={`${sizeClasses[size]} text-gray-700 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
            {message}
          </span>
        )}
      </div>
    );
  }

  return null;
}

// Typing bubble for chat (like iMessage)
export function ChatTypingBubble() {
  return (
    <div className="flex items-start gap-2 mb-4">
      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
        <Brain className="w-4 h-4 text-white" />
      </div>
      
      {/* Typing bubble */}
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for AI responses
export function AIResponseSkeleton() {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      {[100, 80, 90].map((width, i) => (
        <motion.div
          key={i}
          className="h-3 bg-gray-200 rounded"
          style={{ width: `${width}%` }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}