import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Zap, TrendingUp, Send, X, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { ChatTypingBubble } from './animations/AIThinkingIndicator';
import { useHaptics } from '../hooks/useHaptics';
import { useMascotSounds } from '../hooks/useMascotSounds';
import { useUserProgress } from '../hooks/useUserProgress';
import { useMascotEmotion } from '../hooks/useMascotEmotion';

// Prof Satoshi mascot images - NEW professional 3D renders
import profSatoshiExcited from 'figma:asset/ab3d59171ab68c537dd57d97d7e9d4de0a06850d.png'; // Jumping with confetti  
import profSatoshiNormal from 'figma:asset/f29b56f4742151c06a28cc25bd25d8102cbe4d79.png'; // Double thumbs up
import profSatoshiConfident from 'figma:asset/7d386e671a6e8284b17426eaf3e9958b6a264ae0.png'; // Hands on hips

// For backward compatibility with existing code
const mascotNormalImage = profSatoshiNormal;
const mascotDisappointedImage = profSatoshiConfident; // Using confident pose for thinking/serious state
const mascotExcitedImage = profSatoshiExcited;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LessonContext {
  lessonId: number;
  lessonTitle: string;
}

interface MascotAIProps {
  lessonContext?: LessonContext | null;
}

export function MascotAI({ lessonContext }: MascotAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // 🎯 NEW: Minimizable state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const haptics = useHaptics();
  const sounds = useMascotSounds();
  const { progress } = useUserProgress();
  
  // 🎭 NUOVO: Sistema emozioni intelligenti
  const { emotion, message: emotionMessage, setActivity } = useMascotEmotion();

  // Check preferences
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('mascotSoundEnabled') !== 'false';
  });

  const playSound = (soundFn: () => void) => {
    if (soundEnabled) soundFn();
  };

  // Load chat history
  useEffect(() => {
    const saved = localStorage.getItem('btc-wheel-chat-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('btc-wheel-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🎭 Update emotion based on chat state (FIXED: no infinite loop)
  useEffect(() => {
    if (isLoading) {
      setActivity('ai_thinking');
    } else if (input.length > 0) {
      setActivity('ai_listening');
    } else if (messages.length > 0 && messages[messages.length - 1]?.role === 'assistant') {
      setActivity('ai_responding', 3000);
    }
  }, [isLoading, input.length, messages.length, setActivity]); // setActivity is now stable!

  // 🎨 Map emotion to mascot image with smooth transitions
  const getMascotImage = () => {
    // Map emotions to available images
    switch (emotion) {
      case 'disappointed':
      case 'encouraging':
        return mascotDisappointedImage;
      
      case 'excited':
      case 'celebrating':
        return mascotExcitedImage;
      
      case 'normal':
      case 'teaching':
      case 'thinking':
      case 'sleeping':
      default:
        return mascotNormalImage;
    }
  };

  const handleToggle = () => {
    // 🎯 Se minimizzata, prima ripristina dimensione normale
    if (isMinimized) {
      setIsMinimized(false);
      toast.success('Mascotte ripristinata!');
      return;
    }

    if (isOpen) {
      // Chiudi la chat
      setIsOpen(false);
      setActivity('idle');
      playSound(() => sounds.click());
      haptics.light();
    } else {
      // Apri la chat
      setIsOpen(true);
      playSound(() => {
        sounds.click();
        sounds.tipShow();
      });
      haptics.medium();
      
      // Welcome if first time
      if (messages.length === 0) {
        setActivity('excited', 2000);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setActivity('idle');
    playSound(() => sounds.click());
    haptics.light();
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setActivity('ai_thinking');
    
    playSound(() => sounds.click());
    haptics.light();

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/chat-tutor`;
      
      // Build context
      const conversationHistory = messages.slice(-4).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const context = {
        userLevel: progress.level,
        userXP: progress.xp,
        completedLessons: progress.completedLessons.length,
        totalLessons: 15,
        currentStreak: progress.currentStreak,
        badges: progress.badges,
        lessonContext,
        conversationHistory
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setActivity('ai_responding', 3000);
        playSound(() => sounds.excited());
        haptics.success();

        // Check for achievement triggers
        if (data.response.includes('Bravo') || data.response.includes('Ottimo')) {
          setActivity('celebrating', 1500);
        }
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Mi dispiace, ho avuto un problema tecnico. Riprova tra poco! 🔧",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setActivity('disappointed', 3000);
      
      toast.error('Errore di connessione AI');
      playSound(() => sounds.disappointed());
      haptics.error();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('btc-wheel-chat-history');
    toast.success('Chat cancellata');
    playSound(() => sounds.tipDismiss());
    haptics.light();
    setActivity('idle');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Come funziona la Wheel Strategy?",
    "Cosa sono le opzioni cash-secured put?",
    "Quando dovrei vendere covered call?"
  ];

  // 🎬 Mascot animation classes based on EMOTION (UPDATED)
  const getMascotAnimation = () => {
    switch (emotion) {
      case 'thinking':
        return 'animate-pulse';
      case 'celebrating':
      case 'excited':
        return 'animate-bounce';
      case 'teaching':
        return 'mascot-teaching';
      case 'sleeping':
        return 'mascot-sleeping';
      default:
        return 'mascot-idle';
    }
  };

  // 🎨 Colors based on EMOTION (UPDATED)
  const getMoodColors = () => {
    switch (emotion) {
      case 'excited':
      case 'celebrating':
        return {
          gradient: 'from-yellow-500/20 to-green-500/20',
          border: 'border-yellow-500/30',
          glow: 'shadow-yellow-500/20',
          ring: 'bg-yellow-400'
        };
      case 'disappointed':
      case 'encouraging':
        return {
          gradient: 'from-orange-500/20 to-red-500/20',
          border: 'border-orange-500/30',
          glow: 'shadow-orange-500/20',
          ring: 'bg-orange-400'
        };
      case 'thinking':
        return {
          gradient: 'from-purple-500/20 to-blue-500/20',
          border: 'border-purple-500/30',
          glow: 'shadow-purple-500/20',
          ring: 'bg-purple-400'
        };
      case 'teaching':
        return {
          gradient: 'from-blue-400/20 to-cyan-400/20',
          border: 'border-blue-400/30',
          glow: 'shadow-blue-400/20',
          ring: 'bg-blue-300'
        };
      case 'sleeping':
        return {
          gradient: 'from-gray-400/20 to-gray-500/20',
          border: 'border-gray-400/30',
          glow: 'shadow-gray-400/20',
          ring: 'bg-gray-300'
        };
      default:
        return {
          gradient: 'from-blue-500/20 to-purple-500/20',
          border: 'border-blue-500/30',
          glow: 'shadow-blue-500/20',
          ring: 'bg-blue-400'
        };
    }
  };

  const colors = getMoodColors();

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes float-idle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        
        @keyframes listening {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(-2deg); }
          75% { transform: scale(1.05) rotate(2deg); }
        }
        
        @keyframes thinking-head {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        
        .mascot-idle {
          animation: float-idle 3s ease-in-out infinite;
        }
        
        .mascot-listening {
          animation: listening 2s ease-in-out infinite;
        }
        
        .mascot-thinking {
          animation: thinking-head 0.8s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Mascot Button */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 safe-area-bottom">
        <div className="relative">
          {/* AI Chat Window */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                className="absolute bottom-40 md:bottom-64 right-0 w-[calc(100vw-2rem)] md:w-[600px] max-w-2xl"
              >
                <Card className="backdrop-blur-xl bg-white/95 shadow-2xl border-2 border-blue-200/50">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                          <img 
                            src={getMascotImage()} 
                            alt="Prof Satoshi AI" 
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <h3 className="text-white">Prof Satoshi AI</h3>
                          <p className="text-xs text-blue-100">Sempre qui per aiutarti!</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {messages.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleClearChat}
                            className="text-white hover:bg-white/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleClose}
                          className="text-white hover:bg-white/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="h-[400px] md:h-[500px] overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                        >
                          <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <div>
                          <h4 className="text-gray-900 mb-2">Ciao! 👋 Sono Prof Satoshi!</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Il tuo AI tutor personale per la Bitcoin Wheel Strategy.
                            <br />Chiedimi qualsiasi cosa!
                          </p>
                        </div>

                        {/* Context Badges */}
                        <div className="flex flex-wrap gap-2 justify-center">
                          {lessonContext && (
                            <Badge variant="outline" className="bg-blue-50 border-blue-200">
                              <Brain className="w-3 h-3 mr-1" />
                              Contesto: Lezione {lessonContext.lessonId}
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-purple-50 border-purple-200">
                            <Zap className="w-3 h-3 mr-1" />
                            Livello {progress.level}
                          </Badge>
                          <Badge variant="outline" className="bg-orange-50 border-orange-200">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {progress.completedLessons.length}/15 Lezioni
                          </Badge>
                        </div>

                        {/* Suggested Questions */}
                        <div className="w-full space-y-2">
                          <p className="text-xs text-gray-500">Prova a chiedermi:</p>
                          {suggestedQuestions.map((question, idx) => (
                            <button
                              key={idx}
                              onClick={() => setInput(question)}
                              className="w-full text-left p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg text-sm text-gray-700 transition-all border border-blue-200/50 hover:border-blue-300"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl p-3 ${
                                message.role === 'user'
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString('it-IT', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                        
                        {/* AI Typing indicator */}
                        {isLoading && <ChatTypingBubble />}
                        
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-t p-4 bg-gray-50/50 rounded-b-lg">
                    <div className="flex gap-2">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Scrivi la tua domanda..."
                        className="flex-1 resize-none rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-[120px]"
                        rows={1}
                        disabled={isLoading}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Premi Invio per inviare, Shift+Invio per andare a capo
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mascot Avatar */}
          <motion.button
            onClick={handleToggle}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={!isOpen ? {
              scale: [1, 1.03, 1],
              y: [0, -8, 0],
            } : {}}
            transition={{
              scale: {
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              y: {
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            className={`relative cursor-pointer group touch-manipulation transition-all ${
              isMinimized ? 'w-14 h-14 md:w-16 md:h-16' : 'w-32 h-32 md:w-56 md:h-56'
            }`}
            aria-label={isOpen ? "Chiudi AI Tutor" : "Apri AI Tutor"}
            onDoubleClick={() => setIsMinimized(!isMinimized)} // 🎯 Double click per minimizzare
          >
            {/* Animated rings */}
            {!isOpen && (
              <>
                <motion.div 
                  className={`absolute inset-0 rounded-full ${colors.ring} opacity-30`}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                  className={`absolute inset-0 rounded-full ${colors.ring} opacity-20`}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
              </>
            )}
            
            {/* Glow effect */}
            {(isHovering || isOpen) && (
              <motion.div 
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.gradient} blur-xl`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* 💬 Emotion Tooltip (appears on hover) */}
            <AnimatePresence>
              {isHovering && !isOpen && emotionMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ type: "spring", bounce: 0.4, duration: 0.3 }}
                  className="absolute -top-16 md:-top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white rounded-2xl shadow-xl border-2 border-blue-200 whitespace-nowrap z-50"
                >
                  <p className="text-sm text-gray-800">{emotionMessage}</p>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r-2 border-b-2 border-blue-200"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mascot Image with animations + smooth transition */}
            <motion.div 
              className={`relative w-full h-full flex items-center justify-center ${getMascotAnimation()}`}
              key={emotion} // Force re-render on emotion change for smooth transition
            >
              <motion.img 
                src={getMascotImage()} 
                alt="Prof Satoshi AI Mascot" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.3))'
                }}
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </motion.div>

            {/* Thinking particles */}
            {emotion === 'thinking' && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-purple-400 rounded-full"
                    style={{
                      top: `${30 + i * 15}%`,
                      left: `${20}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: [-10, 0],
                      y: [-20, -40],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </>
            )}

            {/* Excited sparkles */}
            {(emotion === 'excited' || emotion === 'celebrating') && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      y: [0, -20],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </>
            )}

            {/* AI Badge */}
            <motion.div 
              className="absolute top-2 right-2 md:top-4 md:right-4 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs shadow-lg border-2 border-white"
              animate={{ scale: isOpen ? 1 : [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: isOpen ? 0 : Infinity }}
            >
              AI
            </motion.div>

            {/* 🎯 Minimize Button (only when NOT open and NOT minimized) */}
            {!isOpen && !isMinimized && (
              <motion.div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                  toast.info('Mascotte minimizzata. Clicca per ripristinare.');
                }}
                className="absolute -top-2 -left-2 w-8 h-8 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Riduci mascotte"
              >
                <span className="text-white text-xs font-bold">−</span>
              </motion.div>
            )}

            {/* 🎯 Expand Button (only when minimized) */}
            {isMinimized && (
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-white text-xs font-bold">+</span>
              </motion.div>
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
}