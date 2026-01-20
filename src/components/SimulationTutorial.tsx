import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { X, ChevronRight, ChevronLeft, Sparkles, Target, TrendingUp, DollarSign, RefreshCw, GraduationCap, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SimulationTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: '👋 Benvenuto nel Simulatore!',
    content: 'Ciao! Sono Prof Satoshi e ti guiderò attraverso la **Bitcoin Wheel Strategy** con un simulatore paper trading. Qui puoi imparare senza rischi usando denaro virtuale!',
    icon: Sparkles,
    mascotEmotion: 'excited',
    tips: [
      'Capitale iniziale: $10,000 virtuali',
      'Nessun rischio reale',
      'Impara facendo pratica'
    ],
    color: 'emerald'
  },
  {
    id: 2,
    title: '🎯 Cos\'è la Wheel Strategy?',
    content: 'La Wheel è una strategia ciclica in 3 fasi:\n\n**1. Vendi PUT** → Raccogli premium\n**2. Vieni ASSEGNATO** → Compri BTC\n**3. Vendi CALL** → Raccogli altro premium\n\nPoi ricominci! È come una ruota che gira continuamente generando rendimento.',
    icon: Target,
    mascotEmotion: 'teaching',
    tips: [
      'Genera reddito passivo',
      'Funziona in mercati laterali',
      'Riduce il rischio vs. solo holding'
    ],
    color: 'blue'
  },
  {
    id: 3,
    title: '💰 Fase 1: Vendere Put',
    content: 'Quando **vendi una put**, accetti di comprare Bitcoin a un prezzo fisso (strike price) se il prezzo scende.\n\nIn cambio ricevi subito un **premium** (pagamento)!\n\nPensa: "Sono disposto a comprare BTC a $40,000? Allora vendo una put a quello strike e mi pago subito!"',
    icon: DollarSign,
    mascotEmotion: 'happy',
    tips: [
      'Scegli strike sotto il prezzo corrente',
      'Premium = guadagno immediato',
      'Più basso lo strike, più sicuro'
    ],
    color: 'orange'
  },
  {
    id: 4,
    title: '📈 Fase 2: L\'Assegnazione',
    content: 'Se Bitcoin scende sotto il tuo strike price, vieni **assegnato**:\n\n✅ Compri BTC al prezzo dello strike\n✅ Ma hai già guadagnato il premium!\n✅ Il tuo prezzo reale è: Strike - Premium\n\nEsempio: Strike $40k, Premium $500 → Prezzo effettivo $39,500',
    icon: TrendingUp,
    mascotEmotion: 'explaining',
    tips: [
      'Non è una perdita!',
      'Hai ridotto il costo grazie al premium',
      'Ora possiedi BTC per la fase 3'
    ],
    color: 'purple'
  },
  {
    id: 5,
    title: '🔄 Fase 3: Vendere Call',
    content: 'Ora che possiedi Bitcoin, puoi vendere una **covered call**:\n\nAccetti di vendere il tuo BTC a un prezzo più alto se il prezzo sale.\n\nRicevi un altro premium! Se BTC non sale, tieni il BTC E il premium. Se sale, vendi con profitto!\n\nWin-win! 🎉',
    icon: RefreshCw,
    mascotEmotion: 'celebrating',
    tips: [
      'Strike sopra il prezzo corrente',
      'Guadagno 1: Premium della put',
      'Guadagno 2: Premium della call',
      'Guadagno 3: Profitto se chiamato via'
    ],
    color: 'emerald'
  },
  {
    id: 6,
    title: '🎮 Come Usare il Simulatore',
    content: 'Ora sei pronto per iniziare! Ecco cosa fare:\n\n**1.** Osserva il prezzo di Bitcoin (si muove ogni 3 sec)\n**2.** Completa le missioni nell\'ordine\n**3.** Segui i tutorial di ogni missione\n**4.** Vendi opzioni e gestisci le posizioni\n**5.** Accumula XP e badge!\n\nLe prime missioni sono guidate passo-passo. Inizia con "Il Tuo Primo Premium"!',
    icon: Sparkles,
    mascotEmotion: 'teaching',
    tips: [
      '5 missioni progressive',
      'Tutorial integrati',
      'Feedback in tempo reale',
      'Nessun rischio, solo apprendimento!'
    ],
    color: 'blue'
  }
];

