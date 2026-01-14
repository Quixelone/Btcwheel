import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Initialize Supabase admin client
const getSupabaseAdmin = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Initialize Supabase client for user auth validation
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Get authenticated user
const getUserId = async (authHeader?: string): Promise<{ id: string; email: string } | null> => {
  if (!authHeader) {
    console.error("Auth error: No Authorization header provided");
    return null;
  }
  
  const token = authHeader.replace("Bearer ", "");
  
  // Check if token is actually the anon key (common mistake)
  if (token === Deno.env.get("SUPABASE_ANON_KEY")) {
    console.error("Auth error: Anon key passed instead of user token");
    return null;
  }
  
  // Log token format for debugging (first 30 chars)
  console.log("Validating token:", token.substring(0, 30) + "... (length: " + token.length + ")");
  
  try {
    // Use Supabase client to validate the user token
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      console.error("Auth validation failed:", error?.message || "No user data");
      return null;
    }
    
    console.log("✅ User authenticated successfully:", data.user.id, data.user.email);
    return { id: data.user.id, email: data.user.email || "" };
    
  } catch (err) {
    console.error("Auth error (exception):", err);
    return null;
  }
};

// Check if user is admin
const isAdmin = async (userId: string): Promise<boolean> => {
  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase.auth.admin.getUserById(userId);
  
  if (!user?.user) return false;
  
  const email = user.user.email || '';
  const role = user.user.user_metadata?.role;
  
  const ADMIN_EMAILS = ['admin@btcwheel.com'];
  const DEV_MODE = true;
  
  return DEV_MODE || ADMIN_EMAILS.includes(email) || email.includes('admin') || role === 'admin';
};

// ============================================
// 📊 USER STRATEGIES & CAPITAL
// ============================================

