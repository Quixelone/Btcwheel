import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';

import { motion, useInView } from 'motion/react';
import {
  TrendingUp,
  Brain,
  Trophy,
  Target,
  Sparkles,
  BarChart3,
  ArrowRight,
  Bitcoin,
  Play,
  ShieldCheck,
  Users
} from 'lucide-react';
import type { View } from '../App';
import { MASCOT_FALLBACK } from '../lib/mascot-images';

const btcwheelLogo = MASCOT_FALLBACK.logo;
const mascotExcitedImage = MASCOT_FALLBACK.excited;

function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let animationFrame: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI Tutor Personale',
      description: 'Prof Satoshi ti guida con consigli personalizzati basati sul tuo stile di apprendimento.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      stats: 'GPT-4o powered'
    },
    {
      icon: Target,
      title: 'Missioni Guidate',
      description: 'Impara attraverso missioni progressive che ti portano da principiante a master trader.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      stats: '15+ Missioni'
    },
    {
      icon: BarChart3,
      title: 'Paper Trading Live',
      description: 'Simula trades con prezzi Bitcoin reali senza rischiare capitale. Guadagna XP e scala la classifica.',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      stats: 'Dati Real-time'
    },
    {
      icon: Trophy,
      title: 'Gamification',
      description: 'Sistema XP, badge, streak e leaderboard globale. Competi con trader da tutto il mondo.',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      stats: '25+ Badge'
    }
  ];

  return (
    <div className="min-h-screen bg-[#030305] text-white selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#030305]/80 backdrop-blur-xl border-b border-white/[0.05] py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)] group-hover:scale-105 transition-transform">
              <img src={btcwheelLogo} alt="Logo" className="w-6 h-6 invert brightness-0" />
            </div>
            <span className="text-xl font-bold tracking-tight">BTC Wheel Pro</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Funzionalità', 'Metodo', 'Prezzi', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-[#888899] hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => onNavigate('auth')} className="text-xs font-bold uppercase tracking-widest text-[#888899] hover:text-white">
              Accedi
            </Button>
            <Button
              onClick={() => onNavigate('onboarding')}
              className="bg-white text-black hover:bg-gray-200 rounded-xl px-6 h-10 font-bold uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105"
            >
              Inizia Ora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -ml-40 -mb-40 pointer-events-none" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 mb-8 bg-white/[0.05] border border-white/[0.1] px-4 py-2 rounded-full backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-200">
                  Nuova Era del Trading Education
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
                Domina la <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-white">
                  Wheel Strategy
                </span>
              </h1>

              <p className="text-[#888899] text-lg font-medium mb-10 leading-relaxed max-w-xl">
                L'unica accademia interattiva che utilizza l'AI per trasformarti in un trader professionista di opzioni Bitcoin. <span className="text-white">Senza rischi, solo pura competenza.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Button
                  onClick={() => onNavigate('onboarding')}
                  className="h-14 px-8 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold uppercase tracking-wider shadow-[0_0_30px_rgba(147,51,234,0.4)] text-sm group transition-all hover:-translate-y-1"
                >
                  Inizia il Percorso
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  className="h-14 px-8 border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.05] text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all hover:-translate-y-1"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Guarda Demo
                </Button>
              </div>

              <div className="mt-16 flex items-center gap-12 border-t border-white/[0.05] pt-8">
                {[
                  { label: 'Studenti', value: 15000, suffix: '+' },
                  { label: 'Success Rate', value: 94, suffix: '%' },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-3xl font-bold text-white tracking-tight">
                      <AnimatedCounter end={stat.value} />{stat.suffix}
                    </p>
                    <p className="text-[10px] font-bold text-[#666677] uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#030305] bg-gray-800 flex items-center justify-center text-xs font-bold">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-20">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-[80px] animate-pulse" />
                  <img
                    src={mascotExcitedImage}
                    alt="Prof Satoshi"
                    className="w-full max-w-md mx-auto relative z-10 drop-shadow-[0_20px_50px_rgba(147,51,234,0.3)]"
                  />

                  {/* Floating UI Elements */}
                  <motion.div
                    animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 -right-4 bg-[#0A0A0C]/90 backdrop-blur-xl border border-white/[0.1] p-4 rounded-2xl shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-[#666677] uppercase tracking-widest">Profitto</p>
                        <p className="text-lg font-bold text-white">+$2,450</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-20 -left-4 bg-[#0A0A0C]/90 backdrop-blur-xl border border-white/[0.1] p-4 rounded-2xl shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-[#666677] uppercase tracking-widest">Badge</p>
                        <p className="text-lg font-bold text-white">Wheel Master</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 relative z-10 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
              Tutto ciò di cui hai bisogno <br />
              <span className="text-[#666677]">per dominare il mercato</span>
            </h2>
            <p className="text-[#888899] text-lg font-medium max-w-2xl mx-auto">
              Abbiamo creato l'ecosistema definitivo per l'apprendimento del trading di opzioni.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 bg-[#0A0A0C] border border-white/[0.05] rounded-[24px] hover:border-white/[0.15] transition-all group hover:-translate-y-1`}
              >
                <div className={`w-14 h-14 ${feature.bg} ${feature.border} border rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-[#888899] text-sm leading-relaxed mb-6">{feature.description}</p>
                <div className="mt-auto pt-4 border-t border-white/[0.05]">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${feature.color}`}>{feature.stats}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-purple-900/10 blur-[100px]" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="p-12 md:p-20 bg-gradient-to-br from-[#0A0A0C] to-[#050507] border border-white/[0.1] rounded-[40px] text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
              <Bitcoin className="w-64 h-64 text-white" />
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 relative z-10">
              Pronto a cambiare <br />
              <span className="text-purple-500">il tuo futuro?</span>
            </h2>
            <p className="text-[#888899] text-xl font-medium mb-10 max-w-2xl mx-auto relative z-10">
              Unisciti a migliaia di studenti che stanno già dominando la Wheel Strategy con Prof Satoshi.
            </p>

            <Button
              onClick={() => onNavigate('onboarding')}
              className="h-16 px-12 bg-white text-black hover:bg-gray-200 rounded-xl font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)] text-sm transition-all hover:scale-105 relative z-10"
            >
              Inizia Ora Gratis
            </Button>

            <div className="mt-8 flex items-center justify-center gap-2 text-[#666677] text-[10px] font-bold uppercase tracking-widest relative z-10">
              <ShieldCheck className="w-4 h-4" />
              Nessuna carta di credito richiesta • Accesso istantaneo
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.05] bg-[#020203]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/[0.05] rounded-lg flex items-center justify-center border border-white/[0.1]">
                <img src={btcwheelLogo} alt="Logo" className="w-5 h-5 opacity-50" />
              </div>
              <span className="text-sm font-bold text-[#888899] uppercase tracking-widest">BTC Wheel Pro</span>
            </div>

            <div className="flex gap-8">
              {['Privacy', 'Termini', 'Contatti', 'Supporto'].map((item) => (
                <a key={item} href="#" className="text-[10px] font-bold uppercase tracking-widest text-[#666677] hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <p className="text-[10px] font-bold text-[#444455] uppercase tracking-widest">
              © 2026 BTC Wheel Pro.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
