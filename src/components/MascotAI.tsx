import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { Sparkles, Send, X, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { ChatTypingBubble } from './animations/AIThinkingIndicator';
import { useHaptics } from '../hooks/useHaptics';
import { useMascotSounds } from '../hooks/useMascotSounds';
import { useUserProgress } from '../hooks/useUserProgress';
import { useMascotEmotion } from '../hooks/useMascotEmotion';


// Prof Satoshi mascot images - USING PNG for reliability
const profSatoshiExcited = '/mascot-excited.png';
const profSatoshiNormal = '/mascot-normal.png';

const mascotNormalImage = profSatoshiNormal;
const mascotDisappointedImage = '/mascot-disappointed.png';
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
  isVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export function MascotAI({ lessonContext, isVisible = true, onVisibilityChange }: MascotAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragControls = useDragControls();
  const haptics = useHaptics();
  const sounds = useMascotSounds();
  const { progress } = useUserProgress();

  // Use streak property correctly
  const streak = progress?.streak || 0;

  const { emotion, message: emotionMessage, setActivity } = useMascotEmotion();

  const [soundEnabled] = useState(() => {
    return localStorage.getItem('mascotSoundEnabled') !== 'false';
  });

  const playSound = (soundFn: () => void) => {
    if (soundEnabled) soundFn();
  };

  // Position persistence removed for reset
  useEffect(() => {
    // localStorage.setItem('mascot-position', JSON.stringify(position));
  }, [position]);

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

  // Update emotion based on chat state
  useEffect(() => {
    if (isLoading) {
      setActivity('ai_thinking');
    } else if (input.length > 0) {
      setActivity('ai_listening');
    } else if (messages.length > 0 && messages[messages.length - 1]?.role === 'assistant') {
      setActivity('ai_responding', 3000);
    }
  }, [isLoading, input.length, messages.length, setActivity]);

  const getMascotImage = () => {
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

  const handleMascotClick = () => {
    console.log('🎭 Mascot clicked! isOpen:', isOpen);

    if (!isOpen) {
      // 1st click: Open the chat dialog
      console.log('🎭 Opening chat dialog');
      setIsOpen(true);
      playSound(() => {
        sounds.click();
        sounds.tipShow();
      });
      haptics.medium();

      if (messages.length === 0) {
        setActivity('excited', 2000);
      }
      return;
    }

    // 2nd click: Just close the dialog
    console.log('🎭 Closing dialog');
    setIsOpen(false);
    setActivity('idle');
    playSound(() => sounds.click());
    haptics.light();
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
      // Use production n8n webhook that bridges to NotebookLM
      const apiUrl = 'https://primary-production-92d1.up.railway.app/webhook/btcwheel-chat';

      const conversationHistory = messages.slice(-4).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const context = {
        userLevel: progress.level,
        userXP: progress.xp,
        completedLessons: progress.completedLessons.length,
        totalLessons: 15,
        currentStreak: streak,
        badges: progress.badges,
        lessonContext,
        conversationHistory
      };

      // Create a controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage.content,
            context
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Handle both object {response: ""} and n8n array [{response: ""}]
        const aiResponse = data.response ||
          (Array.isArray(data) && data[0]?.response) ||
          data.output ||
          (Array.isArray(data) && data[0]?.output);

        if (aiResponse) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, assistantMessage]);
          setActivity('ai_responding', 3000);
          playSound(() => sounds.excited());
          haptics.success();

          if (aiResponse.includes('Bravo') || aiResponse.includes('Ottimo')) {
            setActivity('celebrating', 1500);
          }
        } else if (data.message === 'Workflow was started') {
          throw new Error('Configurazione n8n errata: il Webhook deve essere impostato su "When Last Node Finishes" nelle impostazioni del nodo.');
        } else {
          console.error('Unexpected AI response structure:', data);
          throw new Error(`Risposta vuota o formato non valido (Ricevuto: ${JSON.stringify(data).substring(0, 50)}...)`);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Timeout della connessione (30s)');
        }
        throw err;
      }
    } catch (error) {
      console.error('AI Chat error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Mi dispiace, ho avuto un problema tecnico: ${error instanceof Error ? error.message : 'Connessione fallita'}. Riprova tra poco! 🔧`,
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

  const getMascotAnimation = () => {
    switch (emotion) {
      case 'thinking':
        return 'animate-pulse';
      case 'celebrating':
      case 'excited':
        return 'animate-bounce';
      default:
        return 'mascot-idle';
    }
  };

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

  // Hide component if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes float-idle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        
        .mascot-idle {
          animation: float-idle 3s ease-in-out infinite;
        }
      `}</style>

      {/* Draggable Mascot Container */}
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        onDragEnd={(_event, info) => {
          setPosition({ x: info.offset.x, y: info.offset.y });
        }}
        style={{ x: position.x, y: position.y }}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-[9999] safe-area-bottom"
      >
        <div className="relative">
          {/* AI Chat Window */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                className="absolute bottom-32 md:bottom-40 right-0 w-[calc(100vw-2rem)] md:w-[600px] max-w-2xl"
              >
                <Card className="h-full flex flex-col shadow-2xl overflow-hidden border-slate-800 bg-slate-900/95 backdrop-blur-xl">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <img
                          src={getMascotImage()}
                          alt="Prof Satoshi AI"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Prof Satoshi AI</h3>
                        <p className="text-xs text-blue-100 opacity-80">Sempre qui per aiutarti!</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {messages.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleClearChat}
                          className="text-white hover:bg-white/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleClose}
                        className="text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="h-[400px] md:h-[500px] overflow-y-auto p-4 space-y-4 bg-slate-900/50 custom-scrollbar">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20"
                        >
                          <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <div>
                          <h4 className="text-slate-100 font-semibold mb-2">Ciao! 👋 Sono Prof Satoshi!</h4>
                          <p className="text-sm text-slate-400 mb-4">
                            Il tuo AI tutor personale per la Bitcoin Wheel Strategy.
                            <br />Chiedimi qualsiasi cosa!
                          </p>
                        </div>

                        {/* Suggested Questions */}
                        <div className="w-full space-y-2">
                          <p className="text-xs text-slate-500">Prova a chiedermi:</p>
                          {suggestedQuestions.map((question, idx) => (
                            <button
                              key={idx}
                              onClick={() => setInput(question)}
                              className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-sm text-slate-300 transition-all border border-slate-700 hover:border-blue-500/50"
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
                              className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-slate-800 text-slate-100 border border-slate-700'
                                }`}
                            >
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                              <p className={`text-[10px] mt-1 opacity-60 ${message.role === 'user' ? 'text-white' : 'text-slate-400'
                                }`}>
                                {message.timestamp.toLocaleTimeString('it-IT', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </motion.div>
                        ))}

                        {isLoading && <ChatTypingBubble />}

                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-t border-slate-800 p-4 bg-slate-900/80 backdrop-blur-sm rounded-b-lg">
                    <div className="flex gap-2">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Scrivi la tua domanda..."
                        className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[44px] max-h-[120px] transition-all"
                        rows={1}
                        disabled={isLoading}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 rounded-xl shadow-lg shadow-blue-900/20"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 text-center">
                      Premi Invio per inviare, Shift+Invio per andare a capo
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mascot Avatar - Clickable and Draggable */}
          <motion.div
            onClick={handleMascotClick}
            onDoubleClick={() => {
              console.log('🎭 Mascot double clicked! Hiding...');
              if (onVisibilityChange) {
                onVisibilityChange(false);
              }
            }}
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
            className="relative cursor-pointer group touch-manipulation w-24 h-24 md:w-32 md:h-32"
            aria-label={isOpen ? "Chiudi e nascondi AI Tutor" : "Apri AI Tutor"}
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

            {/* Emotion Tooltip */}
            <AnimatePresence>
              {isHovering && !isOpen && emotionMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ type: "spring", bounce: 0.4, duration: 0.3 }}
                  className="absolute -top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-slate-800 rounded-2xl shadow-xl border-2 border-blue-500/50 whitespace-nowrap z-50"
                >
                  <p className="text-sm text-white font-medium">{emotionMessage}</p>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-slate-800 border-r-2 border-b-2 border-blue-500/50"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mascot Image */}
            <motion.div
              className={`relative w-full h-full flex items-center justify-center ${getMascotAnimation()}`}
              key={emotion}
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

            {/* Close Button (Visible on Hover) */}
            <AnimatePresence>
              {isHovering && !isOpen && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening chat
                    if (onVisibilityChange) onVisibilityChange(false);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border border-white z-50 hover:bg-red-600 transition-colors"
                  title="Nascondi Mascotte"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* AI Badge */}
            <motion.div
              className="absolute top-1 right-1 md:top-2 md:right-2 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs shadow-lg border border-white"
              animate={{ scale: isOpen ? 1 : [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: isOpen ? 0 : Infinity }}
            >
              AI
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
