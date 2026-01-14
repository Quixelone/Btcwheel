import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
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
  Loader2
} from 'lucide-react';
import type { UserProfile } from '../lib/openai';
import { useOnboarding } from '../hooks/useOnboarding';

interface OnboardingViewProps {
  onComplete: () => void;
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
    console.log('🔵 handleNext called, currentStep:', currentStep, 'totalSteps:', totalSteps);
    console.log('🔵 isStepComplete:', isStepComplete());
    console.log('🔵 profile:', profile);
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('🔵 Last step reached, calling handleComplete');
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    console.log('🟢 handleComplete called');
    console.log('🟢 Profile to submit:', profile);
    
    try {
      console.log('🟢 Calling completeOnboarding...');
      const result = await completeOnboarding(profile as UserProfile);
      console.log('🟢 completeOnboarding returned:', result);
      
      console.log('🟢 Calling onComplete callback...');
      onComplete();
      console.log('🟢 onComplete callback finished');
    } catch (error) {
      console.error('🔴 Error in handleComplete:', error);
      // Still complete onboarding to not block user
      console.log('🟢 Calling onComplete despite error...');
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
      title: 'Livello Esperienza Crypto',
      icon: Bitcoin,
      content: (
        <RadioGroup 
          value={profile.experienceLevel} 
          onValueChange={(value: any) => updateProfile('experienceLevel', value)}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="beginner" id="exp-beginner" />
              <Label htmlFor="exp-beginner" className="flex-1 cursor-pointer">
                <p className="font-semibold">🌱 Principiante</p>
                <p className="text-sm text-gray-600">Nuovo al mondo crypto, poca o nessuna esperienza</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="intermediate" id="exp-intermediate" />
              <Label htmlFor="exp-intermediate" className="flex-1 cursor-pointer">
                <p className="font-semibold">📈 Intermedio</p>
                <p className="text-sm text-gray-600">Ho già investito in crypto, conosco le basi</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="advanced" id="exp-advanced" />
              <Label htmlFor="exp-advanced" className="flex-1 cursor-pointer">
                <p className="font-semibold">🚀 Avanzato</p>
                <p className="text-sm text-gray-600">Trading attivo, esperto di crypto e mercati</p>
              </Label>
            </div>
          </div>
        </RadioGroup>
      ),
    },
    {
      title: 'Esperienza Trading',
      icon: TrendingUp,
      content: (
        <RadioGroup 
          value={profile.tradingKnowledge} 
          onValueChange={(value: any) => updateProfile('tradingKnowledge', value)}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="none" id="trade-none" />
              <Label htmlFor="trade-none" className="flex-1 cursor-pointer">
                <p className="font-semibold">❌ Nessuna</p>
                <p className="text-sm text-gray-600">Mai fatto trading prima</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="basic" id="trade-basic" />
              <Label htmlFor="trade-basic" className="flex-1 cursor-pointer">
                <p className="font-semibold">📊 Base</p>
                <p className="text-sm text-gray-600">Ho comprato/venduto azioni o crypto spot</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="experienced" id="trade-exp" />
              <Label htmlFor="trade-exp" className="flex-1 cursor-pointer">
                <p className="font-semibold">💼 Esperto</p>
                <p className="text-sm text-gray-600">Trading attivo con analisi tecnica</p>
              </Label>
            </div>
          </div>
        </RadioGroup>
      ),
    },
    {
      title: 'Conoscenza Opzioni',
      icon: GraduationCap,
      content: (
        <RadioGroup 
          value={profile.optionsKnowledge} 
          onValueChange={(value: any) => updateProfile('optionsKnowledge', value)}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="none" id="opt-none" />
              <Label htmlFor="opt-none" className="flex-1 cursor-pointer">
                <p className="font-semibold">❓ Mai sentite</p>
                <p className="text-sm text-gray-600">Non so cosa sono le opzioni</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="basic" id="opt-basic" />
              <Label htmlFor="opt-basic" className="flex-1 cursor-pointer">
                <p className="font-semibold">📖 Teoria</p>
                <p className="text-sm text-gray-600">So cosa sono ma non le ho mai tradiate</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="experienced" id="opt-exp" />
              <Label htmlFor="opt-exp" className="flex-1 cursor-pointer">
                <p className="font-semibold">⚡ Pratico</p>
                <p className="text-sm text-gray-600">Ho già tradato opzioni (stocks/crypto)</p>
              </Label>
            </div>
          </div>
        </RadioGroup>
      ),
    },
    {
      title: 'I Tuoi Obiettivi',
      icon: Target,
      content: (
        <div className="space-y-3">
          {[
            { value: 'learn', label: '🎓 Imparare nuova strategia', desc: 'Acquisire competenze trading opzioni' },
            { value: 'income', label: '💰 Generare reddito passivo', desc: 'Creare flusso di cassa mensile' },
            { value: 'hedge', label: '🛡️ Proteggere portfolio', desc: 'Hedging e gestione rischio' },
            { value: 'curiosity', label: '🔍 Curiosità', desc: 'Esplorare il mondo delle opzioni' },
          ].map((goal) => (
            <div
              key={goal.value}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                profile.goals?.includes(goal.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => toggleArrayValue('goals', goal.value)}
            >
              <Checkbox
                checked={profile.goals?.includes(goal.value)}
                onCheckedChange={() => toggleArrayValue('goals', goal.value)}
              />
              <div className="flex-1">
                <p className="font-semibold">{goal.label}</p>
                <p className="text-sm text-gray-600">{goal.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Tempo Disponibile',
      icon: Clock,
      content: (
        <RadioGroup 
          value={profile.availableTime} 
          onValueChange={(value: any) => updateProfile('availableTime', value)}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="limited" id="time-limited" />
              <Label htmlFor="time-limited" className="flex-1 cursor-pointer">
                <p className="font-semibold">⏱️ Limitato</p>
                <p className="text-sm text-gray-600">10-15 minuti al giorno</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="moderate" id="time-moderate" />
              <Label htmlFor="time-moderate" className="flex-1 cursor-pointer">
                <p className="font-semibold">⏰ Moderato</p>
                <p className="text-sm text-gray-600">30-60 minuti al giorno</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <RadioGroupItem value="plenty" id="time-plenty" />
              <Label htmlFor="time-plenty" className="flex-1 cursor-pointer">
                <p className="font-semibold">🕐 Abbondante</p>
                <p className="text-sm text-gray-600">1-2 ore al giorno o più</p>
              </Label>
            </div>
          </div>
        </RadioGroup>
      ),
    },
    {
      title: 'Capitale & Stile',
      icon: Sparkles,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-gray-900 mb-3">Capitale per Trading</h3>
            <RadioGroup 
              value={profile.capital} 
              onValueChange={(value: any) => updateProfile('capital', value)}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <RadioGroupItem value="learning" id="cap-learning" />
                  <Label htmlFor="cap-learning" className="flex-1 cursor-pointer">
                    Solo apprendimento (simulatore)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <RadioGroupItem value="small" id="cap-small" />
                  <Label htmlFor="cap-small" className="flex-1 cursor-pointer">
                    Piccolo (&lt; $5,000)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <RadioGroupItem value="medium" id="cap-medium" />
                  <Label htmlFor="cap-medium" className="flex-1 cursor-pointer">
                    Medio ($5,000 - $25,000)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <RadioGroupItem value="large" id="cap-large" />
                  <Label htmlFor="cap-large" className="flex-1 cursor-pointer">
                    Grande (&gt; $25,000)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-gray-900 mb-3">Preferenze Apprendimento</h3>
            <div className="space-y-2">
              {[
                { value: 'reading', label: '📖 Leggere testi ed esempi' },
                { value: 'practice', label: '🎮 Pratica con simulatore' },
                { value: 'visual', label: '📊 Grafici e visual' },
                { value: 'interactive', label: '💬 Quiz interattivi' },
              ].map((style) => (
                <div
                  key={style.value}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                    profile.learningStyle?.includes(style.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => toggleArrayValue('learningStyle', style.value)}
                >
                  <Checkbox
                    checked={profile.learningStyle?.includes(style.value)}
                    onCheckedChange={() => toggleArrayValue('learningStyle', style.value)}
                  />
                  <Label className="flex-1 cursor-pointer">{style.label}</Label>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4 safe-area-inset">
      <Card className="w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900">{currentStepData.title}</h2>
              <p className="text-sm text-gray-600">Passo {currentStep + 1} di {totalSteps}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Salta
            </Button>
          </div>
          <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-2" />
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 min-h-[400px]">
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
        <div className="p-6 md:p-8 border-t border-gray-200 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="h-11"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepComplete() || analyzing}
            className="bg-blue-600 hover:bg-blue-700 h-11"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisi AI...
              </>
            ) : currentStep === totalSteps - 1 ? (
              <>
                Inizia il Corso
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Avanti
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}