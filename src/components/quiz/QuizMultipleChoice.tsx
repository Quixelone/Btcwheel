import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { motion } from 'motion/react';

interface QuizMultipleChoiceProps {
    question: string;
    options: string[];
    correctAnswer: number;
    selectedAnswer: string;
    onSelect: (answer: string) => void;
    feedbackState: 'idle' | 'correct' | 'wrong';
    disabled?: boolean;
}

export function QuizMultipleChoice({
    question,
    options,
    correctAnswer,
    selectedAnswer,
    onSelect,
    feedbackState,
    disabled = false,
}: QuizMultipleChoiceProps) {
    return (
        <div className="space-y-8 w-full">
            <h2 className="text-2xl font-black text-white leading-tight">
                {question}
            </h2>

            <RadioGroup
                value={selectedAnswer}
                onValueChange={onSelect}
                className="space-y-3"
                disabled={disabled || feedbackState !== 'idle'}
            >
                {options.map((option, idx) => {
                    const isSelected = selectedAnswer === String(idx);
                    const isCorrect = String(idx) === String(correctAnswer);

                    let borderColor = 'border-slate-700';
                    let bgColor = 'bg-slate-800/30';
                    let textColor = 'text-slate-400';

                    if (isSelected) {
                        borderColor = 'border-blue-500';
                        bgColor = 'bg-blue-500/10';
                        textColor = 'text-white';
                    }

                    if (feedbackState === 'correct' && isCorrect) {
                        borderColor = 'border-emerald-500';
                        bgColor = 'bg-emerald-500/20';
                        textColor = 'text-emerald-400';
                    }

                    if (feedbackState === 'wrong') {
                        if (isSelected && !isCorrect) {
                            borderColor = 'border-red-500';
                            bgColor = 'bg-red-500/20';
                            textColor = 'text-red-400';
                        } else if (isCorrect) {
                            borderColor = 'border-emerald-500';
                            bgColor = 'bg-emerald-500/10';
                        }
                    }

                    return (
                        <motion.div
                            key={idx}
                            whileHover={feedbackState === 'idle' ? { scale: 1.01 } : {}}
                            whileTap={feedbackState === 'idle' ? { scale: 0.99 } : {}}
                        >
                            <RadioGroupItem
                                value={String(idx)}
                                id={`opt-${idx}`}
                                className="sr-only"
                            />
                            <Label
                                htmlFor={`opt-${idx}`}
                                className={`
                  flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all text-lg font-medium
                  ${borderColor} ${bgColor} ${textColor}
                  ${feedbackState === 'idle' ? 'hover:border-slate-500' : 'cursor-default'}
                `}
                            >
                                <span className={`
                  w-8 h-8 rounded-lg border border-current flex items-center justify-center mr-4 text-sm font-black
                  ${isSelected ? 'bg-current text-slate-900' : ''}
                `}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                {option}
                            </Label>
                        </motion.div>
                    );
                })}
            </RadioGroup>
        </div>
    );
}