// GET user strategies with capital calculation
app.get("/make-server-7c0f82ca/admin/users/:userId/strategies", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserId(authHeader);
    
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const targetUserId = c.req.param("userId");
    const supabase = getSupabaseAdmin();
    
    // Get all strategies
    const { data: strategies, error } = await supabase
      .from("wheel_strategies")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching strategies:", error);
      return c.json({ error: "Failed to fetch strategies" }, 500);
    }
    
    // Calculate total capital
    const totalCapital = strategies?.reduce((sum, s) => 
      s.status === 'active' ? sum + (s.allocated_capital || 0) : sum, 0
    ) || 0;
    
    // Try to update user profile with total capital (if function exists)
    try {
      await supabase.rpc('calculate_user_total_capital', { p_user_id: targetUserId });
    } catch (rpcError) {
      console.warn('RPC calculate_user_total_capital not available, skipping:', rpcError);
    }
    
    return c.json({ 
      strategies: strategies || [],
      summary: {
        total_strategies: strategies?.length || 0,
        active_strategies: strategies?.filter(s => s.status === 'active').length || 0,
        total_capital: totalCapital,
        avg_capital_per_strategy: strategies && strategies.length > 0 
          ? totalCapital / strategies.filter(s => s.status === 'active').length 
          : 0
      }
    });
    
  } catch (error) {
    console.error("Error in GET /admin/users/:userId/strategies:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET user trading stats (monthly)
app.get("/make-server-7c0f82ca/admin/users/:userId/trading-stats", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserId(authHeader);
    
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const targetUserId = c.req.param("userId");
    const month = parseInt(c.req.query("month") || new Date().getMonth() + 1);
    const year = parseInt(c.req.query("year") || new Date().getFullYear());
    
    const supabase = getSupabaseAdmin();
    
    // Get or calculate monthly stats
    const { data: monthlyStats } = await supabase
      .from("trading_monthly_stats")
      .select("*")
      .eq("user_id", targetUserId)
      .eq("month", month)
      .eq("year", year)
      .single();
    
    // If no cached stats, calculate from trades
    let stats = monthlyStats;
    
    if (!stats) {
      // Calculate profit for the month
      const { data: profitData, error: profitError } = await supabase
        .rpc('calculate_monthly_profit', {
          p_user_id: targetUserId,
          p_month: month,
          p_year: year
        });
      
      const monthlyProfit = profitData || 0;
      
      // Get trades for the month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const { data: trades } = await supabase
        .from("wheel_trades")
        .select("*")
        .eq("user_id", targetUserId)
        .gte("opened_at", startDate)
        .lte("opened_at", endDate);
      
      const totalTrades = trades?.length || 0;
      const totalFees = trades?.reduce((sum, t) => sum + (t.fees || 0), 0) || 0;
      const totalPremium = trades?.reduce((sum, t) => 
        (t.trade_type === 'put_open' || t.trade_type === 'call_open') ? sum + (t.premium || 0) : sum, 0
      ) || 0;
      
      stats = {
        user_id: targetUserId,
        year,
        month,
        total_trades: totalTrades,
        net_profit: monthlyProfit,
        total_fees: totalFees,
        total_premium_collected: totalPremium,
        gross_profit: monthlyProfit + totalFees
      };
    }
    
    // Get current capital and payment model
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("total_capital, last_capital_update")
      .eq("user_id", targetUserId)
      .single();
    
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("payment_model, capital_threshold, profit_share_percentage")
      .eq("user_id", targetUserId)
      .single();
    
    return c.json({
      stats,
      capital: {
        total: profile?.total_capital || 0,
        last_update: profile?.last_capital_update,
        threshold: subscription?.capital_threshold || 2500,
        above_threshold: (profile?.total_capital || 0) >= (subscription?.capital_threshold || 2500)
      },
      payment_model: {
        current: subscription?.payment_model || 'fixed_fee',
        profit_share_percentage: subscription?.profit_share_percentage || 15
      }
    });
    
  } catch (error) {
    console.error("Error in GET /admin/users/:userId/trading-stats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// 💰 INVOICING & BILLING
// ============================================

// GET all invoices (admin dashboard)
app.get("/make-server-7c0f82ca/admin/invoices", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserId(authHeader);
    
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const status = c.req.query("status") || "";
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = (page - 1) * limit;
    
    const supabase = getSupabaseAdmin();
    
    let query = supabase
      .from("monthly_invoices")
      .select(`
        *,
        user:auth.users!user_id(email),
        profile:user_profiles!user_id(full_name, total_capital)
      `, { count: "exact" });
    
    if (status) {
      query = query.eq("status", status);
    }
    
    const { data, error, count } = await query
      .order("invoice_date", { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error("Error fetching invoices:", error);
      return c.json({ error: "Failed to fetch invoices" }, 500);
    }
    
    return c.json({
      invoices: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error("Error in GET /admin/invoices:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST generate invoice for user
app.post("/make-server-7c0f82ca/admin/invoices/generate", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const adminUser = await getUserId(authHeader);
    
    if (!adminUser || !(await isAdmin(adminUser.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const { userId, month, year } = await c.req.json();
    
    if (!userId || !month || !year) {
      return c.json({ error: "Missing required fields: userId, month, year" }, 400);
    }
    
    const supabase = getSupabaseAdmin();
    
    // Calculate billing period
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    // Get user subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq("user_id", userId)
      .single();
    
    if (!subscription) {
      return c.json({ error: "User has no active subscription" }, 404);
    }
    
    // Calculate user capital
    await supabase.rpc('calculate_user_total_capital', { p_user_id: userId });
    
    // Determine payment model
    const { data: paymentModel } = await supabase.rpc('determine_payment_model', { p_user_id: userId });
    
    // Get updated profile with capital
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("total_capital")
      .eq("user_id", userId)
      .single();
    
    const totalCapital = profile?.total_capital || 0;
    
    let invoiceAmount = 0;
    let invoiceType = '';
    let monthlyProfit = 0;
    
    if (paymentModel === 'profit_share' || totalCapital >= (subscription.capital_threshold || 2500)) {
      // Calculate profit for the month
      const { data: profitData } = await supabase.rpc('calculate_monthly_profit', {
        p_user_id: userId,
        p_month: month,
        p_year: year
      });
      
      monthlyProfit = profitData || 0;
      
      // 15% of profits (only if positive)
      invoiceAmount = monthlyProfit > 0 ? monthlyProfit * (subscription.profit_share_percentage || 15) / 100 : 0;
      invoiceType = 'profit_share';
      
    } else {
      // Fixed fee from plan
      invoiceAmount = subscription.plan?.price_monthly || 0;
      invoiceType = 'fixed_fee';
    }
    
    // Check if invoice already exists for this period
    const { data: existingInvoice } = await supabase
      .from("monthly_invoices")
      .select("id")
      .eq("user_id", userId)
      .eq("billing_period_start", startDate)
      .eq("billing_period_end", endDate)
      .neq("status", "cancelled")
      .single();
    
    if (existingInvoice) {
      return c.json({ error: "Invoice already exists for this period" }, 409);
    }
    
    // Create invoice
    const { data: invoice, error } = await supabase
      .from("monthly_invoices")
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        billing_period_start: startDate,
        billing_period_end: endDate,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days
        invoice_type: invoiceType,
        total_capital: totalCapital,
        monthly_profit: monthlyProfit,
        profit_share_percentage: subscription.profit_share_percentage || 15,
        fixed_fee_amount: invoiceType === 'fixed_fee' ? invoiceAmount : null,
        amount: invoiceAmount,
        status: 'pending',
        created_by: adminUser.id
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating invoice:", error);
      return c.json({ error: "Failed to create invoice", details: error.message }, 500);
    }
    
    // Log audit
    await supabase.from("admin_audit_log").insert({
      admin_user_id: adminUser.id,
      target_user_id: userId,
      action: 'invoice_generated',
      entity_type: 'invoice',
      entity_id: invoice.id,
      new_values: {
        amount: invoiceAmount,
        type: invoiceType,
        period: `${month}/${year}`
      }
    });
    
    console.log(`✅ Invoice generated for user ${userId}: €${invoiceAmount.toFixed(2)} (${invoiceType})`);
    
    return c.json({ invoice }, 201);
    
  } catch (error) {
    console.error("Error in POST /admin/invoices/generate:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// PATCH mark invoice as paid
app.patch("/make-server-7c0f82ca/admin/invoices/:invoiceId/mark-paid", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const adminUser = await getUserId(authHeader);
    
    if (!adminUser || !(await isAdmin(adminUser.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const invoiceId = c.req.param("invoiceId");
    const { paymentMethod, paymentReference, notes } = await c.req.json();
    
    const supabase = getSupabaseAdmin();
    
    // Get invoice
    const { data: invoice } = await supabase
      .from("monthly_invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();
    
    if (!invoice) {
      return c.json({ error: "Invoice not found" }, 404);
    }
    
    if (invoice.status === 'paid') {
      return c.json({ error: "Invoice already marked as paid" }, 400);
    }
    
    // Update invoice
    const { data: updatedInvoice, error } = await supabase
      .from("monthly_invoices")
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod || 'manual',
        payment_reference: paymentReference,
        notes: notes
      })
      .eq("id", invoiceId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating invoice:", error);
      return c.json({ error: "Failed to update invoice" }, 500);
    }
    
    // Create payment history record
    await supabase.from("payment_history").insert({
      user_id: invoice.user_id,
      invoice_id: invoiceId,
      amount: invoice.amount,
      payment_method: paymentMethod || 'manual',
      payment_reference: paymentReference,
      status: 'completed',
      notes: notes,
      created_by: adminUser.id
    });
    
    // Log audit
    await supabase.from("admin_audit_log").insert({
      admin_user_id: adminUser.id,
      target_user_id: invoice.user_id,
      action: 'invoice_paid',
      entity_type: 'invoice',
      entity_id: invoiceId,
      new_values: {
        payment_method: paymentMethod,
        paid_at: new Date().toISOString()
      }
    });
    
    console.log(`✅ Invoice ${invoiceId} marked as paid by admin ${adminUser.email}`);
    
    return c.json({ invoice: updatedInvoice }, 200);
    
  } catch (error) {
    console.error("Error in PATCH /admin/invoices/:id/mark-paid:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET billing overview (dashboard stats)
app.get("/make-server-7c0f82ca/admin/billing/overview", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserId(authHeader);
    
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const supabase = getSupabaseAdmin();
    
    // Get overview from view
    const { data: billingOverview } = await supabase
      .from("admin_billing_overview")
      .select("*")
      .order("total_capital", { ascending: false, nullsFirst: false });
    
    // Calculate aggregate stats
    const stats = {
      total_users: billingOverview?.length || 0,
      users_fixed_fee: billingOverview?.filter(u => u.payment_model === 'fixed_fee').length || 0,
      users_profit_share: billingOverview?.filter(u => u.payment_model === 'profit_share').length || 0,
      total_capital_managed: billingOverview?.reduce((sum, u) => sum + (u.total_capital || 0), 0) || 0,
      pending_invoices_count: billingOverview?.reduce((sum, u) => sum + (u.pending_invoices || 0), 0) || 0,
      pending_invoices_amount: billingOverview?.reduce((sum, u) => sum + (u.total_pending || 0), 0) || 0,
      total_revenue: billingOverview?.reduce((sum, u) => sum + (u.total_paid || 0), 0) || 0
    };
    
    return c.json({
      stats,
      users: billingOverview || []
    });
    
  } catch (error) {
    console.error("Error in GET /admin/billing/overview:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST bulk generate invoices for all users
app.post("/make-server-7c0f82ca/admin/invoices/bulk-generate", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const adminUser = await getUserId(authHeader);
    
    if (!adminUser || !(await isAdmin(adminUser.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const { month, year } = await c.req.json();
    
    if (!month || !year) {
      return c.json({ error: "Missing required fields: month, year" }, 400);
    }
    
    const supabase = getSupabaseAdmin();
    
    // Get all active users with subscriptions
    const { data: users } = await supabase
      .from("user_subscriptions")
      .select("user_id, status")
      .eq("status", "active");
    
    if (!users || users.length === 0) {
      return c.json({ message: "No active users to invoice" }, 200);
    }
    
    const results = {
      success: [] as string[],
      errors: [] as { userId: string; error: string }[],
      skipped: [] as string[]
    };
    
    // Generate invoice for each user
    for (const user of users) {
      try {
        // Call generate invoice for this user
        const response = await fetch(
          `${c.req.url.split('/bulk-generate')[0]}/generate`,
          {
            method: 'POST',
            headers: {
              'Authorization': authHeader || '',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: user.user_id,
              month,
              year
            })
          }
        );
        
        if (response.status === 409) {
          results.skipped.push(user.user_id);
        } else if (response.ok) {
          results.success.push(user.user_id);
        } else {
          const errorData = await response.json();
          results.errors.push({
            userId: user.user_id,
            error: errorData.error || 'Unknown error'
          });
        }
        
      } catch (error) {
        results.errors.push({
          userId: user.user_id,
          error: String(error)
        });
      }
    }
    
    console.log(`✅ Bulk invoice generation completed: ${results.success.length} success, ${results.errors.length} errors, ${results.skipped.length} skipped`);
    
    return c.json({
      message: "Bulk generation completed",
      results
    }, 200);
    
  } catch (error) {
    console.error("Error in POST /admin/invoices/bulk-generate:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;