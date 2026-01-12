import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion, useInView } from 'motion/react';
import { 
  Rocket, 
  TrendingUp, 
  Brain, 
  Trophy, 
  Zap, 
  Shield, 
  Users, 
  Target,
  ChevronRight,
  Star,
  CheckCircle2,
  Play,
  Sparkles,
  BarChart3,
  BookOpen,
  Award,
  Globe,
  ArrowRight,
  Bitcoin,
  Flame,
  Lock,
  Unlock
} from 'lucide-react';
import type { View } from '../App';

// Prof Satoshi mascot images - NEW professional 3D renders
import profSatoshiExcited from 'figma:asset/ab3d59171ab68c537dd57d97d7e9d4de0a06850d.png'; // Jumping with confetti
import profSatoshiNormal from 'figma:asset/f29b56f4742151c06a28cc25bd25d8102cbe4d79.png'; // Double thumbs up
import profSatoshiConfident from 'figma:asset/7d386e671a6e8284b17426eaf3e9958b6a264ae0.png'; // Hands on hips

// btcwheel logo - NEW circular emerald design (transparent)
import btcwheelLogoPng from 'figma:asset/b2ebfbbeb483ffdf078e6ecdca686b1e139921dc.png';

// For backward compatibility with existing code
const mascotExcitedImage = profSatoshiExcited;
const mascotNormalImage = profSatoshiNormal;
const btcwheelLogo = btcwheelLogoPng;

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

