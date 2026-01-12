import { View } from '../App';
import { Navigation } from './Navigation';
import { ExchangeConnections } from './ExchangeConnections';
import { ExchangeLogo } from './ExchangeLogos';
import { motion } from 'motion/react';
import { Link as LinkIcon, Shield, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { Card } from './ui/card';

interface ExchangeViewProps {
  onNavigate: (view: View) => void;
  mascotVisible: boolean;
  onMascotToggle: () => void;
}

export function ExchangeView({ onNavigate, mascotVisible, onMascotToggle }: ExchangeViewProps) {
  return (
    <div className="min-h-screen md:pl-20 pb-24 md:pb-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative">
      
      {/* Subtle grid background */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Gradient orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      <Navigation 
        onNavigate={onNavigate} 
        currentView="exchange"
        mascotVisible={mascotVisible}
        onMascotToggle={onMascotToggle}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <LinkIcon className="w-8 h-8 text-white drop-shadow-sm" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Exchange Connectors
                </h1>
                <motion.div
                  animate={{ 
                    rotate: [0, 14, -14, 14, 0],
                    scale: [1, 1.1, 1.1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </motion.div>
              </div>
              <p className="text-gray-400 mt-1">
                Collega i tuoi exchange e importa automaticamente i trade della tua Wheel Strategy
              </p>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Sicurezza Garantita</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Le tue API keys sono crittografate e utilizzate solo in read-only
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Sync Automatico</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      I tuoi trade vengono sincronizzati automaticamente ogni giorno
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -4 }}
            >
              <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Analytics Avanzati</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Traccia performance, premium incassati e metriche della Wheel Strategy
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.header>

        {/* Main Exchange Connections Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ExchangeConnections />
        </motion.div>

        {/* Security Best Practices */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-500/20">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  Come configurare le API Keys in modo sicuro
                  <Shield className="w-5 h-5 text-amber-400" />
                </h3>
                <ul className="space-y-2.5 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg">✓</span>
                    <span>
                      <strong className="text-white">Permessi read-only:</strong> Assicurati di creare API keys con SOLO permessi di lettura (no trading, no withdrawal)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg">✓</span>
                    <span>
                      <strong className="text-white">IP Whitelist:</strong> Se possibile, limita le API keys a specifici indirizzi IP
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg">✓</span>
                    <span>
                      <strong className="text-white">2FA abilitato:</strong> Mantieni sempre attiva l'autenticazione a due fattori sul tuo account exchange
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1 text-lg">✓</span>
                    <span>
                      <strong className="text-white">Revoca immediata:</strong> Se sospetti un accesso non autorizzato, revoca immediatamente le API keys dall'exchange
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Supported Exchanges Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-500 mb-4 text-sm uppercase tracking-wider">
            Exchange supportati
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Binance', 'Bybit', 'Kucoin', 'BingX', 'OKX', 'Bitget'].map((exchange, i) => (
              <motion.span
                key={exchange}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all"
              >
                {exchange}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30 text-purple-300 text-sm font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
            >
              Deribit <span className="text-xs ml-1">⚡ Opzioni</span>
            </motion.span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}