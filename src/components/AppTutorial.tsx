import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowRight, X, Check, Sparkles } from 'lucide-react';

interface TutorialStep {
    target?: string; // Opzionale per step introduttivi centrati
    title: string;
    description: string;
    quote?: string; // Frase motivazionale extra
}

interface AppTutorialProps {
    isActive: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

export function AppTutorial({ isActive, onComplete, onSkip }: AppTutorialProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const steps: TutorialStep[] = [
        {
            title: 'Benvenuto nel Team! 🚀',
            description: "Sono Prof Satoshi, e sarò la tua guida in questo viaggio verso la libertà finanziaria. Non ti prometto ricchezza facile, ma ti prometto un metodo matematico e disciplinato. Sei pronto a costruire il tuo futuro?",
            quote: "La disciplina batte il talento, ogni singola volta."
        },
        {
            target: 'nav-home',
            title: 'La Tua Bussola 🧭',
            description: 'Qui monitorerai la crescita del tuo patrimonio. Non guardare il prezzo di oggi, guarda la curva esponenziale dei prossimi 10 anni. Quando avrai dubbi o paura, torna qui per ricordare il tuo obiettivo finale.',
            quote: "L'interesse composto è l'ottava meraviglia del mondo."
        },
        {
            target: 'nav-trading',
            title: 'La Sala Macchine ⚙️',
            description: 'Qui è dove avviene l\'azione. Non serve essere geni, serve costanza. Il tuo compito è semplice: esegui il piano, rispetta il PAC settimanale e lascia che la matematica lavori per te.',
            quote: "Il mercato trasferisce denaro dagli impazienti ai pazienti."
        },
        {
            target: 'nav-satoshi',
            title: 'Intelligence Center 🧠',
            description: 'Non sarai mai solo contro il mercato. Ogni giorno analizzerò milioni di dati per darti i migliori strike price (🟢🟡🔴). Fidati dei dati, non delle tue emozioni.',
            quote: "Pianifica il tuo trade, trada il tuo piano."
        },
        {
            target: 'nav-academy',
            title: 'Palestra della Mente 📚',
            description: 'Il mercato punisce chi improvvisa e premia chi studia. Qui trasformerai l\'incertezza in competenza assoluta. Ogni lezione completata è un mattone in più per la tua fortezza finanziaria.',
            quote: "L'investimento in conoscenza paga il miglior interesse."
        },
        {
            target: 'nav-profile',
            title: 'La Tua Identità 👤',
            description: 'Definisci chi sei e dove vuoi arrivare. Monitora i tuoi progressi, i tuoi badge e il tuo livello di rischio. Ricorda: ciò che si misura, migliora.',
            quote: "Diventa la versione migliore del tuo futuro io."
        }
    ];

    // Aggiorna la posizione del target quando cambia lo step
    useEffect(() => {
        if (!isActive) return;

        const updatePosition = () => {
            const step = steps[currentStep];

            if (!step.target) {
                setTargetRect(null);
                return;
            }

            // Try desktop ID first, then mobile ID
            let element = document.getElementById(step.target);
            if (!element) {
                element = document.getElementById(step.target.replace('nav-', 'nav-mobile-'));
            }

            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
            } else {
                setTargetRect(null);
            }
        };

        // Piccolo delay per permettere al rendering di completarsi
        const timer = setTimeout(updatePosition, 100);
        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
        };
    }, [currentStep, isActive]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    if (!isActive) return null;

    const step = steps[currentStep];
    const isIntro = !step.target;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] overflow-hidden"
            >
                {/* 
            MIGLIORAMENTO VISIVO:
            Invece di un overlay piatto, usiamo un mask composito o un gradiente radiale 
            per creare un effetto "faro nella nebbia" più morbido.
        */}

                {targetRect ? (
                    // Overlay con "buco" sfumato (simulato con radial-gradient)
                    <div
                        className="absolute inset-0 transition-all duration-500 ease-in-out"
                        style={{
                            background: `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height)}px, rgba(2, 6, 23, 0.85) ${Math.max(targetRect.width, targetRect.height) * 4}px)`
                        }}
                    />
                ) : (
                    // Overlay uniforme per intro
                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm transition-all duration-500" />
                )}

                {/* Spotlight Ring Animato */}
                {targetRect && (
                    <motion.div
                        className="absolute rounded-xl pointer-events-none"
                        style={{
                            top: targetRect.top - 12,
                            left: targetRect.left - 12,
                            width: targetRect.width + 24,
                            height: targetRect.height + 24,
                        }}
                        initial={false}
                        animate={{
                            top: targetRect.top - 12,
                            left: targetRect.left - 12,
                            width: targetRect.width + 24,
                            height: targetRect.height + 24,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Anello pulsante */}
                        <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-xl animate-pulse" />
                        <div className="absolute inset-0 border border-emerald-500/20 rounded-xl blur-sm" />

                        {/* Particelle decorative */}
                        <motion.div
                            className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.div>
                )}

                {/* Tutorial Card */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.4, type: "spring" }}
                        className="pointer-events-auto w-full max-w-lg p-6"
                        style={{
                            position: 'absolute',
                            ...(targetRect ? {
                                // Posizionamento intelligente: se c'è spazio sopra, vai sopra, altrimenti sotto
                                top: targetRect.top > 300
                                    ? targetRect.top - 280 // Sopra
                                    : targetRect.bottom + 40, // Sotto
                                left: '50%',
                                transform: 'translateX(-50%)'
                            } : {
                                // Centro schermo per intro
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            })
                        }}
                    >
                        <Card className="bg-[#0A0A0C] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-0 rounded-[2rem] relative overflow-hidden group">
                            {/* Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-blue-900/20 opacity-50" />

                            {/* Content Container */}
                            <div className="relative z-10 p-8">
                                <div className="flex gap-6">
                                    {/* Avatar Prof Satoshi */}
                                    <div className="flex-shrink-0">
                                        <motion.div
                                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 p-1 relative"
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <img
                                                src={isIntro ? "/mascot-excited.png" : "/mascot-normal.png"}
                                                alt="Prof Satoshi"
                                                className="w-full h-full object-contain drop-shadow-xl"
                                            />
                                            {/* Status Dot */}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0A0A0C] rounded-full animate-pulse" />
                                        </motion.div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">
                                                {step.title}
                                            </h3>
                                            <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                                                {currentStep + 1}/{steps.length}
                                            </span>
                                        </div>

                                        <p className="text-slate-300 text-sm leading-relaxed mb-4 font-medium">
                                            {step.description}
                                        </p>

                                        {step.quote && (
                                            <div className="mb-6 p-3 bg-white/5 rounded-xl border-l-2 border-emerald-500">
                                                <p className="text-xs text-emerald-200/80 italic font-medium">
                                                    "{step.quote}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={onSkip}
                                                className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-wider hover:bg-white/5"
                                            >
                                                Salta
                                            </Button>
                                            <Button
                                                onClick={handleNext}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/20 px-6"
                                            >
                                                {currentStep === steps.length - 1 ? (
                                                    <>
                                                        Iniziamo <Sparkles className="w-4 h-4 ml-2" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Avanti <ArrowRight className="w-4 h-4 ml-2" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
