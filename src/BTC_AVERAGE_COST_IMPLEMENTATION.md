# 📊 IMPLEMENTAZIONE COSTO MEDIO BTC - WHEEL STRATEGY

## 🎯 PROBLEMA DA RISOLVERE

Quando fai la Wheel Strategy in **bear market**, accumuli BTC tramite assignment di PUT multiple:
- Vendi PUT a $45,000 → Assigned! Compri 0.1 BTC a $45,000
- BTC scende a $42,000
- Vendi altra PUT a $42,000 → Assigned! Compri altri 0.1 BTC a $42,000
- **Problema**: Qual è il mio costo medio? Posso vendere CALL profittevoli?

**Soluzione necessaria:**
- Tracciare tutti gli acquisti BTC (PUT assignments)
- Calcolare prezzo medio ponderato
- Bloccare vendita CALL se prezzo corrente < costo medio + premio target
- Dashboard che mostra gap tra costo medio e prezzo attuale

---

## 🏗️ ARCHITETTURA PROPOSTA

### **1. Estendere tabella `wheel_strategies`**

Aggiungi campi per tracciare accumulo BTC:

```sql
-- Esegui in Supabase SQL Editor
ALTER TABLE wheel_strategies
ADD COLUMN total_btc_accumulated DECIMAL(18,8) DEFAULT 0,
ADD COLUMN total_btc_cost_basis DECIMAL(18,2) DEFAULT 0,
ADD COLUMN average_btc_price DECIMAL(18,2) DEFAULT 0,
ADD COLUMN last_accumulation_date TIMESTAMPTZ,
ADD COLUMN accumulation_history JSONB DEFAULT '[]'::jsonb;

-- Commento colonne
COMMENT ON COLUMN wheel_strategies.total_btc_accumulated IS 'Totale BTC accumulati tramite PUT assignments';
COMMENT ON COLUMN wheel_strategies.total_btc_cost_basis IS 'Costo totale in $ di tutti i BTC accumulati';
COMMENT ON COLUMN wheel_strategies.average_btc_price IS 'Prezzo medio ponderato = total_cost_basis / total_btc';
COMMENT ON COLUMN wheel_strategies.accumulation_history IS 'Array JSON di ogni assignment: [{date, btc_qty, price, total_cost}]';
```

---

### **2. Logica Backend per Calcolo Automatico**

Quando aggiungi un trade di tipo **"PUT assigned"**, aggiorna automaticamente il costo medio.

**File da modificare:** `/supabase/functions/server/wheel-routes.tsx`

#### **A. Funzione helper per calcolare average cost**

```typescript
// Aggiungi questa funzione nel file wheel-routes.tsx

interface AccumulationEntry {
  date: string;
  btc_qty: number;
  price: number;
  total_cost: number;
}

async function updateBTCAccumulation(
  supabase: any,
  strategyId: string,
  assignmentTrade: {
    btc_qty: number;  // es. 0.1 BTC
    strike_price: number;  // es. 42000
    assignment_date: string;
  }
) {
  // Get current strategy data
  const { data: strategy, error } = await supabase
    .from('wheel_strategies')
    .select('*')
    .eq('id', strategyId)
    .single();
  
  if (error || !strategy) {
    throw new Error('Strategy not found');
  }
  
  // Calculate new totals
  const newBTCQty = (strategy.total_btc_accumulated || 0) + assignmentTrade.btc_qty;
  const newCostBasis = (strategy.total_btc_cost_basis || 0) + (assignmentTrade.btc_qty * assignmentTrade.strike_price);
  const newAveragePrice = newBTCQty > 0 ? newCostBasis / newBTCQty : 0;
  
  // Add to history
  const history: AccumulationEntry[] = strategy.accumulation_history || [];
  history.push({
    date: assignmentTrade.assignment_date,
    btc_qty: assignmentTrade.btc_qty,
    price: assignmentTrade.strike_price,
    total_cost: assignmentTrade.btc_qty * assignmentTrade.strike_price
  });
  
  // Update strategy
  const { data: updated, error: updateError } = await supabase
    .from('wheel_strategies')
    .update({
      total_btc_accumulated: newBTCQty,
      total_btc_cost_basis: newCostBasis,
      average_btc_price: newAveragePrice,
      last_accumulation_date: assignmentTrade.assignment_date,
      accumulation_history: history
    })
    .eq('id', strategyId)
    .select()
    .single();
  
  if (updateError) {
    throw new Error('Failed to update BTC accumulation: ' + updateError.message);
  }
  
  console.log(`✅ Updated BTC accumulation for strategy ${strategyId}:`);
  console.log(`   Total BTC: ${newBTCQty.toFixed(8)}`);
  console.log(`   Average Price: $${newAveragePrice.toFixed(2)}`);
  
  return updated;
}
```

