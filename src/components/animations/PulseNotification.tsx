import { motion } from 'motion/react';
import { Bell } from 'lucide-react';

interface PulseNotificationProps {
  show: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'orange' | 'red' | 'green';
  icon?: React.ReactNode;
  count?: number;
}

export function PulseNotification({
  show,
  onClick,
  size = 'md',
  color = 'orange',
  icon,
  count,
}: PulseNotificationProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    orange: 'bg-orange-500 text-white',
    red: 'bg-red-500 text-white',
    green: 'bg-green-500 text-white',
  };

  const ringColors = {
    blue: 'border-blue-500',
    orange: 'border-orange-500',
    red: 'border-red-500',
    green: 'border-green-500',
  };

  if (!show) return null;

  return (
    <motion.div
      className="relative inline-block cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Main Icon */}
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full flex items-center justify-center shadow-lg relative z-10`}
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {icon || <Bell className="w-1/2 h-1/2" />}
      </motion.div>

      {/* Pulse Rings */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`absolute inset-0 rounded-full border-2 ${ringColors[color]}`}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{
            scale: [1, 2.5],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: index * 0.5,
          }}
        />
      ))}

      {/* Badge Count */}
      {count !== undefined && count > 0 && (
        <motion.div
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 shadow-lg z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 300,
          }}
        >
          {count > 99 ? '99+' : count}
        </motion.div>
      )}
    </motion.div>
  );
}

// Notification Dot - simpler version for inline use
interface NotificationDotProps {
  show: boolean;
  size?: 'sm' | 'md';
  color?: 'blue' | 'orange' | 'red' | 'green';
  pulse?: boolean;
}

export function NotificationDot({ 
  show, 
  size = 'sm',
  color = 'red',
  pulse = true 
}: NotificationDotProps) {
  if (!show) return null;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
  };

  return (
    <div className="relative">
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
        animate={pulse ? {
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {pulse && (
        <motion.div
          className={`absolute inset-0 ${colorClasses[color]} rounded-full`}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{
            scale: 2,
            opacity: 0,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </div>
  );
}
