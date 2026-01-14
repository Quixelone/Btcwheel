import { motion } from 'motion/react';
import { useState } from 'react';

interface CardFlipProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  className?: string;
}

export function CardFlip({ 
  front, 
  back, 
  isFlipped: controlledFlipped,
  onFlip,
  className = '' 
}: CardFlipProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  
  // Use controlled or uncontrolled state
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    if (controlledFlipped === undefined) {
      setInternalFlipped(newFlipped);
    }
    onFlip?.(newFlipped);
  };

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onClick={handleFlip}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: 0.6,
          ease: [0.43, 0.13, 0.23, 0.96]
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
          animate={{ opacity: isFlipped ? 0 : 1 }}
          transition={{ duration: 0.1, delay: isFlipped ? 0 : 0.3 }}
        >
          {front}
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
          animate={{ opacity: isFlipped ? 1 : 0 }}
          transition={{ duration: 0.1, delay: isFlipped ? 0.3 : 0 }}
        >
          {back}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Quick Flip Component for flashcards
interface FlashcardProps {
  question: string;
  answer: string;
  className?: string;
}

export function Flashcard({ question, answer, className = '' }: FlashcardProps) {
  return (
    <CardFlip
      className={className}
      front={
        <div className="w-full h-full min-h-48 bg-blue-500 rounded-xl p-6 flex items-center justify-center text-white shadow-lg">
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide opacity-80 mb-2">Question</p>
            <p className="text-xl">{question}</p>
          </div>
        </div>
      }
      back={
        <div className="w-full h-full min-h-48 bg-orange-500 rounded-xl p-6 flex items-center justify-center text-white shadow-lg">
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide opacity-80 mb-2">Answer</p>
            <p className="text-xl">{answer}</p>
          </div>
        </div>
      }
    />
  );
}