export function SimulationTutorial({ onComplete, onSkip }: SimulationTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const IconComponent = step.icon;

  const getColorClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'blue': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'orange': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'purple': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getGradientClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'from-emerald-600/20 to-teal-600/20';
      case 'blue': return 'from-blue-600/20 to-indigo-600/20';
      case 'orange': return 'from-orange-600/20 to-amber-600/20';
      case 'purple': return 'from-purple-600/20 to-pink-600/20';
      default: return 'from-emerald-600/20 to-teal-600/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <Card className="max-w-2xl w-full bg-slate-900/80 shadow-2xl border border-white/10 overflow-hidden rounded-[2.5rem] relative">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-${step.color}-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none transition-colors duration-500`} />

        {/* Header */}
        <div className={`bg-gradient-to-r ${getGradientClass(step.color)} p-8 text-white relative border-b border-white/5 transition-all duration-500`}>
          <Button
            onClick={onSkip}
            variant="ghost"
            size="sm"
            className="absolute top-6 right-6 w-10 h-10 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-6 mb-6">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-xl"
            >
              <span className="text-5xl">🧑‍🏫</span>
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className={`w-4 h-4 text-${step.color}-400`} />
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Prof Satoshi Academy</p>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">{step.title}</h2>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Progresso Lezione</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-950 border border-white/5" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border-2 shadow-lg transition-all duration-500 ${getColorClass(step.color)}`}>
                  <IconComponent className="w-12 h-12" />
                </div>
              </div>

              {/* Main Content */}
              <div className="mb-10">
                <p className="text-slate-300 leading-relaxed text-center mb-8 font-medium text-lg">
                  {step.content.split('\n').map((line, i) => (
                    <span key={i} className="block mb-2">
                      {line.includes('**') ? (
                        line.split('**').map((part, j) => (
                          j % 2 === 1 ? <strong key={j} className="text-white font-black">{part}</strong> : part
                        ))
                      ) : line}
                    </span>
                  ))}
                </p>

                {/* Tips */}
                <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1 h-full bg-${step.color}-500/50`} />
                  <p className="text-slate-500 font-black text-[10px] uppercase mb-4 flex items-center gap-2 tracking-widest">
                    <Lightbulb className={`w-4 h-4 text-${step.color}-400`} />
                    Punti Chiave della Lezione
                  </p>
                  <ul className="grid md:grid-cols-2 gap-4">
                    {step.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 text-slate-400 text-sm font-bold group-hover:text-slate-300 transition-colors">
                        <span className={`text-${step.color}-500 mt-0.5`}>✦</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-6">
                <Button
                  onClick={handlePrev}
                  variant="ghost"
                  disabled={currentStep === 0}
                  className="flex-1 h-16 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 font-black uppercase text-xs tracking-widest disabled:opacity-0 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Indietro
                </Button>

                <Button
                  onClick={handleNext}
                  className={`flex-[2] h-16 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl transition-all duration-500 ${step.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' :
                      step.color === 'blue' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' :
                        step.color === 'orange' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20' :
                          'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'
                    }`}
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? 'Inizia Simulazione' : 'Prossimo Passo'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Skip Link */}
              {currentStep < TUTORIAL_STEPS.length - 1 && (
                <button
                  onClick={onSkip}
                  className="w-full text-center text-slate-600 text-[10px] font-black uppercase mt-8 hover:text-slate-400 transition-colors tracking-[0.2em]"
                >
                  Salta il tutorial completo
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
