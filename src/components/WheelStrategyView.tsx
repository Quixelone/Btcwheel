import { useState, useEffect, useRef } from 'react';
import type { View } from '../App';
import { Navigation } from './Navigation';
import { UserMenu } from './UserMenu';
import { ArrowLeft, TrendingUp, Target, DollarSign, Activity, Plus, X, RefreshCw, Loader, AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { PlanVsReal } from './PlanVsReal';
import { toast } from "sonner";

interface WheelStrategyViewProps {
  onNavigate: (view: View) => void;
  onMascotToggle?: () => void;
  mascotVisible?: boolean;
}

interface Trade {
  id: string;
  date: string;
  type: 'put' | 'call';
  action: 'sell' | 'buy' | 'assigned' | 'expired';
  strike: number;
  premium: number;
  quantity: number;
  ticker: string;
  expiry: string;
  pnl: number;
  status: 'open' | 'closed';
  capital: number; // Capitale impegnato nel trade
}

interface Strategy {
  id: string;
  name: string;
  ticker: string;
  total_capital: number;
  created_at: string;
  // Parametri piano target
  plan_duration_months?: number; // Durata del piano in mesi (es. 12)
  target_monthly_return?: number; // ROI mensile target % (es. 5)
  // Piano strategia (parametri obiettivo)
  plan?: {
    // Campi legacy compatibili con LongTermSimulator
    duration_months?: number;
    target_monthly_return?: number;
    // Parametri avanzati del piano
    targetPremiumPercent?: number; // % premio target per trade
    tradesPerMonth?: number; // numero trade pianificati al mese
    targetMonthlyReturn?: number; // % ritorno mensile target
    riskPerTrade?: number; // % capitale a rischio per trade
    strategy?: 'wheel' | 'covered-call' | 'cash-secured-put'; // tipo strategia
  };
  // Campi opzionali per compatibilità futura
  targetMonthlyReturn?: number;
  
  // 📊 Costo Medio BTC fields
  total_btc_accumulated?: number;
  total_btc_cost_basis?: number;
  average_btc_price?: number;
}

interface Stats {
  totalPnL: number;
  activeTrades: number;
  closedTrades: number;
  totalTrades: number;
  winRate: number;
  totalPremiumCollected: number;
  returnOnCapital: number;
  winningTrades: number;
  losingTrades: number;
  initialCapital: number;
  currentCapital: number;
}

// 🎨 Wheel Strategy Dashboard - Modern Emerald/Orange Design v2.0
export function WheelStrategyView({ onNavigate }: WheelStrategyViewProps) {
  // Initialize refs FIRST before any logging
  const hasAutoSelectedRef = useRef(false); // Use ref instead of state to persist across re-mounts
  const isLoadingRef = useRef(false); // Prevent concurrent loads
  
  console.log('[WheelStrategyView] 🔄 Component rendering...');
  console.log('[WheelStrategyView] 📊 Refs state:', {
    hasAutoSelected: hasAutoSelectedRef.current,
    isLoading: isLoadingRef.current
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isCloudMode, setIsCloudMode] = useState(false); // Track if using cloud or local
  
  // Strategy state
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [showCreateStrategy, setShowCreateStrategy] = useState(false);
  const [strategyForm, setStrategyForm] = useState({
    name: '',
    ticker: 'BTC',
    totalCapital: '',
    planDurationMonths: '12', // Durata piano in mesi
    targetMonthlyReturn: '5', // ROI mensile target %
  });
  
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [reinvestMode, setReinvestMode] = useState(false); // Modalità reinvestimento
  
  // Form state
  const [formData, setFormData] = useState({
    ticker: 'BTC',
    type: 'put' as 'put' | 'call',
    action: 'sell' as Trade['action'],
    strike: '',
    premium: '', // Sempre in valore (BTC o USDT)
    quantity: '1',
    expiry: '',
    capital: '', // Capitale impegnato (BTC per call, USDT per put)
  });

  // Calcolo automatico della percentuale
  const calculatePercentage = () => {
    const capital = parseFloat(formData.capital);
    const premium = parseFloat(formData.premium);
    
    if (!capital || !premium || isNaN(capital) || isNaN(premium)) return null;
    
    return ((premium / capital) * 100).toFixed(2);
  };

  const premiumPercentage = calculatePercentage();

  // Etichette dinamiche in base al tipo di opzione
  const capitalLabel = formData.type === 'call' ? 'Capitale (BTC)' : 'Capitale (USDT)';
  const premiumLabel = formData.type === 'call' ? 'Premio (BTC)' : 'Premio (USDT)';
  const premiumSymbol = formData.type === 'call' ? '₿' : '$';
  const capitalPlaceholder = formData.type === 'call' ? '1.0' : '50000';
  const premiumPlaceholder = formData.type === 'call' ? '0.02' : '500';

  // Calcolo capitale composto dall'ultimo trade chiuso
  const getCompoundedCapital = () => {
    if (trades.length === 0) return null;
    
    // Trova l'ultimo trade chiuso dello stesso tipo
    const lastClosedTrade = trades.find(t => t.status === 'closed' && t.type === formData.type);
    if (!lastClosedTrade) return null;
    
    // Ora abbiamo il capitale salvato!
    const totalPremium = lastClosedTrade.premium * lastClosedTrade.quantity;
    const originalCapital = lastClosedTrade.capital;
    
    return (originalCapital + totalPremium).toFixed(formData.type === 'call' ? 4 : 2);
  };

  const compoundedCapital = getCompoundedCapital();

  // 🔐 AUTH & DATA LOADING
  useEffect(() => {
    console.log('🔄 [WheelStrategy] Initial mount - loading data...');
    loadUserAndData();
  }, []);
  
  // 🔄 RELOAD DATA when component becomes visible (handles navigation back from LongTermSimulator)
  useEffect(() => {
    const handleStrategiesUpdated = () => {
      console.log('🔄 [WheelStrategy] Strategies updated event - reloading data...');
      // Reset auto-select flag to allow re-selection after update
      hasAutoSelectedRef.current = false;
      loadUserAndData();
    };
    
    // Listen ONLY for custom event from LongTermSimulator
    // REMOVED: focus event listener (was causing infinite loops)
    window.addEventListener('btcwheel-strategies-updated', handleStrategiesUpdated);
    
    return () => {
      window.removeEventListener('btcwheel-strategies-updated', handleStrategiesUpdated);
    };
  }, []); // Keep empty dependency array - we only want to set up listeners once
  
  // Test connection and reload session
  const testAndReloadConnection = async () => {
    try {
      toast.loading('Controllo connessione...', { id: 'test-connection' });
      
      console.log('🔍 [WheelStrategy] Testing connection...');
      console.log('🔍 [WheelStrategy] Supabase URL:', `https://${projectId}.supabase.co`);
      console.log('🔍 [WheelStrategy] Supabase configured:', isSupabaseConfigured);
      
      if (!isSupabaseConfigured) {
        toast.error('Supabase non configurato!', { id: 'test-connection' });
        return;
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ [WheelStrategy] Connection test failed:', error);
        toast.error(`Errore: ${error.message}`, { id: 'test-connection' });
        return;
      }
      
      if (!session) {
        console.log('⚠️ [WheelStrategy] No session - need to login');
        toast.error('Nessuna sessione attiva - Effettua il login', { id: 'test-connection' });
        return;
      }
      
      console.log('✅ [WheelStrategy] Connection test successful!');
      toast.success(`Connesso come ${session.user.email}`, { id: 'test-connection' });
      
      // Reload data
      await loadUserAndData();
      
    } catch (error) {
      console.error('❌ [WheelStrategy] Connection test error:', error);
      toast.error('Errore nel test di connessione', { id: 'test-connection' });
    }
  };

  // Load user session and fetch strategies
  const loadUserAndData = async () => {
    // Prevent concurrent loads
    if (isLoadingRef.current) {
      console.log('⚠️ [WheelStrategy] Already loading data, skipping...');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      
      console.log('🔍 [WheelStrategy] Loading user and data...');
      console.log('🔍 [WheelStrategy] Supabase configured:', isSupabaseConfigured);
      
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        console.log('📦 [WheelStrategy] Modalità locale attiva - usando localStorage');
        // Use local mode with localStorage
        loadLocalData();
        setLoading(false);
        return;
      }
      
      // Get current session
      console.log('☁️ [WheelStrategy] Checking session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ [WheelStrategy] Session error:', error);
      }
      
      if (error || !session) {
        console.log('⚠️ [WheelStrategy] Nessuna sessione attiva - usando modalità locale con localStorage');
        console.log('❌ [WheelStrategy] I dati NON verranno salvati nel database cloud!');
        setIsCloudMode(false); // Set local mode
        // Fallback to local mode
        loadLocalData();
        setLoading(false);
        return;
      }
      
      console.log('✅ [WheelStrategy] Session found! User:', session.user.email);
      console.log('🔑 [WheelStrategy] User ID:', session.user.id);
      
      setUserId(session.user.id);
      setAccessToken(session.access_token);
      setIsCloudMode(true); // Set cloud mode
      
      console.log('✅ [WheelStrategy] Modalità CLOUD attiva - usando database Supabase');
      
      // Fetch strategies for this user
      await fetchStrategies(session.access_token);
      
    } catch (error) {
      console.error('❌ [WheelStrategy] Error loading user data:', error);
      // Fallback to local mode on error
      loadLocalData();
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Load data from localStorage (local mode)
  const loadLocalData = () => {
    try {
      const localStrategies = localStorage.getItem('btcwheel_strategies');
      if (localStrategies) {
        const parsed = JSON.parse(localStrategies);
        setStrategies(parsed);
        
        console.log(`📦 [WheelStrategy] Loaded ${parsed.length} local strategies`);
        console.log('🔍 [WheelStrategy] hasAutoSelectedRef.current:', hasAutoSelectedRef.current);
        
        // Auto-select previously selected strategy or first one (solo la prima volta)
        if (parsed.length > 0 && !hasAutoSelectedRef.current) {
          const savedStrategyId = localStorage.getItem('btcwheel_selected_strategy_id_local');
          console.log('🔍 Saved local strategy ID:', savedStrategyId);
          console.log('📋 Available local strategies:', parsed.map((s: Strategy) => ({ id: s.id, name: s.name })));
          
          const strategyToSelect = savedStrategyId 
            ? parsed.find((s: Strategy) => s.id === savedStrategyId) || parsed[0]
            : parsed[0];
          
          console.log('✅ Auto-selecting local strategy:', strategyToSelect.name, strategyToSelect.id);
          selectLocalStrategy(strategyToSelect);
          hasAutoSelectedRef.current = true;
        } else if (parsed.length > 0 && hasAutoSelectedRef.current) {
          console.log('⚠️ [loadLocalData] Strategies exist but hasAutoSelectedRef is true - this means we already selected');
          console.log('⚠️ [loadLocalData] Current selectedStrategy:', selectedStrategy?.name || 'NULL');
          
          // If we have strategies but no selected strategy, force select the first one
          if (!selectedStrategy) {
            console.log('🔧 [loadLocalData] FIXING: No selected strategy despite having strategies! Force selecting first...');
            selectLocalStrategy(parsed[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  // Select a local strategy (from localStorage)
  const selectLocalStrategy = (strategy: Strategy) => {
    console.log('🎯 [selectLocalStrategy] Selecting LOCAL strategy:', {
      name: strategy.name,
      id: strategy.id,
      ticker: strategy.ticker
    });
    
    setSelectedStrategy(strategy);
    
    console.log('✅ [selectLocalStrategy] Strategy set in state');
    
    // Persist selected strategy ID
    localStorage.setItem('btcwheel_selected_strategy_id_local', strategy.id);
    
    setFormData(prev => ({ ...prev, ticker: strategy.ticker }));
    
    // Load trades for this strategy
    const localTrades = localStorage.getItem(`btcwheel_trades_${strategy.id}`);
    const parsedTrades: Trade[] = localTrades ? JSON.parse(localTrades) : [];
    setTrades(parsedTrades);
    
    // Calculate stats immediately with the current strategy object
    if (parsedTrades.length === 0) {
      setStats(null);
      return;
    }
    
    const activeTrades = parsedTrades.filter(t => t.status === 'open').length;
    const closedTrades = parsedTrades.filter(t => t.status === 'closed');
    const totalPnL = parsedTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalPremiumCollected = closedTrades.reduce((sum, t) => sum + (t.premium * t.quantity), 0);
    const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
    const losingTrades = closedTrades.filter(t => t.pnl < 0).length;
    const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;
    const returnOnCapital = strategy.total_capital > 0 ? (totalPnL / strategy.total_capital) * 100 : 0;
    
    setStats({
      totalPnL,
      activeTrades,
      closedTrades: closedTrades.length,
      totalTrades: parsedTrades.length,
      winRate,
      totalPremiumCollected,
      returnOnCapital,
      winningTrades,
      losingTrades,
      initialCapital: strategy.total_capital,
      currentCapital: strategy.total_capital + totalPnL
    });
  };

  // Fetch all strategies for current user
  const fetchStrategies = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/strategies`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch strategies');
      }
      
      const data = await response.json();
      setStrategies(data.strategies || []);
      
      console.log(`☁️ [WheelStrategy] Loaded ${data.strategies?.length || 0} cloud strategies`);
      console.log('🔍 [WheelStrategy] hasAutoSelectedRef.current:', hasAutoSelectedRef.current);
      
      // Auto-select previously selected strategy or first one if available (solo la prima volta)
      if (data.strategies && data.strategies.length > 0 && !hasAutoSelectedRef.current) {
        const savedStrategyId = localStorage.getItem('btcwheel_selected_strategy_id');
        console.log('🔍 Saved strategy ID:', savedStrategyId);
        console.log('📋 Available strategies:', data.strategies.map((s: Strategy) => ({ id: s.id, name: s.name })));
        
        const strategyToSelect = savedStrategyId 
          ? data.strategies.find((s: Strategy) => s.id === savedStrategyId) || data.strategies[0]
          : data.strategies[0];
        
        console.log('✅ Auto-selecting strategy:', strategyToSelect.name, strategyToSelect.id);
        await selectStrategy(strategyToSelect, token);
        hasAutoSelectedRef.current = true;
      } else if (data.strategies && data.strategies.length > 0 && hasAutoSelectedRef.current) {
        console.log('⚠️ [fetchStrategies] Strategies exist but hasAutoSelectedRef is true');
        console.log('⚠️ [fetchStrategies] Current selectedStrategy:', selectedStrategy?.name || 'NULL');
        
        // If we have strategies but no selected strategy, force select the first one
        if (!selectedStrategy) {
          console.log('🔧 [fetchStrategies] FIXING: No selected strategy! Force selecting first...');
          await selectStrategy(data.strategies[0], token);
        }
      }
      
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  // Select a strategy and load its trades
  const selectStrategy = async (strategy: Strategy, token?: string) => {
    console.log('🎯 [selectStrategy] Selecting CLOUD strategy:', {
      name: strategy.name,
      id: strategy.id,
      ticker: strategy.ticker
    });
    
    const authToken = token || accessToken;
    if (!authToken) {
      console.error('❌ [selectStrategy] No auth token available!');
      return;
    }
    
    setSelectedStrategy(strategy);
    console.log('✅ [selectStrategy] Strategy set in state');
    
    // Persist selected strategy ID
    if (accessToken) {
      localStorage.setItem('btcwheel_selected_strategy_id', strategy.id);
    }
    
    // Update form ticker to match strategy
    setFormData(prev => ({ ...prev, ticker: strategy.ticker }));
    
    // Fetch trades for this strategy
    await fetchTrades(strategy.id, authToken);
    
    // Fetch stats for this strategy
    await fetchStats(strategy.id, authToken);
  };

  // Fetch trades for selected strategy
  const fetchTrades = async (strategyId: string, token?: string) => {
    try {
      const authToken = token || accessToken;
      if (!authToken) return;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/trades/${strategyId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch trades');
      }
      
      const data = await response.json();
      
      // Transform database trades to component format
      const transformedTrades: Trade[] = (data.trades || []).map((t: any) => ({
        id: t.id,
        date: t.created_at.split('T')[0],
        type: t.type,
        action: t.action,
        strike: Number(t.strike),
        premium: Number(t.premium),
        quantity: t.quantity,
        ticker: t.ticker,
        expiry: t.expiry,
        pnl: Number(t.pnl),
        status: t.status,
        capital: Number(t.capital)
      }));
      
      setTrades(transformedTrades);
      
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  // Fetch statistics for selected strategy
  const fetchStats = async (strategyId: string, token?: string) => {
    try {
      const authToken = token || accessToken;
      if (!authToken) return;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/strategies/${strategyId}/stats`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data.stats);
      
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Create new strategy
  const handleCreateStrategy = async () => {
    if (!strategyForm.name || !strategyForm.totalCapital) {
      return;
    }
    
    setSaving(true);
    
    try {
      // LOCAL MODE: Save to localStorage
      if (!accessToken) {
        const newStrategy: Strategy = {
          id: `local-${Date.now()}`,
          name: strategyForm.name,
          ticker: strategyForm.ticker,
          total_capital: parseFloat(strategyForm.totalCapital),
          created_at: new Date().toISOString(),
          plan_duration_months: parseInt(strategyForm.planDurationMonths),
          target_monthly_return: parseFloat(strategyForm.targetMonthlyReturn)
        };
        
        const updatedStrategies = [newStrategy, ...strategies];
        setStrategies(updatedStrategies);
        localStorage.setItem('btcwheel_strategies', JSON.stringify(updatedStrategies));
        
        // Select the new strategy
        selectLocalStrategy(newStrategy);
        
        // Reset form
        setStrategyForm({
          name: '',
          ticker: 'BTC',
          totalCapital: '',
          planDurationMonths: '12',
          targetMonthlyReturn: '5'
        });
        setShowCreateStrategy(false);
        setSaving(false);
        return;
      }
      
      // CLOUD MODE: Save to database
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/strategies`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: strategyForm.name,
            ticker: strategyForm.ticker,
            totalCapital: parseFloat(strategyForm.totalCapital),
            planDurationMonths: parseInt(strategyForm.planDurationMonths),
            targetMonthlyReturn: parseFloat(strategyForm.targetMonthlyReturn)
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to create strategy');
      }
      
      const data = await response.json();
      
      // Add to strategies list
      const newStrategy: Strategy = data.strategy;
      setStrategies([newStrategy, ...strategies]);
      
      // Select the new strategy
      await selectStrategy(newStrategy);
      
      // Reset form
      setStrategyForm({
        name: '',
        ticker: 'BTC',
        totalCapital: '',
        planDurationMonths: '12',
        targetMonthlyReturn: '5'
      });
      setShowCreateStrategy(false);
      
    } catch (error) {
      console.error('Error creating strategy:', error);
      alert('Errore nella creazione della strategia. Riprova.');
    } finally {
      setSaving(false);
    }
  };

  // Funzione per reinvestire il premio dell'ultimo trade
  const handleReinvest = () => {
    if (trades.length === 0) return;
    
    // Prendi l'ultimo trade (il più recente, può essere aperto o chiuso)
    const lastTrade = trades[0];
    const totalPremium = lastTrade.premium * lastTrade.quantity;
    const newCapital = lastTrade.capital + totalPremium;
    
    setFormData({
      ...formData,
      capital: newCapital.toFixed(formData.type === 'call' ? 4 : 2),
      ticker: lastTrade.ticker,
      type: lastTrade.type,
    });
    
    setReinvestMode(true);
  };

  const handleAddTrade = async () => {
    if (!selectedStrategy) {
      alert('Seleziona una strategia prima di aggiungere un trade');
      return;
    }
    
    setSaving(true);
    
    try {
      const newTrade: Trade = {
        id: `${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: formData.type,
        action: formData.action,
        strike: parseFloat(formData.strike),
        premium: parseFloat(formData.premium),
        quantity: parseInt(formData.quantity),
        ticker: formData.ticker,
        expiry: formData.expiry,
        pnl: formData.action === 'sell' 
          ? parseFloat(formData.premium) * parseInt(formData.quantity) 
          : -parseFloat(formData.premium) * parseInt(formData.quantity),
        status: 'open',
        capital: parseFloat(formData.capital)
      };
      
      // LOCAL MODE: Save to localStorage
      if (!accessToken) {
        const updatedTrades = [newTrade, ...trades];
        setTrades(updatedTrades);
        localStorage.setItem(`btcwheel_trades_${selectedStrategy.id}`, JSON.stringify(updatedTrades));
        
        // 📊 AUTO-UPDATE ACCUMULATION (Local)
        if (formData.action === 'assigned') {
          const currentQty = selectedStrategy.total_btc_accumulated || 0;
          const currentCost = selectedStrategy.total_btc_cost_basis || 0;
          
          const tradeQty = parseInt(formData.quantity);
          const tradeStrike = parseFloat(formData.strike);
          
          const newQty = currentQty + tradeQty;
          const newCost = currentCost + (tradeQty * tradeStrike);
          const newAvg = newQty > 0 ? newCost / newQty : 0;
          
          const updatedStrategy = {
            ...selectedStrategy,
            total_btc_accumulated: newQty,
            total_btc_cost_basis: newCost,
            average_btc_price: newAvg
          };
          
          // Update strategy in list and state
          const newStrategies = strategies.map(s => s.id === updatedStrategy.id ? updatedStrategy : s);
          setStrategies(newStrategies);
          localStorage.setItem('btcwheel_strategies', JSON.stringify(newStrategies));
          setSelectedStrategy(updatedStrategy);
          
          console.log(`✅ [Local] Updated BTC accumulation: ${newQty} BTC @ $${newAvg.toFixed(2)}`);
        }

        // Recalculate stats with updated trades
        const activeTrades = updatedTrades.filter(t => t.status === 'open').length;
        const closedTrades = updatedTrades.filter(t => t.status === 'closed');
        const totalPnL = updatedTrades.reduce((sum, t) => sum + t.pnl, 0);
        const totalPremiumCollected = closedTrades.reduce((sum, t) => sum + (t.premium * t.quantity), 0);
        const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
        const losingTrades = closedTrades.filter(t => t.pnl < 0).length;
        const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;
        const returnOnCapital = selectedStrategy.total_capital > 0 ? (totalPnL / selectedStrategy.total_capital) * 100 : 0;
        
        setStats({
          totalPnL,
          activeTrades,
          closedTrades: closedTrades.length,
          totalTrades: updatedTrades.length,
          winRate,
          totalPremiumCollected,
          returnOnCapital,
          winningTrades,
          losingTrades,
          initialCapital: selectedStrategy.total_capital,
          currentCapital: selectedStrategy.total_capital + totalPnL
        });
        
        setShowAddTrade(false);
        setReinvestMode(false);
        
        // Reset form
        setFormData({
          ticker: selectedStrategy.ticker,
          type: 'put',
          action: 'sell',
          strike: '',
          premium: '',
          quantity: '1',
          expiry: '',
          capital: '',
        });
        
        setSaving(false);
        return;
      }
      
      // CLOUD MODE: Save to database
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/trades`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            strategyId: selectedStrategy.id,
            type: formData.type,
            action: formData.action,
            strike: parseFloat(formData.strike),
            premium: parseFloat(formData.premium),
            quantity: parseInt(formData.quantity),
            ticker: formData.ticker,
            expiry: formData.expiry,
            capital: parseFloat(formData.capital),
            status: 'open'
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to add trade');
      }
      
      // Refresh trades and stats
      await fetchTrades(selectedStrategy.id);
      await fetchStats(selectedStrategy.id);
      
      setShowAddTrade(false);
      setReinvestMode(false);
      
      // Reset form
      setFormData({
        ticker: selectedStrategy.ticker,
        type: 'put',
        action: 'sell',
        strike: '',
        premium: '',
        quantity: '1',
        expiry: '',
        capital: '',
      });
      
    } catch (error) {
      console.error('Error adding trade:', error);
      alert('Errore nell\'aggiunta del trade. Riprova.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseTrade = async (tradeId: string) => {
    if (!selectedStrategy) {
      alert('Seleziona una strategia prima di gestire i trade');
      return;
    }

    setSaving(true);

    try {
      if (!accessToken) {
        const updatedTrades = trades.map((t) =>
          t.id === tradeId ? { ...t, status: 'closed' as const } : t
        );

        setTrades(updatedTrades);
        localStorage.setItem(
          `btcwheel_trades_${selectedStrategy.id}`,
          JSON.stringify(updatedTrades)
        );

        const activeTrades = updatedTrades.filter((t) => t.status === 'open').length;
        const closedTrades = updatedTrades.filter((t) => t.status === 'closed');
        const totalPnL = updatedTrades.reduce((sum, t) => sum + t.pnl, 0);
        const totalPremiumCollected = closedTrades.reduce(
          (sum, t) => sum + t.premium * t.quantity,
          0
        );
        const winningTrades = closedTrades.filter((t) => t.pnl > 0).length;
        const losingTrades = closedTrades.filter((t) => t.pnl < 0).length;
        const winRate =
          closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;
        const returnOnCapital =
          selectedStrategy.total_capital > 0
            ? (totalPnL / selectedStrategy.total_capital) * 100
            : 0;

        setStats({
          totalPnL,
          activeTrades,
          closedTrades: closedTrades.length,
          totalTrades: updatedTrades.length,
          winRate,
          totalPremiumCollected,
          returnOnCapital,
          winningTrades,
          losingTrades,
          initialCapital: selectedStrategy.total_capital,
          currentCapital: selectedStrategy.total_capital + totalPnL,
        });

        toast.success('Trade chiuso');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/trades/${tradeId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'closed' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update trade status');
      }

      if (selectedStrategy.id) {
        await fetchTrades(selectedStrategy.id);
        await fetchStats(selectedStrategy.id);
      }

      toast.success('Trade chiuso');
    } catch (error) {
      console.error('Error closing trade:', error);
      toast.error('Errore nella chiusura del trade');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navigation 
        currentView="wheel-strategy" 
        onNavigate={onNavigate}
        mascotVisible={true}
        onMascotToggle={() => {}}
      />
      
      {/* Main content with padding for navigation */}
      <div className="md:pl-20">
        {/* Header - Dark Mode Theme */}
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 py-4 max-w-[1600px]">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onNavigate('simulation')}
                className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-all hover:gap-3"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Torna al Simulatore</span>
                <span className="sm:hidden">Indietro</span>
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  ⚙️ Wheel Strategy Dashboard
                </h1>
                {/* Cloud/Local Mode Badge */}
                {isCloudMode ? (
                  <span className="hidden sm:flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/30">
                    ☁️ Cloud
                  </span>
                ) : (
                  <span className="hidden sm:flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold border border-orange-500/30">
                    💾 Locale
                  </span>
                )}
                {/* User Menu for logout */}
                <UserMenu onNavigate={onNavigate} />
              </div>
            </div>
          {/* Warning banner if in local mode */}
          {!isCloudMode && !loading && (
            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-orange-400 mb-2">
                    ⚠️ <strong>Modalità locale attiva</strong> - I dati sono salvati solo nel browser e verranno persi se cancelli la cache.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={testAndReloadConnection}
                      className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-md text-xs font-semibold border border-orange-500/40 transition-colors"
                    >
                      🔄 Test Connessione Cloud
                    </button>
                    <button 
                      onClick={() => {window.location.reload()}}
                      className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-md text-xs transition-colors"
                    >
                      ↻ Ricarica Pagina
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-[1600px] space-y-6">
        
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="ml-3 text-gray-400">Caricamento strategie...</span>
          </div>
        ) : (
          <>
            {/* Strategy Selector */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl text-white">🎯 Strategia Attiva</h2>
                <div className="text-sm text-gray-400">
                  💡 Crea strategie nel <button onClick={() => onNavigate('longterm')} className="text-emerald-400 hover:text-emerald-300 underline font-medium">Simulatore</button>
                </div>
              </div>

              {/* Strategy List/Selector */}
              {(() => {
                console.log('🔍 [RENDER DECISION]', {
                  strategiesLength: strategies.length,
                  selectedStrategy: selectedStrategy?.name || 'NULL',
                  showingEmptyState: strategies.length === 0
                });
                return strategies.length === 0;
              })() ? (
                <div className="text-center py-12 px-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-emerald-500/30">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-lg font-semibold text-white mb-2">Nessuna strategia trovata</p>
                  <p className="text-sm text-gray-400 mb-4">Crea la tua prima strategia nel Simulatore Lungo Termine</p>
                  <button
                    onClick={() => onNavigate('longterm')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    📊 Vai al Simulatore
                  </button>
                </div>
              ) : (
                <>
                  {/* Strategy Selector Dropdown */}
                  <div className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      🎯 Seleziona Strategia Attiva
                    </label>
                    <div className="flex gap-2 items-start">
                      <select
                        value={selectedStrategy?.id || ''}
                        onChange={(e) => {
                          const strategy = strategies.find(s => s.id === e.target.value);
                          if (strategy) {
                            console.log('🎯 Strategia selezionata manualmente:', strategy.name, strategy.id);
                            if (accessToken) {
                              selectStrategy(strategy);
                            } else {
                              selectLocalStrategy(strategy);
                            }
                          }
                        }}
                        className="flex-1 px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base font-medium bg-slate-900 text-white"
                      >
                        {strategies.map((strategy) => (
                          <option key={strategy.id} value={strategy.id}>
                            {strategy.name} - {strategy.ticker} (${strategy.total_capital.toLocaleString()})
                          </option>
                        ))}
                      </select>
                      {selectedStrategy && strategies.length > 1 && (
                        <button
                          onClick={async () => {
                            if (!confirm(`Sei sicuro di voler eliminare la strategia "${selectedStrategy.name}"?`)) return;
                            
                            try {
                              if (accessToken) {
                                // Delete from backend
                                const response = await fetch(
                                  `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/strategies/${selectedStrategy.id}`,
                                  {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${accessToken}`
                                    }
                                  }
                                );
                                
                                if (response.ok) {
                                  toast.success('Strategia eliminata!');
                                  const updatedStrategies = strategies.filter(s => s.id !== selectedStrategy.id);
                                  setStrategies(updatedStrategies);
                                  if (updatedStrategies.length > 0) {
                                    await selectStrategy(updatedStrategies[0]);
                                  } else {
                                    setSelectedStrategy(null);
                                  }
                                }
                              } else {
                                // Delete from localStorage
                                const updatedStrategies = strategies.filter(s => s.id !== selectedStrategy.id);
                                setStrategies(updatedStrategies);
                                localStorage.setItem('btcwheel_strategies', JSON.stringify(updatedStrategies));
                                toast.success('Strategia eliminata!');
                                if (updatedStrategies.length > 0) {
                                  selectLocalStrategy(updatedStrategies[0]);
                                } else {
                                  setSelectedStrategy(null);
                                }
                              }
                            } catch (error) {
                              console.error('Error deleting strategy:', error);
                              toast.error('Errore durante l\'eliminazione');
                            }
                          }}
                          className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          🗑️ Elimina
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Seleziona quale strategia vuoi monitorare e gestire
                    </p>
                  </div>

                  {/* Current Strategy Display (Large Card) */}
                  {selectedStrategy && (
                    <div className="mb-4 p-5 rounded-xl border-2 border-emerald-500/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-emerald-400 text-xs font-semibold px-2 py-1 bg-emerald-500/20 rounded-full">
                              ✓ STRATEGIA ATTIVA
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold text-white">{selectedStrategy.name}</h3>
                          <div className="flex gap-4 mt-2 text-sm text-gray-400">
                            <div>
                              <span className="text-gray-500">Ticker:</span> <span className="font-semibold text-emerald-400">{selectedStrategy.ticker}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Trade:</span> <span className="font-semibold text-emerald-400">{trades.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Totali Piano - 3 colonne */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-emerald-500/30">
                        {/* Capitale Versato */}
                        <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                          <div className="text-xs text-gray-400 mb-1">💰 Capitale Versato</div>
                          <div className="text-2xl text-white">
                            ${selectedStrategy.total_capital.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Capitale iniziale</div>
                        </div>

                        {/* Interesse Totale */}
                        <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                          <div className="text-xs text-gray-400 mb-1">📈 Interesse Totale</div>
                          <div className={`text-2xl ${stats && stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {stats ? (stats.totalPnL >= 0 ? '+' : '') + '$' + stats.totalPnL.toFixed(2) : '$0.00'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {stats ? `${stats.returnOnCapital >= 0 ? '+' : ''}${stats.returnOnCapital.toFixed(2)}% ROI` : '0% ROI'}
                          </div>
                        </div>

                        {/* Capitale Finale */}
                        <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4">
                          <div className="text-xs text-gray-400 mb-1">🎯 Capitale Finale</div>
                          <div className="text-2xl text-emerald-400">
                            ${stats ? stats.currentCapital.toLocaleString() : selectedStrategy.total_capital.toLocaleString()}
                          </div>
                          <div className="text-xs text-emerald-500 mt-1">
                            {stats && stats.totalPnL !== 0 
                              ? `${stats.totalPnL >= 0 ? '+' : ''}$${Math.abs(stats.totalPnL).toFixed(2)} vs iniziale`
                              : 'Nessun trade ancora'
                            }
                          </div>
                        </div>
                      </div>

                      {/* Piano Target - Sezione con calcoli proiettati */}
                      {(() => {
                        // Usa valori di default se non impostati - supporta sia le colonne legacy che il piano JSON
                        const planMonths = selectedStrategy.plan_duration_months || selectedStrategy.plan?.duration_months || 12;
                        const monthlyReturn = selectedStrategy.target_monthly_return || selectedStrategy.plan?.targetMonthlyReturn || 5;
                        
                        const startDate = new Date(selectedStrategy.created_at);
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + planMonths);
                        
                        const today = new Date();
                        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                        const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                        const remainingDays = Math.max(0, totalDays - elapsedDays);
                        
                        // Calcolo capitale target finale con interesse composto
                        const monthlyRate = monthlyReturn / 100;
                        const targetFinalCapital = selectedStrategy.total_capital * Math.pow(1 + monthlyRate, planMonths);
                        const targetTotalInterest = targetFinalCapital - selectedStrategy.total_capital;
                        
                        // Calcolo progresso attuale
                        const currentProgress = stats ? (stats.currentCapital / targetFinalCapital) * 100 : 0;
                        
                        return (
                          <div className="mt-4 pt-4 border-t-2 border-emerald-500/30">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm text-gray-300">🎯 Piano Target ({planMonths} mesi)</h4>
                              <div className="text-xs text-gray-400">
                                Scadenza: {endDate.toLocaleDateString('it-IT')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Giorni Rimanenti */}
                              <div className="bg-slate-800/50 border-2 border-emerald-500/40 rounded-lg p-4">
                                <div className="text-xs text-emerald-400 mb-1">⏰ Giorni Rimanenti</div>
                                <div className="text-2xl text-emerald-400">
                                  {remainingDays}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {elapsedDays} giorni trascorsi su {totalDays}
                                </div>
                              </div>

                              {/* Interesse Target */}
                              <div className="bg-slate-800/50 border-2 border-orange-500/40 rounded-lg p-4">
                                <div className="text-xs text-orange-400 mb-1">💎 Interesse Target</div>
                                <div className="text-2xl text-orange-400">
                                  +${targetTotalInterest.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {monthlyReturn}% mensile composto
                                </div>
                              </div>

                              {/* Capitale Target Finale */}
                              <div className="bg-slate-800/50 border-2 border-teal-500/40 rounded-lg p-4">
                                <div className="text-xs text-teal-400 mb-1">🏆 Capitale Target Finale</div>
                                <div className="text-2xl text-teal-400">
                                  ${targetFinalCapital.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Progresso: {currentProgress.toFixed(1)}%
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            {stats && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                  <span>Progressione verso obiettivo</span>
                                  <span>{currentProgress.toFixed(1)}%</span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${
                                      currentProgress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 
                                      currentProgress >= 50 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                                      'bg-gradient-to-r from-orange-400 to-orange-500'
                                    }`}
                                    style={{ width: `${Math.min(100, currentProgress)}%` }}
                                  />
                                </div>
                                {currentProgress >= 100 && (
                                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-700 text-center">
                                    🎉 Obiettivo raggiunto! Sei sopra il target pianificato!
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Other Strategies (if more than 1) */}
                  {strategies.length > 1 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-3">
                        {selectedStrategy ? 'Cambia strategia:' : 'Seleziona una strategia:'}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {strategies
                          .filter(s => s.id !== selectedStrategy?.id)
                          .map((strategy) => (
                            <button
                              key={strategy.id}
                              onClick={() => {
                                if (accessToken) {
                                  selectStrategy(strategy);
                                } else {
                                  selectLocalStrategy(strategy);
                                }
                              }}
                              className="p-4 rounded-lg border-2 border-slate-600/50 hover:border-emerald-500 hover:bg-slate-700/50 bg-slate-800/50 transition-all text-left group"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white group-hover:text-emerald-400 transition-colors">{strategy.name}</span>
                                <span className="text-gray-400 text-xs group-hover:text-emerald-500">
                                  Clicca per attivare →
                                </span>
                              </div>
                              <div className="text-xs text-gray-400">
                                <div>Ticker: {strategy.ticker}</div>
                                <div>Capitale: ${strategy.total_capital.toLocaleString()}</div>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
        
            {/* Stats Cards - Now using database stats */}
            {selectedStrategy && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total P&L */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:border-slate-600/50 overflow-hidden">
                  {/* Top gradient bar */}
                  <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Profitto Totale</span>
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.returnOnCapital >= 0 ? '+' : ''}{stats.returnOnCapital.toFixed(2)}% ROI
                    </div>
                  </div>
                </div>

                {/* Win Rate */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:border-slate-600/50 overflow-hidden">
                  {/* Top gradient bar */}
                  <div className="h-2 bg-gradient-to-r from-lime-400 to-green-500" />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Win Rate</span>
                      <Target className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {stats.winRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.winningTrades} win / {stats.losingTrades} loss
                    </div>
                  </div>
                </div>

                {/* Active Trades */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:border-slate-600/50 overflow-hidden">
                  {/* Top gradient bar */}
                  <div className="h-2 bg-gradient-to-r from-pink-500 to-red-500" />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Trade Attivi</span>
                      <Activity className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="text-2xl font-bold text-orange-400">
                      {stats.activeTrades}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      In corso
                    </div>
                  </div>
                </div>

                {/* Total Trades */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:border-slate-600/50 overflow-hidden">
                  {/* Top gradient bar */}
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-violet-600" />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Premi Raccolti</span>
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="text-2xl font-bold text-orange-400">
                      ${stats.totalPremiumCollected.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.closedTrades} trade chiusi
                    </div>
                  </div>
                </div>

                {/* BTC Accumulation Card */}
                {selectedStrategy && selectedStrategy.total_btc_accumulated && selectedStrategy.total_btc_accumulated > 0 ? (
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-orange-500/50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:border-orange-400/50 overflow-hidden relative group">
                    {/* Top gradient bar */}
                    <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">BTC Accumulati</span>
                        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">₿</div>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {selectedStrategy.total_btc_accumulated.toFixed(4)} <span className="text-sm font-normal text-gray-400">BTC</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="text-xs text-gray-400">
                          Costo Medio: <span className="text-orange-400 font-bold">${selectedStrategy.average_btc_price?.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </div>
                        {/* Tooltip hint */}
                        <div className="hidden group-hover:block absolute top-12 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded border border-gray-700">
                          Prezzo di pareggio
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Show message if no strategy selected */}
            {!selectedStrategy && strategies.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                <p className="text-yellow-800">👆 Seleziona una strategia per visualizzare i trade</p>
              </div>
            )}

            {/* Piano vs Reale Comparison */}
            {selectedStrategy && stats && trades.length > 0 && (() => {
              const rawPlan = selectedStrategy.plan;
              const planForComparison = rawPlan
                ? {
                    targetPremiumPercent: rawPlan.targetPremiumPercent ?? 2,
                    tradesPerMonth: rawPlan.tradesPerMonth ?? 8,
                    targetMonthlyReturn:
                      rawPlan.targetMonthlyReturn ??
                      selectedStrategy.target_monthly_return ??
                      5,
                    riskPerTrade: rawPlan.riskPerTrade ?? 10,
                    strategy: rawPlan.strategy ?? 'wheel',
                  }
                : undefined;

              return (
                <PlanVsReal 
                  trades={trades} 
                  stats={stats} 
                  plan={planForComparison}
                />
              );
            })()}
            
            {/* Trade Journal - Only show if strategy selected */}
            {selectedStrategy && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl text-white">📝 Trade Journal</h2>
                  <button
                    onClick={() => setShowAddTrade(!showAddTrade)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-600 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {showAddTrade ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {saving ? 'Salvataggio...' : (showAddTrade ? 'Annulla' : 'Nuovo Trade')}
                  </button>
                </div>

                {/* Add Trade Form */}
                {showAddTrade && (
                  <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    {/* Pulsante Reinvesti Premio */}
                    {trades.length > 0 && (
                      <div className="mb-4 flex items-center justify-between p-3 bg-slate-800/50 border-2 border-orange-500/40 rounded-lg">
                        <div>
                          <h4 className="text-sm text-orange-400">💰 Interesse Composto Attivo</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            Reinvesti il premio dell'ultimo trade per massimizzare i rendimenti
                          </p>
                        </div>
                        <button
                          onClick={handleReinvest}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Reinvesti Premio
                        </button>
                      </div>
                    )}

                    {/* Banner Modalità Reinvestimento */}
                    {reinvestMode && trades.length > 0 && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-lg">
                        <h4 className="text-sm mb-2 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          🎯 Modalità Interesse Composto Attivata!
                        </h4>
                        <div className="text-xs space-y-1">
                          <p>
                            📊 <strong>Ultimo Trade:</strong> {trades[0].ticker} {trades[0].type.toUpperCase()} • 
                            Capitale: {formData.type === 'call' ? '₿' : '$'}{trades[0].capital.toFixed(2)} • 
                            Premio: {formData.type === 'call' ? '₿' : '$'}{(trades[0].premium * trades[0].quantity).toFixed(2)}
                          </p>
                          <p>
                            🚀 <strong>Nuovo Capitale:</strong> {formData.type === 'call' ? '₿' : '$'}{formData.capital} 
                            (Capitale + Premio reinvestito)
                          </p>
                          <p className="mt-2 text-emerald-100">
                            💡 Formula: Capitale Nuovo = Capitale Vecchio + Premio = {trades[0].capital.toFixed(2)} + {(trades[0].premium * trades[0].quantity).toFixed(2)} = {formData.capital}
                          </p>
                        </div>
                      </div>
                    )}

                    <h3 className="text-lg text-white mb-4">Inserisci Trade Manuale</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Ticker</label>
                        <input
                          type="text"
                          value={formData.ticker}
                          onChange={(e) => setFormData({...formData, ticker: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value as 'put' | 'call'})}
                          className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="put">Put</option>
                          <option value="call">Call</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Azione</label>
                        <select
                          value={formData.action}
                          onChange={(e) => setFormData({...formData, action: e.target.value as Trade['action']})}
                          className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="sell">Vendi</option>
                          <option value="buy">Compra</option>
                          <option value="assigned">Assegnata</option>
                          <option value="expired">Scaduta</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Strike ($)</label>
                        <input
                          type="number"
                          value={formData.strike}
                          onChange={(e) => setFormData({...formData, strike: e.target.value})}
                          placeholder="50000"
                          className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">{premiumLabel}</label>
                        <input
                          type="number"
                          value={formData.premium}
                          onChange={(e) => setFormData({...formData, premium: e.target.value})}
                          placeholder={premiumPlaceholder}
                          className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Quantità</label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Scadenza</label>
                        <input
                          type="date"
                          value={formData.expiry}
                          onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">{capitalLabel}</label>
                        <input
                          type="number"
                          value={formData.capital}
                          onChange={(e) => setFormData({...formData, capital: e.target.value})}
                          placeholder={capitalPlaceholder}
                          className="w-full px-3 py-2 border border-slate-600 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          onClick={handleAddTrade}
                          disabled={!formData.strike || !formData.premium || !formData.expiry || !formData.capital}
                          className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-medium"
                        >
                          ✅ Aggiungi Trade
                        </button>
                      </div>
                    </div>
                    
                    {/* Messaggio campi obbligatori */}
                    {(!formData.strike || !formData.premium || !formData.expiry || !formData.capital) && (
                      <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                        <p className="text-sm text-orange-800">
                          ⚠️ Compila tutti i campi obbligatori: 
                          {!formData.strike && ' Strike'}
                          {!formData.premium && ' Premio'}
                          {!formData.capital && ' Capitale'}
                          {!formData.expiry && ' Scadenza'}
                        </p>
                      </div>
                    )}

                    {/* Warning Vendita CALL sotto costo medio */}
                    {formData.type === 'call' && formData.action === 'sell' && selectedStrategy?.average_btc_price && selectedStrategy.average_btc_price > 0 && parseFloat(formData.strike) < selectedStrategy.average_btc_price && (
                      <div className="mt-3 p-3 bg-red-500/10 border-l-4 border-red-500 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-red-400">⚠️ ATTENZIONE: Strike Price Sotto Costo Medio!</p>
                            <p className="text-xs text-red-300/80 mt-1">
                              Stai vendendo una CALL a <span className="text-white font-mono">${parseFloat(formData.strike).toLocaleString()}</span> ma il tuo costo medio di carico è <span className="text-white font-mono">${selectedStrategy.average_btc_price.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>.
                            </p>
                            <p className="text-xs text-red-300/80 mt-1">
                              Se vieni assegnato, realizzerai una <strong>perdita</strong> sul capitale accumulato.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Calcolo Automatico - Mostra entrambi i valori */}
                    {formData.capital && formData.premium && (
                      <div className="mt-4 p-4 bg-slate-800/50 border-2 border-emerald-500/40 rounded-lg">
                        <h4 className="text-sm text-emerald-400 mb-2">🧮 Calcolo Automatico</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-400">Premio in Valore</div>
                            <div className="text-lg text-emerald-400">
                              {premiumSymbol}{formData.premium || '0'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Premio in Percentuale</div>
                            <div className="text-lg text-emerald-400">
                              {premiumPercentage || '0'}% sul capitale
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          💡 {formData.type === 'call' 
                            ? `Covered Call: Ricevi ${formData.premium || '0'} BTC (${premiumPercentage || '0'}% del tuo BTC)`
                            : `Cash-Secured Put: Ricevi $${formData.premium || '0'} USDT (${premiumPercentage || '0'}% del tuo capitale)`
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Trades List */}
                {trades.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">Nessun trade registrato</p>
                    <p className="text-sm">Clicca "Nuovo Trade" per iniziare</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trades.map((trade) => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-emerald-500/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${
                            trade.type === 'put' ? 'bg-emerald-500' : 'bg-orange-500'
                          }`}>
                            {trade.type === 'put' ? '📉' : '📈'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white">{trade.ticker}</span>
                              <span className="text-sm text-gray-400">
                                {trade.type.toUpperCase()} ${trade.strike}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                trade.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-gray-400'
                              }`}>
                                {trade.status === 'open' ? 'Aperto' : 'Chiuso'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {trade.action === 'sell' ? 'Vendita' : trade.action === 'buy' ? 'Acquisto' : trade.action} • 
                              Scad: {trade.expiry} • Qty: {trade.quantity}
                            </div>
                          </div>
                        </div>
                      <div className="text-right">
                        <div className={`text-lg ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">{trade.date}</div>
                        {trade.status === 'open' && (
                          <button
                            onClick={() => handleCloseTrade(trade.id)}
                            disabled={saving}
                            className="mt-2 px-3 py-1 bg-slate-700 text-gray-100 rounded text-xs hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Chiudi trade
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}
          </>
        )}
      </main>
      </div> {/* Close md:pl-20 wrapper */}
    </div>
  );
}