#### **B. Modifica route POST /wheel/trades**

Aggiungi logica per chiamare `updateBTCAccumulation` quando il trade è una PUT assigned:

```typescript
// Nella route POST /make-server-7c0f82ca/wheel/trades
// Dopo aver inserito il trade, aggiungi:

// Se il trade è una PUT assignment, aggiorna accumulo BTC
if (type === 'put' && status === 'assigned') {
  try {
    await updateBTCAccumulation(supabase, strategyId, {
      btc_qty: quantity, // Da passare nel body della richiesta
      strike_price: strike,
      assignment_date: new Date().toISOString()
    });
  } catch (accumulationError) {
    console.error('Error updating BTC accumulation:', accumulationError);
    // Non bloccare il trade, solo log warning
  }
}
```

---

### **3. Validazione Pre-Vendita CALL**

Quando l'utente vuole vendere una CALL, verifica che:
```
prezzo_corrente_BTC >= average_btc_price + premio_minimo_target
```

**File da modificare:** `/supabase/functions/server/wheel-routes.tsx`

```typescript
// Aggiungi questa funzione di validazione

async function canSellCall(
  supabase: any,
  strategyId: string,
  currentBTCPrice: number,
  minimumPremiumTarget: number = 0.02  // 2% di profitto minimo
): Promise<{ allowed: boolean; reason?: string; data?: any }> {
  
  const { data: strategy, error } = await supabase
    .from('wheel_strategies')
    .select('*')
    .eq('id', strategyId)
    .single();
  
  if (error || !strategy) {
    return { allowed: false, reason: 'Strategy not found' };
  }
  
  const averagePrice = strategy.average_btc_price || 0;
  
  // Se non hai BTC accumulati, puoi vendere liberamente
  if (strategy.total_btc_accumulated === 0 || averagePrice === 0) {
    return { allowed: true };
  }
  
  // Calcola prezzo minimo per vendere con profitto
  const minimumSellPrice = averagePrice * (1 + minimumPremiumTarget);
  
  if (currentBTCPrice < minimumSellPrice) {
    return {
      allowed: false,
      reason: `Prezzo attuale ($${currentBTCPrice.toFixed(2)}) inferiore al costo medio + target ($${minimumSellPrice.toFixed(2)})`,
      data: {
        current_price: currentBTCPrice,
        average_cost: averagePrice,
        minimum_sell_price: minimumSellPrice,
        gap_percentage: ((currentBTCPrice - averagePrice) / averagePrice) * 100,
        total_btc_held: strategy.total_btc_accumulated
      }
    };
  }
  
  return {
    allowed: true,
    data: {
      current_price: currentBTCPrice,
      average_cost: averagePrice,
      potential_profit_per_btc: currentBTCPrice - averagePrice,
      profit_percentage: ((currentBTCPrice - averagePrice) / averagePrice) * 100
    }
  };
}
```

#### **Nuova route per validazione**

```typescript
// GET /make-server-7c0f82ca/wheel/strategies/:strategyId/can-sell-call
app.get("/make-server-7c0f82ca/wheel/strategies/:strategyId/can-sell-call", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const userId = await getUserId(authHeader);
    
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const strategyId = c.req.param("strategyId");
    const currentPrice = parseFloat(c.req.query("currentPrice") || "0");
    const targetPremium = parseFloat(c.req.query("targetPremium") || "0.02");
    
    if (!currentPrice) {
      return c.json({ error: "Missing currentPrice query parameter" }, 400);
    }
    
    const supabase = getSupabaseClient();
    
    // Verify strategy belongs to user
    const { data: strategy, error } = await supabase
      .from("wheel_strategies")
      .select("id")
      .eq("id", strategyId)
      .eq("user_id", userId)
      .single();
    
    if (error || !strategy) {
      return c.json({ error: "Strategy not found" }, 404);
    }
    
    const validation = await canSellCall(supabase, strategyId, currentPrice, targetPremium);
    
    return c.json({
      canSell: validation.allowed,
      reason: validation.reason,
      data: validation.data
    }, 200);
    
  } catch (error) {
    console.error("Error in can-sell-call validation:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
```

---

### **4. Frontend Dashboard Component**

Crea un nuovo componente per mostrare il costo medio e il gap.

