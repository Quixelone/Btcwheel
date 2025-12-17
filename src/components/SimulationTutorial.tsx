import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { X, ChevronRight, ChevronLeft, Sparkles, Target, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <Card className="max-w-2xl w-full bg-white shadow-2xl border-2 border-emerald-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative">
          <Button
            onClick={onSkip}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            {/* Prof Satoshi Avatar */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-emerald-100">
              <img 
                src={
                  step.mascotEmotion === 'excited' || step.mascotEmotion === 'celebrating' || step.mascotEmotion === 'happy'
                    ? '/mascot-excited.png'
                    : step.mascotEmotion === 'teaching' || step.mascotEmotion === 'explaining'
                    ? '/mascot-normal.png'
                    : '/mascot-normal.png'
                } 
                alt="Prof Satoshi" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-emerald-100 text-sm mb-1">Prof Satoshi ti spiega...</p>
              <h2 className="text-white">{step.title}</h2>
            </div>
          </div>
          
          <Progress value={progress} className="h-2 bg-white/20" />
          <p className="text-emerald-100 text-sm mt-2">
            Passo {currentStep + 1} di {TUTORIAL_STEPS.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                  <IconComponent className="w-10 h-10 text-emerald-600" />
                </div>
              </div>

              {/* Main Content */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-center mb-6">
                  {step.content}
                </p>

                {/* Tips */}
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
                  <p className="text-emerald-900 font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Punti Chiave:
                  </p>
                  <ul className="space-y-2">
                    {step.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-emerald-600 mt-1">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  disabled={currentStep === 0}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Indietro
                </Button>
                
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? 'Inizia Simulazione' : 'Avanti'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Skip Link */}
              {currentStep < TUTORIAL_STEPS.length - 1 && (
                <button
                  onClick={onSkip}
                  className="w-full text-center text-gray-500 text-sm mt-4 hover:text-gray-700 transition-colors"
                >
                  Salta tutorial (puoi rivederlo dopo)
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
