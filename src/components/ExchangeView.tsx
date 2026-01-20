import { View } from '../App';
import { Navigation } from './Navigation';
import { ExchangeConnections } from './ExchangeConnections';
import { motion } from 'motion/react';
import { Link as LinkIcon, Shield, Zap, TrendingUp, ArrowLeft, Globe, Lock } from 'lucide-react';
import { Card } from './ui/card';

interface ExchangeViewProps {
  onNavigate: (view: View) => void;
  mascotVisible: boolean;
  onMascotToggle: () => void;
}

export function ExchangeView({ onNavigate, mascotVisible, onMascotToggle }: ExchangeViewProps) {
  return (
    <div className="min-h-screen md:pl-24 bg-slate-950 text-white relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none -mr-96 -mt-96" />
      <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[180px] pointer-events-none -ml-96 -mb-96" />

      <Navigation
        onNavigate={onNavigate}
        currentView="exchange"
        mascotVisible={mascotVisible}
        onMascotToggle={onMascotToggle}
      />

      <header className="relative z-30 px-6 py-12 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('home')}
            className="w-16 h-16 bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors shadow-xl"
          >
            <ArrowLeft className="w-8 h-8 text-slate-400" />
          </motion.div>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Exchange Connectors</h1>
              <LinkIcon className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-slate-500 text-lg font-medium mt-1">Collega i tuoi exchange per importare i trade automaticamente</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-950/40 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-2xl shadow-xl">
          <Shield className="w-5 h-5 text-emerald-500" />
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Connessione Criptata AES-256</span>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6 md:px-12 space-y-16 pb-40">
        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-10 bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 shadow-inner">
                <Lock className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Sicurezza Totale</h3>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Le tue API keys sono crittografate e utilizzate solo per la lettura dei dati. Non abbiamo accesso ai prelievi.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-10 bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20 shadow-inner">
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Sync Automatico</h3>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                I tuoi trade vengono sincronizzati automaticamente, permettendoti di monitorare la Wheel Strategy in tempo reale.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-10 bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/20 shadow-inner">
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Analytics Avanzati</h3>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Visualizza statistiche dettagliate sui premi incassati, win rate e performance complessiva della strategia.
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Exchange Connections Component */}
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
              <Globe className="w-8 h-8 text-emerald-500" />
              Seleziona Exchange
            </h2>
          </div>
          <ExchangeConnections />
        </div>

        {/* Security Guide */}
        <Card className="p-12 bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-16 relative z-10">
            <div className="md:w-1/3">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <Shield className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-6">Guida alla Configurazione Sicura</h3>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Segui queste best practices per garantire la massima sicurezza del tuo account exchange durante il collegamento.
              </p>
            </div>

            <div className="md:w-2/3 grid gap-8">
              {[
                { title: 'Permessi Read-Only', desc: 'Crea API keys con SOLO permessi di lettura. Disabilita esplicitamente Trading e Prelievi.' },
                { title: 'IP Whitelisting', desc: 'Se il tuo exchange lo permette, limita l\'accesso alle API keys solo ai nostri indirizzi IP sicuri.' },
                { title: '2FA Obbligatorio', desc: 'Assicurati che l\'autenticazione a due fattori sia attiva sia sul tuo exchange che su BTC Wheel.' },
                { title: 'Revoca Semplice', desc: 'Puoi revocare l\'accesso in qualsiasi momento sia dalla nostra dashboard che dal tuo exchange.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-8 p-8 bg-slate-950/40 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all group shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-500 font-black text-sm border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-black uppercase text-lg mb-2 tracking-tight">{item.title}</h4>
                    <p className="text-slate-400 text-base font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Supported Exchanges Footer */}
        <div className="text-center space-y-10 py-12">
          <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.4em]">Exchange Supportati</p>
          <div className="flex flex-wrap justify-center gap-6">
            {['Binance', 'Bybit', 'Kucoin', 'BingX', 'OKX', 'Bitget'].map((exchange) => (
              <div key={exchange} className="px-10 py-5 bg-slate-950/40 border border-white/10 rounded-2xl text-slate-400 text-sm font-black uppercase tracking-widest hover:text-white hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-default shadow-lg">
                {exchange}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}