**File da creare:** `/components/BTCAccumulationCard.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AccumulationData {
  total_btc_accumulated: number;
  average_btc_price: number;
  total_btc_cost_basis: number;
  accumulation_history: Array<{
    date: string;
    btc_qty: number;
    price: number;
    total_cost: number;
  }>;
}

interface Props {
  strategyId: string;
  currentBTCPrice: number;
}

export function BTCAccumulationCard({ strategyId, currentBTCPrice }: Props) {
  const [data, setData] = useState<AccumulationData | null>(null);
  const [canSell, setCanSell] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [strategyId]);

  const fetchData = async () => {
    try {
      const { createClient } = await import('npm:@supabase/supabase-js@2');
      const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fetch strategy data
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/strategies/${strategyId}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          }
        }
      );
      
      const { strategy } = await response.json();
      setData(strategy);
      
      // Check if can sell call
      const validationResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/strategies/${strategyId}/can-sell-call?currentPrice=${currentBTCPrice}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          }
        }
      );
      
      const { canSell: allowed } = await validationResponse.json();
      setCanSell(allowed);
      
    } catch (error) {
      console.error('Error fetching accumulation data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <div>Loading...</div>;

  const averagePrice = data.average_btc_price || 0;
  const totalBTC = data.total_btc_accumulated || 0;
  const gap = currentBTCPrice - averagePrice;
  const gapPercentage = averagePrice > 0 ? (gap / averagePrice) * 100 : 0;
  const isProfit = gap >= 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-400" />
            Costo Medio BTC
          </h3>
          <Badge className={isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
            {isProfit ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {gapPercentage > 0 ? '+' : ''}{gapPercentage.toFixed(2)}%
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Costo Medio</div>
            <div className="text-2xl font-bold text-white">${averagePrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Prezzo Attuale</div>
            <div className="text-2xl font-bold text-white">${currentBTCPrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">BTC Accumulati</div>
            <div className="text-xl font-bold text-orange-400">{totalBTC.toFixed(8)} BTC</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Gap</div>
            <div className={`text-xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
              ${Math.abs(gap).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Warning if can't sell */}
        {!canSell && (
          <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-orange-400">
                Vendita CALL non consigliata
              </div>
              <div className="text-xs text-orange-300/80 mt-1">
                Il prezzo attuale è inferiore al tuo costo medio + target di profitto.
                Aspetta che BTC risalga a ${(averagePrice * 1.02).toFixed(2)} o più.
              </div>
            </div>
          </div>
        )}

        {/* Accumulation History */}
        {data.accumulation_history && data.accumulation_history.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-300 mb-2">
              Storico Acquisti ({data.accumulation_history.length})
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.accumulation_history.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-900/50 rounded">
                  <span className="text-gray-400">
                    {new Date(entry.date).toLocaleDateString('it-IT')}
                  </span>
                  <span className="text-orange-400">
                    {entry.btc_qty.toFixed(8)} BTC
                  </span>
                  <span className="text-white">
                    @ ${entry.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
```

---

## 🚀 IMPLEMENTAZIONE STEP-BY-STEP

### **STEP 1: Modifica Database**
```sql
-- Copia e incolla in Supabase SQL Editor
ALTER TABLE wheel_strategies
ADD COLUMN total_btc_accumulated DECIMAL(18,8) DEFAULT 0,
ADD COLUMN total_btc_cost_basis DECIMAL(18,2) DEFAULT 0,
ADD COLUMN average_btc_price DECIMAL(18,2) DEFAULT 0,
ADD COLUMN last_accumulation_date TIMESTAMPTZ,
ADD COLUMN accumulation_history JSONB DEFAULT '[]'::jsonb;
```

### **STEP 2: Aggiorna Backend**
1. Apri `/supabase/functions/server/wheel-routes.tsx`
2. Aggiungi la funzione `updateBTCAccumulation`
3. Aggiungi la funzione `canSellCall`
4. Aggiungi la route GET `/can-sell-call`
5. Modifica POST `/wheel/trades` per chiamare update automatico

### **STEP 3: Crea Frontend Component**
1. Crea `/components/BTCAccumulationCard.tsx`
2. Importalo in `/components/trading/WheelDashboard.tsx`
3. Mostralo nella dashboard principale

### **STEP 4: Test**
1. Crea una strategia
2. Aggiungi un trade PUT assigned (status: 'assigned')
3. Verifica che `average_btc_price` si aggiorni
4. Prova a vendere CALL con prezzo < costo medio
5. Verifica che mostri warning

---

## ✅ RISULTATO FINALE

L'utente vedrà:
- 📊 **Costo medio BTC** aggiornato automaticamente
- 📈 **Gap in tempo reale** tra prezzo corrente e costo medio
- ⚠️ **Warning visivo** se non può vendere CALL profittevolmente
- 📜 **Storico acquisti** con date e prezzi
- ✅ **Validazione automatica** prima di ogni vendita CALL

---

## 🎯 DOMANDE?

Vuoi che implementi direttamente il codice o preferisci farlo tu seguendo questa guida?
