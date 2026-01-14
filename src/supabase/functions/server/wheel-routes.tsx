import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Initialize Supabase client
const getSupabaseClient = (authHeader?: string) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Get authenticated user ID from Authorization header
const getUserId = async (authHeader?: string): Promise<string | null> => {
  if (!authHeader) return null;
  
  const token = authHeader.replace("Bearer ", "");
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    console.error("Auth error:", error);
    return null;
  }
  
  return data.user.id;
};

// 📊 CREATE STRATEGY
app.post("/make-server-7c0f82ca/wheel/strategies", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const userId = await getUserId(authHeader);
    
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { name, ticker, totalCapital, planDurationMonths, targetMonthlyReturn } = await c.req.json();
    
    if (!name || !ticker || !totalCapital) {
      return c.json({ error: "Missing required fields: name, ticker, totalCapital" }, 400);
    }
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("wheel_strategies")
      .insert({
        user_id: userId,
        name,
        ticker,
        total_capital: totalCapital,
      })
      .select()
      .single();
    
    if (error) {
      console.error("Database error creating strategy:", error);
      return c.json({ error: "Failed to create strategy", details: error.message }, 500);
    }
    
    console.log(`✅ Strategy created: ${data.id} for user ${userId}`);
    return c.json({ strategy: data }, 201);
    
  } catch (error) {
    console.error("Error in POST /wheel/strategies:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// 📋 GET ALL STRATEGIES FOR USER
app.get("/make-server-7c0f82ca/wheel/strategies", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const userId = await getUserId(authHeader);
    
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("wheel_strategies")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Database error fetching strategies:", error);
      return c.json({ error: "Failed to fetch strategies", details: error.message }, 500);
    }
    
    return c.json({ strategies: data || [] }, 200);
    
  } catch (error) {
    console.error("Error in GET /wheel/strategies:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// 📈 ADD TRADE TO STRATEGY
app.post("/make-server-7c0f82ca/wheel/trades", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const userId = await getUserId(authHeader);
    
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const {
      strategyId,
      type,
      action,
      strike,
      premium,
      capital,
      quantity,
      ticker,
      expiry,
      status
    } = await c.req.json();
    
    // Validate required fields
    if (!strategyId || !type || !action || !strike || !premium || !capital || !quantity || !ticker || !expiry) {
      return c.json({ 
        error: "Missing required fields",
        required: ["strategyId", "type", "action", "strike", "premium", "capital", "quantity", "ticker", "expiry"]
      }, 400);
    }
    
    // Calculate P&L
    const pnl = action === 'sell' 
      ? premium * quantity 
      : -premium * quantity;
    
    const supabase = getSupabaseClient();
    
    // Verify strategy belongs to user
    const { data: strategy, error: strategyError } = await supabase
      .from("wheel_strategies")
      .select("id")
      .eq("id", strategyId)
      .eq("user_id", userId)
      .single();
    
    if (strategyError || !strategy) {
      return c.json({ error: "Strategy not found or unauthorized" }, 404);
    }
    
    // Insert trade
    const { data, error } = await supabase
      .from("wheel_trades")
      .insert({
        strategy_id: strategyId,
        user_id: userId,
        type,
        action,
        strike,
        premium,
        capital,
        quantity,
        ticker,
        expiry,
        pnl,
        status: status || 'open',
      })
      .select()
      .single();
    
    if (error) {
      console.error("Database error creating trade:", error);
      return c.json({ error: "Failed to create trade", details: error.message }, 500);
    }
    
    console.log(`✅ Trade created: ${data.id} for strategy ${strategyId}`);
    return c.json({ trade: data }, 201);
    
  } catch (error) {
    console.error("Error in POST /wheel/trades:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// 📊 GET TRADES FOR STRATEGY
app.get("/make-server-7c0f82ca/wheel/trades/:strategyId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const userId = await getUserId(authHeader);
    
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const strategyId = c.req.param("strategyId");
    
    if (!strategyId) {
      return c.json({ error: "Missing strategyId" }, 400);
    }
    
    const supabase = getSupabaseClient();
    
    // Verify strategy belongs to user
    const { data: strategy, error: strategyError } = await supabase
      .from("wheel_strategies")
      .select("id")
      .eq("id", strategyId)
      .eq("user_id", userId)
      .single();
    
    if (strategyError || !strategy) {
      return c.json({ error: "Strategy not found or unauthorized" }, 404);
    }
    
    // Get all trades for this strategy
    const { data, error } = await supabase
      .from("wheel_trades")
      .select("*")
      .eq("strategy_id", strategyId)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Database error fetching trades:", error);
      return c.json({ error: "Failed to fetch trades", details: error.message }, 500);
    }
    
    return c.json({ trades: data || [] }, 200);
    
  } catch (error) {
    console.error("Error in GET /wheel/trades/:strategyId:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ✏️ UPDATE TRADE STATUS (open -> closed)
app.patch("/make-server-7c0f82ca/wheel/trades/:tradeId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const userId = await getUserId(authHeader);
    
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const tradeId = c.req.param("tradeId");
    const { status } = await c.req.json();
    
    if (!tradeId || !status) {
      return c.json({ error: "Missing tradeId or status" }, 400);
    }
    
    if (!['open', 'closed'].includes(status)) {
      return c.json({ error: "Invalid status. Must be 'open' or 'closed'" }, 400);
    }
    
    const supabase = getSupabaseClient();
    
    // Update trade (RLS will ensure user owns it)
    const { data, error } = await supabase
      .from("wheel_trades")
      .update({ status })
      .eq("id", tradeId)
      .eq("user_id", userId)
      .select()
      .single();
    
    if (error) {
      console.error("Database error updating trade:", error);
      return c.json({ error: "Failed to update trade", details: error.message }, 500);
    }
    
    if (!data) {
      return c.json({ error: "Trade not found or unauthorized" }, 404);
    }
    
    console.log(`✅ Trade updated: ${tradeId} -> status: ${status}`);
    return c.json({ trade: data }, 200);
    
  } catch (error) {
    console.error("Error in PATCH /wheel/trades/:tradeId:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// 📊 GET STRATEGY STATISTICS
app.get("/make-server-7c0f82ca/wheel/strategies/:strategyId/stats", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const userId = await getUserId(authHeader);
    
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const strategyId = c.req.param("strategyId");
    
    const supabase = getSupabaseClient();
    
    // Verify strategy belongs to user
    const { data: strategy, error: strategyError } = await supabase
      .from("wheel_strategies")
      .select("*")
      .eq("id", strategyId)
      .eq("user_id", userId)
      .single();
    
    if (strategyError || !strategy) {
      return c.json({ error: "Strategy not found or unauthorized" }, 404);
    }
    
    // Get all trades
    const { data: trades, error: tradesError } = await supabase
      .from("wheel_trades")
      .select("*")
      .eq("strategy_id", strategyId);
    
    if (tradesError) {
      console.error("Database error fetching trades for stats:", tradesError);
      return c.json({ error: "Failed to fetch trades" }, 500);
    }
    
    // Calculate statistics
    const totalPnL = trades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;
    const activeTrades = trades?.filter(t => t.status === 'open').length || 0;
    const closedTrades = trades?.filter(t => t.status === 'closed').length || 0;
    const totalTrades = trades?.length || 0;
    const winningTrades = trades?.filter(t => t.status === 'closed' && t.pnl > 0).length || 0;
    const losingTrades = trades?.filter(t => t.status === 'closed' && t.pnl < 0).length || 0;
    const winRate = closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0;
    const totalPremiumCollected = trades?.reduce((sum, t) => 
      sum + (t.action === 'sell' ? t.premium * t.quantity : 0), 0) || 0;
    const returnOnCapital = strategy.total_capital > 0 
      ? (totalPnL / strategy.total_capital) * 100 
      : 0;
    
    const stats = {
      totalPnL,
      activeTrades,
      closedTrades,
      totalTrades,
      winRate: Math.round(winRate * 10) / 10,
      totalPremiumCollected,
      returnOnCapital: Math.round(returnOnCapital * 100) / 100,
      winningTrades,
      losingTrades,
      initialCapital: strategy.total_capital,
      currentCapital: strategy.total_capital + totalPnL,
    };
    
    return c.json({ stats }, 200);
    
  } catch (error) {
    console.error("Error in GET /wheel/strategies/:strategyId/stats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// 🗑️ DELETE STRATEGY
app.delete("/make-server-7c0f82ca/strategies/:strategyId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const userId = await getUserId(authHeader);
    
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const strategyId = c.req.param("strategyId");
    const supabase = getSupabaseClient();
    
    // Verify strategy belongs to user
    const { data: strategy, error: strategyError } = await supabase
      .from("wheel_strategies")
      .select("id")
      .eq("id", strategyId)
      .eq("user_id", userId)
      .single();
    
    if (strategyError || !strategy) {
      return c.json({ error: "Strategy not found or unauthorized" }, 404);
    }
    
    // Delete all trades associated with the strategy first
    const { error: tradesDeleteError } = await supabase
      .from("wheel_trades")
      .delete()
      .eq("strategy_id", strategyId);
    
    if (tradesDeleteError) {
      console.error("Error deleting trades:", tradesDeleteError);
      return c.json({ error: "Failed to delete associated trades" }, 500);
    }
    
    // Delete the strategy
    const { error: deleteError } = await supabase
      .from("wheel_strategies")
      .delete()
      .eq("id", strategyId)
      .eq("user_id", userId);
    
    if (deleteError) {
      console.error("Error deleting strategy:", deleteError);
      return c.json({ error: "Failed to delete strategy" }, 500);
    }
    
    console.log(`✅ Strategy deleted: ${strategyId}`);
    return c.json({ message: "Strategy deleted successfully" }, 200);
    
  } catch (error) {
    console.error("Error in DELETE /strategies/:strategyId:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;