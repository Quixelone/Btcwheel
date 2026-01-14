import { useState } from 'react';
import { Button } from '../ui/button';
import { CheckCircle2, XCircle, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuizDragDropProps {
  question: string;
  items: string[];
  correctOrder: number[]; // Array of indices representing correct order
  explanation: string;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function QuizDragDrop({
  question,
  items,
  correctOrder,
  explanation,
  onAnswer,
  disabled = false,
}: QuizDragDropProps) {
  const [sortedItems, setSortedItems] = useState<string[]>([...items]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (disabled || showFeedback) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled || showFeedback || draggedIndex === null || draggedIndex === index) return;

    const newItems = [...sortedItems];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setSortedItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = () => {
    // Check if current order matches correct order
    const currentOrder = sortedItems.map((item) => items.indexOf(item));
    const correct = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);
    
    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswer(correct);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...sortedItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setSortedItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === sortedItems.length - 1) return;
    const newItems = [...sortedItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setSortedItems(newItems);
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="mb-6">
        <p className="text-gray-900 mb-6 leading-relaxed">{question}</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>📋 Istruzioni:</strong> Trascina gli elementi o usa le frecce per metterli nell{"'"}ordine corretto dall{"'"}alto verso il basso.
        </p>
      </div>

      {/* Drag and Drop Area */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
        <div className="space-y-3">
          {sortedItems.map((item, index) => (
            <motion.div
              key={`${item}-${index}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              draggable={!disabled && !showFeedback}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-4 bg-white rounded-lg border-2 ${
                draggedIndex === index
                  ? 'border-blue-500 opacity-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              } ${!disabled && !showFeedback ? 'cursor-move' : 'cursor-default'} transition-all`}
            >
              {!disabled && !showFeedback && (
                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
              </div>
              
              <span className="text-gray-800 flex-1">{item}</span>
              
              {!disabled && !showFeedback && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Sposta su"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === sortedItems.length - 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Sposta giù"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {!showFeedback && (
          <Button
            onClick={handleSubmit}
            disabled={disabled}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 h-12"
          >
            Verifica Ordine
          </Button>
        )}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-xl border-2 ${
              isCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <p className="text-gray-900 font-semibold mb-2">
                  {isCorrect ? '✓ Ordine corretto!' : '✗ Ordine non corretto'}
                </p>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {explanation}
                </p>
                {!isCorrect && (
                  <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Ordine corretto:</strong>
                    </p>
                    <ol className="list-decimal list-inside space-y-1">
                      {correctOrder.map((index) => (
                        <li key={index} className="text-sm text-gray-700">
                          {items[index]}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