// Animated Counter Component
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
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// Floating Orb Component
function FloatingOrb({ delay = 0, color }: { delay?: number; color: string }) {
  return (
    <motion.div
      className={`absolute w-32 h-32 rounded-full blur-3xl ${color} opacity-20`}
      animate={{
        x: [0, 100, 0],
        y: [0, -100, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Parallax removed - hero content stays visible while scrolling

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI Tutor Personalizzato',
      description: 'Prof Satoshi, la tua mascotte AI, ti guida con consigli personalizzati basati sul tuo livello e stile di apprendimento.',
      gradient: 'from-purple-500 to-blue-500',
      glowColor: 'shadow-purple-500/50',
      stats: 'GPT-4o powered'
    },
    {
      icon: Target,
      title: 'Missioni Guidate',
      description: 'Impara attraverso missioni progressive che ti portano da principiante a master trader della Wheel Strategy.',
      gradient: 'from-blue-500 to-cyan-500',
      glowColor: 'shadow-blue-500/50',
      stats: '5 livelli progressivi'
    },
    {
      icon: BarChart3,
      title: 'Paper Trading Reale',
      description: 'Simula trades con prezzi Bitcoin live senza rischiare capitale. Guadagna XP e sblocca strategie avanzate.',
      gradient: 'from-orange-500 to-pink-500',
      glowColor: 'shadow-orange-500/50',
      stats: 'Dati market live'
    },
    {
      icon: Trophy,
      title: 'Gamification Completa',
      description: 'Sistema XP, badge, streak giornalieri e leaderboard globale. Competi con altri trader e sali di livello.',
      gradient: 'from-green-500 to-teal-500',
      glowColor: 'shadow-green-500/50',
      stats: '20+ badge unici'
    },
    {
      icon: BookOpen,
      title: 'Lezioni Interattive',
      description: 'Quiz, flashcard e contenuti progressivi dal basic all\'avanzato. Ogni lezione ti porta più vicino alla maestria.',
      gradient: 'from-pink-500 to-purple-500',
      glowColor: 'shadow-pink-500/50',
      stats: '15+ lezioni'
    },
    {
      icon: Users,
      title: 'Community Globale',
      description: 'Unisciti a migliaia di trader. Condividi strategie, confronta performance e impara dai migliori.',
      gradient: 'from-indigo-500 to-purple-500',
      glowColor: 'shadow-indigo-500/50',
      stats: 'Leaderboard live'
    }
  ];

  const stats = [
    { value: 10000, label: 'Studenti Attivi', icon: Users, suffix: '+' },
    { value: 95, label: 'Success Rate', icon: TrendingUp, suffix: '%' },
    { value: 4.9, label: 'Rating Medio', icon: Star, suffix: '/5', decimals: true },
    { value: 500000, label: 'Missioni Completate', icon: Target, suffix: '+' }
  ];

  const testimonials = [
    {
      name: 'Marco R.',
      role: 'Beginner Trader',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
      content: 'In 2 settimane ho capito la Wheel Strategy meglio di quanto avessi fatto in 6 mesi di video YouTube. Le missioni sono geniali!',
      rating: 5
    },
    {
      name: 'Giulia T.',
      role: 'Intermediate Investor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Giulia',
      content: 'Il paper trading mi ha permesso di fare pratica senza stress. Ora gestisco le opzioni Bitcoin con sicurezza nel mondo reale.',
      rating: 5
    },
    {
      name: 'Luca M.',
      role: 'Advanced Trader',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luca',
      content: 'Prof Satoshi è come avere un mentor personale 24/7. I suoi consigli sono sempre spot-on e mi hanno fatto evitare errori costosi.',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfetto per iniziare',
      features: [
        'Accesso a tutte le lezioni base',
        '3 missioni guidate',
        'Paper trading limitato',
        'Leaderboard locale',
        'Prof Satoshi con limiti'
      ],
      cta: 'Inizia Gratis',
      popular: false
    },
    {
      name: 'Pro',
      price: '9.99',
      period: '/mese',
      description: 'Il più popolare',
      features: [
        'Tutte le lezioni + contenuti premium',
        'Tutte le 15+ missioni',
        'Paper trading illimitato',
        'Leaderboard globale',
        'Prof Satoshi AI illimitato',
        'Analytics avanzati',
        'Supporto prioritario'
      ],
      cta: 'Diventa Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Per team e organizzazioni',
      features: [
        'Tutto di Pro +',
        'Dashboard team',
        'Report personalizzati',
        'API access',
        'Onboarding dedicato',
        'SLA garantito'
      ],
      cta: 'Contattaci',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="w-10 h-10 relative"
                animate={{ 
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <img 
                  src={btcwheelLogo} 
                  alt="btcwheel Logo" 
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(52, 211, 153, 0.4))' }}
                />
              </motion.div>
              <span className="text-white font-bold text-xl">btcwheel</span>
            </motion.div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Funzionalità</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Prezzi</a>
              <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonianze</a>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('auth')}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                Accedi
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/50"
                onClick={() => onNavigate('onboarding')}
              >
                Inizia Gratis
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden" ref={heroRef}>
        {/* Animated Background with Orbs */}
        <div className="absolute inset-0">
          <FloatingOrb delay={0} color="bg-blue-600" />
          <FloatingOrb delay={2} color="bg-purple-600" />
          <FloatingOrb delay={4} color="bg-orange-600" />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              transform: `perspective(500px) rotateX(60deg) translateZ(-100px)`,
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950/90 to-gray-950" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Nuovo: AI Tutor con GPT-4o
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Impara la Bitcoin Wheel Strategy con il
                <motion.span 
                  className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                >
                  Metodo Più Efficace
                </motion.span>
                al Mondo
              </motion.h1>
              
              <motion.p 
                className="text-gray-400 mb-8 text-xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Da zero a master trader in 30 giorni. Impara con missioni guidate, AI tutor personalizzato e paper trading sicuro. 
                <span className="text-white font-semibold"> Niente rischi, solo risultati.</span>
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 px-8 shadow-2xl shadow-blue-500/50 text-lg group"
                    onClick={() => onNavigate('onboarding')}
                  >
                    <Rocket className="w-5 h-5 mr-2 group-hover:translate-y-[-4px] transition-transform" />
                    Inizia il Percorso Gratis
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 border-2 border-gray-300 bg-gray-900/50 backdrop-blur hover:bg-gray-800 hover:border-white text-white text-lg group"
                    onClick={() => {
                      const video = document.getElementById('demo-video');
                      if (video) video.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Guarda Demo
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex items-center gap-6 flex-wrap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  { icon: Lock, text: 'Nessuna carta richiesta' },
                  { icon: Shield, text: '100% sicuro' },
                  { icon: Users, text: '10K+ studenti' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-gray-400">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Prof Satoshi Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                {/* Giant Prof Satoshi Mascot */}
                <motion.div
                  className="relative z-20 mb-8"
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, -3, 3, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.div
                    className="relative w-64 h-64 md:w-80 md:h-80 mx-auto"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -10, 10, 0]
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Glow rings */}
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-blue-500 opacity-20"
                      animate={{ 
                        scale: [1, 1.3, 1], 
                        opacity: [0.2, 0, 0.2] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-purple-500 opacity-20"
                      animate={{ 
                        scale: [1, 1.5, 1], 
                        opacity: [0.2, 0, 0.2] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    />
                    
                    {/* Prof Satoshi Image */}
                    <img 
                      src={mascotExcitedImage} 
                      alt="Prof Satoshi - Your AI Trading Tutor" 
                      className="w-full h-full object-contain relative z-10"
                      style={{ 
                        filter: 'drop-shadow(0 20px 40px rgba(59, 130, 246, 0.6))' 
                      }}
                    />
                    
                    {/* Sparkle particles */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                        style={{
                          top: `${20 + Math.random() * 60}%`,
                          left: `${20 + Math.random() * 60}%`,
                        }}
                        animate={{
                          scale: [0, 1.5, 0],
                          opacity: [0, 1, 0],
                          y: [0, -30],
                          x: [0, (Math.random() - 0.5) * 20]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </motion.div>
                  
                  {/* Speech bubble */}
                  <motion.div
                    className="absolute top-0 -left-4 md:-left-12 bg-white rounded-2xl px-4 py-3 shadow-2xl border-2 border-blue-500"
                    initial={{ opacity: 0, scale: 0, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: 1, type: "spring", bounce: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <p className="text-sm font-semibold text-gray-900">
                        Ciao! Sono Prof Satoshi! 🎓
                      </p>
                    </div>
                    {/* Speech bubble tail */}
                    <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-r-2 border-b-2 border-blue-500 rotate-45" />
                  </motion.div>
                </motion.div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-50 animate-pulse" />
                
                {/* Main Card */}
                <motion.div
                  className="relative z-10"
                  animate={{ 
                    rotateY: [0, 5, 0, -5, 0],
                    rotateX: [0, 2, 0, -2, 0]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: 1000,
                  }}
                >
                  <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl border-2 border-gray-700 shadow-2xl rounded-3xl">
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div 
                        className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Trophy className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-gray-400">Il Tuo Progresso</p>
                        <p className="text-white font-bold text-lg">Level 12 - Master Trader</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">XP Progress</span>
                          <span className="text-white font-semibold">7,850 / 10,000</span>
                        </div>
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600"
                            initial={{ width: 0 }}
                            animate={{ width: '78.5%' }}
                            transition={{ duration: 2, delay: 0.5 }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: '12', label: 'Missioni', color: 'blue' },
                          { value: '8', label: 'Badge', color: 'purple' },
                          { value: '45', label: 'Streak', color: 'orange' }
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            className={`bg-${stat.color}-500/10 border border-${stat.color}-500/20 p-3 rounded-xl text-center`}
                            whileHover={{ scale: 1.05, y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <p className={`text-${stat.color}-400 font-bold text-xl mb-1`}>{stat.value}</p>
                            <p className="text-gray-200 text-sm font-medium">{stat.label}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Floating Elements with 3D effect */}
                <motion.div
                  className="absolute -top-8 -right-8 z-20"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-green-500/50 flex items-center gap-2 border border-green-400/50">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold text-lg">+200 XP</span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 z-20"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-5 rounded-3xl shadow-2xl shadow-purple-500/50 border border-purple-400/50">
                    <Trophy className="w-10 h-10" />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute top-1/2 -left-12 z-20"
                  animate={{ 
                    x: [0, -10, 0],
                    rotate: [0, -10, 0]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-4 rounded-2xl shadow-2xl shadow-orange-500/50">
                    <Flame className="w-8 h-8" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section with Animated Counters */}
      <section className="py-16 border-y border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-4 border border-blue-500/20"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <stat.icon className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </motion.div>
                <p className="text-4xl font-bold text-white mb-2">
                  {stat.decimals ? (
                    <><AnimatedCounter end={stat.value} />{stat.suffix}</>
                  ) : (
                    <><AnimatedCounter end={stat.value} />{stat.suffix}</>
                  )}
                </p>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Prof Satoshi Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-gray-950 via-blue-950/20 to-gray-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Prof Satoshi Showcase */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 md:order-1"
            >
              <motion.div
                className="relative w-full max-w-md mx-auto"
                animate={{ 
                  y: [0, -15, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full blur-3xl" />
                
                {/* Prof Satoshi */}
                <motion.img 
                  src={mascotExcitedImage} 
                  alt="Prof Satoshi AI Tutor" 
                  className="w-full h-full object-contain relative z-10"
                  style={{ 
                    filter: 'drop-shadow(0 20px 60px rgba(139, 92, 246, 0.6))' 
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Floating AI badges */}
                <motion.div
                  className="absolute top-10 -right-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    delay: 0.5
                  }}
                >
                  <Brain className="w-4 h-4" />
                  <span className="font-semibold text-sm">GPT-4o</span>
                </motion.div>
                
                <motion.div
                  className="absolute bottom-20 -left-4 bg-gradient-to-br from-green-500 to-teal-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
                  animate={{ 
                    y: [0, 10, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    delay: 1
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold text-sm">24/7 Disponibile</span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right - Description */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <Badge className="mb-6 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-2">
                <Brain className="w-4 h-4 mr-2" />
                Incontra Prof Satoshi
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Il Tuo
                <span className="block mt-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI Tutor Personale
                </span>
              </h2>
              
              <div className="space-y-4 text-gray-300 text-lg mb-8">
                <p>
                  <strong className="text-white">Prof Satoshi</strong> è la tua mascotte AI alimentata da GPT-4o che ti accompagna in ogni passo del tuo percorso di apprendimento.
                </p>
                <p>
                  Non è solo un chatbot - è un <strong className="text-white">mentor intelligente</strong> che:
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Target, text: 'Analizza il tuo livello e crea percorsi personalizzati' },
                  { icon: Sparkles, text: 'Ti dà consigli in tempo reale durante le missioni' },
                  { icon: Trophy, text: 'Celebra i tuoi successi e ti motiva nei momenti difficili' },
                  { icon: Brain, text: 'Risponde a qualsiasi domanda sulla Wheel Strategy' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4 group"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-purple-500/20">
                      <item.icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-gray-300 leading-relaxed pt-2">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-8"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-14 px-8 shadow-2xl shadow-purple-500/50 text-lg group"
                  onClick={() => onNavigate('onboarding')}
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Chatta con Prof Satoshi Ora
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with 3D Cards */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Funzionalità
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Tutto ciò che ti serve per
              <span className="block mt-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                padroneggiare la Wheel Strategy
              </span>
            </h2>
            <p className="text-gray-400 text-xl max-w-3xl mx-auto">
              Un ecosistema completo di strumenti educativi, gamification e AI per portarti da principiante a esperto.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: 5,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <Card className={`p-8 h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 transition-all duration-300 ${
                    hoveredFeature === index 
                      ? `border-blue-500/50 shadow-2xl ${feature.glowColor}` 
                      : 'border-gray-700 shadow-lg'
                  }`}>
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 relative`}
                      animate={hoveredFeature === index ? {
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                      {hoveredFeature === index && (
                        <motion.div
                          className="absolute inset-0 bg-white rounded-2xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.2, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                    
                    <Badge className="mb-4 bg-gray-800 text-gray-300 border-0 px-3 py-1">
                      {feature.stats}
                    </Badge>
                    
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                    
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto text-blue-400 hover:text-blue-300 group"
                    >
                      Scopri di più 
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works with Animated Path */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <FloatingOrb delay={1} color="bg-purple-600" />
          <FloatingOrb delay={3} color="bg-blue-600" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-2">
              Come Funziona
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Da zero a master in
              <span className="block mt-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                3 semplici step
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Lines for Desktop */}
            <div className="hidden md:block absolute top-1/4 left-0 right-0 h-1">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-30"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5 }}
              />
            </div>

            {[
              {
                step: '1',
                title: 'Onboarding AI',
                description: 'Rispondi a 5 domande e lascia che l\'AI crei un percorso personalizzato basato sul tuo livello e obiettivi.',
                icon: Brain,
                color: 'from-blue-500 to-cyan-500'
              },
              {
                step: '2',
                title: 'Impara & Pratica',
                description: 'Completa missioni guidate, lezioni interattive e paper trading. Prof Satoshi ti assiste in ogni momento.',
                icon: Target,
                color: 'from-purple-500 to-pink-500'
              },
              {
                step: '3',
                title: 'Diventa Master',
                description: 'Guadagna XP, sblocca badge, scala la leaderboard e applica le tue skills nel mondo reale.',
                icon: Trophy,
                color: 'from-orange-500 to-red-500'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="p-8 text-center h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-gray-600 transition-all">
                    <motion.div 
                      className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 relative`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <step.icon className="w-12 h-12 text-white" />
                      <motion.div
                        className="absolute inset-0 rounded-3xl"
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(59, 130, 246, 0.3)',
                            '0 0 40px rgba(147, 51, 234, 0.5)',
                            '0 0 20px rgba(59, 130, 246, 0.3)',
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    
                    <motion.div 
                      className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-2xl border-2 border-gray-700"
                      whileHover={{ scale: 1.2 }}
                    >
                      {step.step}
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-32 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Testimonianze
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Cosa dicono i nostri
              <span className="block mt-2 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                studenti
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="p-8 h-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    
                    <p className="text-gray-300 mb-8 italic leading-relaxed text-lg">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full border-2 border-gray-700"
                      />
                      <div>
                        <p className="text-white font-bold">{testimonial.name}</p>
                        <p className="text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing with Glowing Cards */}
      <section id="pricing" className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2">
              Prezzi
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Scegli il piano
              <span className="block mt-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                perfetto per te
              </span>
            </h2>
            <p className="text-gray-400 text-xl max-w-3xl mx-auto">
              Inizia gratis e passa a Pro quando sei pronto. Nessun impegno, cancella quando vuoi.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative h-full"
                >
                  {plan.popular && (
                    <motion.div 
                      className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-50"
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  
                  <Card className={`p-8 h-full relative ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-0' 
                      : 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700'
                  }`}>
                    {plan.popular && (
                      <motion.div 
                        className="absolute -top-5 left-1/2 transform -translate-x-1/2"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 px-4 py-2 shadow-lg">
                          ⭐ Più Popolare
                        </Badge>
                      </motion.div>
                    )}
                    
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className={plan.popular ? 'text-blue-100' : 'text-gray-400'}>
                        {plan.description}
                      </p>
                    </div>

                    <div className="text-center mb-8">
                      <span className="text-white">
                        {plan.price === 'Custom' ? (
                          <span className="text-4xl font-bold">Custom</span>
                        ) : (
                          <>
                            <span className="text-6xl font-bold">€{plan.price}</span>
                            {plan.period && <span className="text-gray-400 text-xl">{plan.period}</span>}
                          </>
                        )}
                      </span>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <CheckCircle2 className={`w-6 h-6 flex-shrink-0 ${
                            plan.popular ? 'text-white' : 'text-blue-400'
                          }`} />
                          <span className={`${plan.popular ? 'text-white' : 'text-gray-300'} leading-relaxed`}>
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className={`w-full h-14 text-lg font-semibold ${
                          plan.popular 
                            ? 'bg-white text-blue-600 hover:bg-gray-100 shadow-2xl' 
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl'
                        }`}
                        onClick={() => onNavigate('auth')}
                      >
                        {plan.cta}
                      </Button>
                    </motion.div>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA with Particles */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-600" />
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Prof Satoshi waving */}
            <motion.div
              className="relative w-32 h-32 mx-auto mb-8"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Glow rings */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-white/30"
                animate={{ 
                  scale: [1, 1.5, 1], 
                  opacity: [0.3, 0, 0.3] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <img 
                src={mascotExcitedImage} 
                alt="Prof Satoshi ti aspetta!" 
                className="w-full h-full object-contain relative z-10"
                style={{ 
                  filter: 'drop-shadow(0 10px 30px rgba(255, 255, 255, 0.4))' 
                }}
              />
              
              {/* Sparkles around Prof Satoshi */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    y: [0, -20],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Pronto a Diventare un Master Trader?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Unisciti a migliaia di studenti che stanno già padroneggiando la Bitcoin Wheel Strategy. Inizia gratis oggi!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 h-16 px-10 text-lg font-bold shadow-2xl group"
                  onClick={() => onNavigate('onboarding')}
                >
                  <Rocket className="w-6 h-6 mr-2 group-hover:translate-y-[-4px] transition-transform" />
                  Inizia Ora Gratis
                  <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  size="lg"
                  variant="outline"
                  className="h-16 px-10 border-2 border-white bg-white/10 backdrop-blur hover:bg-white/20 text-white text-lg font-bold"
                  onClick={() => onNavigate('auth')}
                >
                  Hai già un account? Accedi
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-10 h-10"
                  animate={{ 
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <img 
                    src={btcwheelLogo} 
                    alt="btcwheel Logo" 
                    className="w-full h-full object-contain"
                    style={{ filter: 'drop-shadow(0 2px 8px rgba(52, 211, 153, 0.4))' }}
                  />
                </motion.div>
                <span className="text-white font-bold text-xl">btcwheel</span>
              </div>
              <p className="text-gray-400">
                Impara la Bitcoin Wheel Strategy con AI tutor personale e simulazioni trading.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Prodotto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Funzionalità</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Prezzi</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonianze</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Risorse</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Guide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legale</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2024 btcwheel. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
