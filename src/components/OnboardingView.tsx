import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';

import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import {
  Bitcoin,
  Target,
  Clock,
  TrendingUp,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,


} from 'lucide-react';
import type { UserProfile } from '../lib/openai';
import { useOnboarding } from '../hooks/useOnboarding';

interface OnboardingViewProps {
  onComplete: () => void;
}

interface LoadingMessageProps {
  message: string;
  delay: number;
}

function LoadingMessage({ message, delay }: LoadingMessageProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="text-slate-400 font-medium"
    >
      {message}
    </motion.p>
  );
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const { completeOnboarding, skipOnboarding, analyzing } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    experienceLevel: undefined,
    tradingKnowledge: undefined,
    optionsKnowledge: undefined,
    goals: [],
    availableTime: undefined,
    capital: undefined,
    learningStyle: [],
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding(profile as UserProfile);
      onComplete();
    } catch (error) {
      console.error('Error in handleComplete:', error);
      onComplete();
    }
  };

  const handleSkip = () => {
    skipOnboarding();
    onComplete();
  };

  const updateProfile = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: keyof UserProfile, value: string) => {
    setProfile(prev => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 0: return !!profile.experienceLevel;
      case 1: return !!profile.tradingKnowledge;
      case 2: return !!profile.optionsKnowledge;
      case 3: return (profile.goals?.length || 0) > 0;
      case 4: return !!profile.availableTime;
      case 5: return !!profile.capital && (profile.learningStyle?.length || 0) > 0;
      default: return false;
    }
  };

  const steps = [
    {
      title: 'Esperienza Crypto',
      icon: Bitcoin,
      description: 'Quanto conosci il mondo delle criptovalute?',
      content: (
        <RadioGroup
          value={profile.experienceLevel}
          onValueChange={(value: any) => updateProfile('experienceLevel', value)}
          className="grid gap-4"
        >
          {[
            { id: 'beginner', label: 'Principiante', desc: 'Nuovo al mondo crypto, poca o nessuna esperienza', icon: '🌱' },
            { id: 'intermediate', label: 'Intermedio', desc: 'Ho già investito in crypto, conosco le basi', icon: '📈' },
            { id: 'advanced', label: 'Avanzato', desc: 'Trading attivo, esperto di crypto e mercati', icon: '🚀' }
          ].map((opt) => (
            <div key={opt.id} className="relative">
              <RadioGroupItem value={opt.id} id={`exp-${opt.id}`} className="peer sr-only" />
              <Label
                htmlFor={`exp-${opt.id}`}
                className="flex items-center gap-4 p-6 rounded-[1.5rem] border-2 border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-emerald-500/30 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-500/10 cursor-pointer transition-all"
              >
                <span className="text-3xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="font-black text-white uppercase tracking-tight">{opt.label}</p>
                  <p className="text-xs text-slate-500 font-medium">{opt.desc}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      ),
    },
    {
      title: 'Esperienza Trading',
      icon: TrendingUp,
      description: 'Hai mai operato sui mercati finanziari?',
      content: (
        <RadioGroup
          value={profile.tradingKnowledge}
          onValueChange={(value: any) => updateProfile('tradingKnowledge', value)}
          className="grid gap-4"
        >
          {[
            { id: 'none', label: 'Nessuna', desc: 'Mai fatto trading prima', icon: '❌' },
            { id: 'basic', label: 'Base', desc: 'Ho comprato/venduto azioni o crypto spot', icon: '📊' },
            { id: 'experienced', label: 'Esperto', desc: 'Trading attivo con analisi tecnica', icon: '💼' }
          ].map((opt) => (
            <div key={opt.id} className="relative">
              <RadioGroupItem value={opt.id} id={`trade-${opt.id}`} className="peer sr-only" />
              <Label
                htmlFor={`trade-${opt.id}`}
                className="flex items-center gap-4 p-6 rounded-[1.5rem] border-2 border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-emerald-500/30 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-500/10 cursor-pointer transition-all"
              >
                <span className="text-3xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="font-black text-white uppercase tracking-tight">{opt.label}</p>
                  <p className="text-xs text-slate-500 font-medium">{opt.desc}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      ),
    },
    {
      title: 'Conoscenza Opzioni',
      icon: GraduationCap,
      description: 'Cosa sai delle opzioni Bitcoin?',
      content: (
        <RadioGroup
          value={profile.optionsKnowledge}
          onValueChange={(value: any) => updateProfile('optionsKnowledge', value)}
          className="grid gap-4"
        >
          {[
            { id: 'none', label: 'Mai sentite', desc: 'Non so cosa sono le opzioni', icon: '❓' },
            { id: 'basic', label: 'Teoria', desc: 'So cosa sono ma non le ho mai tradiate', icon: '📖' },
            { id: 'experienced', label: 'Pratico', desc: 'Ho già tradato opzioni (stocks/crypto)', icon: '⚡' }
          ].map((opt) => (
            <div key={opt.id} className="relative">
              <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} className="peer sr-only" />
              <Label
                htmlFor={`opt-${opt.id}`}
                className="flex items-center gap-4 p-6 rounded-[1.5rem] border-2 border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-emerald-500/30 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-500/10 cursor-pointer transition-all"
              >
                <span className="text-3xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="font-black text-white uppercase tracking-tight">{opt.label}</p>
                  <p className="text-xs text-slate-500 font-medium">{opt.desc}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      ),
    },
    {
      title: 'I Tuoi Obiettivi',
      icon: Target,
      description: 'Definisci il tuo "Perché". Questo aiuterà Prof Satoshi a scegliere la strategia giusta (es. Reddito mensile vs Crescita a lungo termine).',
      content: (
        <div className="grid gap-4">
          {[
            { value: 'learn', label: 'Imparare Strategia', desc: 'Acquisire competenze trading opzioni', icon: '🎓' },
            { value: 'income', label: 'Reddito Passivo', desc: 'Creare flusso di cassa mensile', icon: '💰' },
            { value: 'hedge', label: 'Proteggere Portfolio', desc: 'Hedging e gestione rischio', icon: '🛡️' },
            { value: 'curiosity', label: 'Curiosità', desc: 'Esplorare il mondo delle opzioni', icon: '🔍' },
          ].map((goal) => (
            <div
              key={goal.value}
              className={`flex items-center gap-4 p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer ${profile.goals?.includes(goal.value)
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-emerald-500/30'
                }`}
              onClick={() => toggleArrayValue('goals', goal.value)}
            >
              <Checkbox
                checked={profile.goals?.includes(goal.value)}
                onCheckedChange={() => toggleArrayValue('goals', goal.value)}
                className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <div className="flex-1">
                <p className="font-black text-white uppercase tracking-tight">{goal.label}</p>
                <p className="text-xs text-slate-500 font-medium">{goal.desc}</p>
              </div>
              <span className="text-2xl">{goal.icon}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Tempo Disponibile',
      icon: Clock,
      description: 'Quanto tempo puoi dedicare allo studio?',
      content: (
        <RadioGroup
          value={profile.availableTime}
          onValueChange={(value: any) => updateProfile('availableTime', value)}
          className="grid gap-4"
        >
          {[
            { id: 'limited', label: 'Limitato', desc: '10-15 minuti al giorno', icon: '⏱️' },
            { id: 'moderate', label: 'Moderato', desc: '30-60 minuti al giorno', icon: '⏰' },
            { id: 'plenty', label: 'Abbondante', desc: '1-2 ore al giorno o più', icon: '🕐' }
          ].map((opt) => (
            <div key={opt.id} className="relative">
              <RadioGroupItem value={opt.id} id={`time-${opt.id}`} className="peer sr-only" />
              <Label
                htmlFor={`time-${opt.id}`}
                className="flex items-center gap-4 p-6 rounded-[1.5rem] border-2 border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-emerald-500/30 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-500/10 cursor-pointer transition-all"
              >
                <span className="text-3xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="font-black text-white uppercase tracking-tight">{opt.label}</p>
                  <p className="text-xs text-slate-500 font-medium">{opt.desc}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      ),
    },
    {
      title: 'Capitale & Stile',
      icon: Sparkles,
      description: 'Ultimi dettagli per personalizzare il tuo percorso.',
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Capitale per Trading</h3>
            <RadioGroup
              value={profile.capital}
              onValueChange={(value: any) => updateProfile('capital', value)}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { id: 'learning', label: 'Simulatore' },
                { id: 'small', label: '< $5,000' },
                { id: 'medium', label: '$5k - $25k' },
                { id: 'large', label: '> $25,000' }
              ].map((opt) => (
                <div key={opt.id} className="relative">
                  <RadioGroupItem value={opt.id} id={`cap-${opt.id}`} className="peer sr-only" />
                  <Label
                    htmlFor={`cap-${opt.id}`}
                    className="flex items-center justify-center p-4 rounded-2xl border-2 border-white/5 bg-slate-900/50 hover:bg-slate-900 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-500/10 cursor-pointer transition-all text-[10px] font-black uppercase tracking-widest text-white"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Preferenze Apprendimento</h3>
            <div className="grid gap-3">
              {[
                { value: 'reading', label: 'Testi ed Esempi', icon: '📖' },
                { value: 'practice', label: 'Pratica Simulatore', icon: '🎮' },
                { value: 'visual', label: 'Grafici e Visual', icon: '📊' },
                { value: 'interactive', label: 'Quiz Interattivi', icon: '💬' },
              ].map((style) => (
                <div
                  key={style.value}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${profile.learningStyle?.includes(style.value)
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-emerald-500/30'
                    }`}
                  onClick={() => toggleArrayValue('learningStyle', style.value)}
                >
                  <Checkbox
                    checked={profile.learningStyle?.includes(style.value)}
                    onCheckedChange={() => toggleArrayValue('learningStyle', style.value)}
                    className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <Label className="flex-1 cursor-pointer text-[10px] font-black uppercase tracking-widest text-white">{style.label}</Label>
                  <span className="text-xl">{style.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <Card className="w-full max-w-2xl bg-slate-900/50 border border-white/10 rounded-[3rem] shadow-2xl backdrop-blur-xl relative z-10 overflow-hidden">
        {/* Loading Overlay */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 mb-8 relative"
              >
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                <img
                  src="/mascot-excited.png"
                  alt="Prof Satoshi Analyzing"
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                />
              </motion.div>

              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
                Analisi in corso...
              </h3>

              <div className="space-y-2">
                <LoadingMessage message="Valutazione esperienza..." delay={0} />
                <LoadingMessage message="Calcolo percorso ottimale..." delay={1.5} />
                <LoadingMessage message="Generazione profilo di rischio..." delay={3} />
                <LoadingMessage message="Preparazione dashboard..." delay={4.5} />
              </div>

              <div className="mt-12 w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="p-8 md:p-12 border-b border-white/5">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl">
              <Icon className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">{currentStepData.title}</h2>
              <p className="text-slate-500 font-medium text-sm">{currentStepData.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white"
            >
              Salta
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-600">Configurazione Profilo</span>
              <span className="text-emerald-500">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 md:p-12 border-t border-white/5 flex items-center justify-between bg-slate-950/30">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="h-16 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-0"
          >
            <ArrowLeft className="w-4 h-4 mr-3" />
            Indietro
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepComplete() || analyzing}
            className="h-16 px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:grayscale"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Analisi AI...
              </>
            ) : currentStep === totalSteps - 1 ? (
              <>
                Inizia Ora
                <Sparkles className="w-5 h-5 ml-3" />
              </>
            ) : (
              <>
                Avanti
                <ArrowRight className="w-5 h-5 ml-3" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}