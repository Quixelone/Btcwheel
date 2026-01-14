import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Initialize Supabase client with service role (for admin operations)
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

// Get authenticated user from Authorization header
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
  
  // Get user metadata
  const { data: user } = await supabase.auth.admin.getUserById(userId);
  
  if (!user?.user) return false;
  
  const email = user.user.email || '';
  const role = user.user.user_metadata?.role;
  
  // Admin logic: check email domain or role metadata
  const ADMIN_EMAILS = ['admin@btcwheel.com'];
  const DEV_MODE = true; // Set to false in production
  
  return DEV_MODE || 
    ADMIN_EMAILS.includes(email) || 
    email.includes('admin') || 
    role === 'admin';
};

// ============================================
// 👥 USER MANAGEMENT ROUTES
// ============================================

// 📋 GET ALL USERS (Admin only, with pagination)
app.get("/make-server-7c0f82ca/admin/users", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserId(authHeader);
    
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    // Pagination params
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const search = c.req.query("search") || "";
    const planFilter = c.req.query("plan") || "";
    const statusFilter = c.req.query("status") || "";
    
    const offset = (page - 1) * limit;
    
    const supabase = getSupabaseAdmin();
    
    // Build query
    let query = supabase
      .from("admin_users_overview")
      .select("*", { count: "exact" });
    
    // Search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }
    
    // Plan filter
    if (planFilter) {
      query = query.eq("plan_name", planFilter);
    }
    
    // Status filter
    if (statusFilter) {
      query = query.eq("subscription_status", statusFilter);
    }
    
    // Pagination
    const { data, error, count } = await query
      .order("signup_date", { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error("Database error fetching users:", error);
      return c.json({ error: "Failed to fetch users", details: error.message }, 500);
    }
    
    return c.json({ 
      users: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }, 200);
    
  } catch (error) {
    console.error("Error in GET /admin/users:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// 👤 GET USER DETAILS (Admin only)
app.get("/make-server-7c0f82ca/admin/users/:userId", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserId(authHeader);
    
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const targetUserId = c.req.param("userId");
    const supabase = getSupabaseAdmin();
    
    // Get user auth data
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(targetUserId);
    
    if (authError || !authUser?.user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Get profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", targetUserId)
      .single();
    
    // Get subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq("user_id", targetUserId)
      .single();
    
    // Get strategies count
    const { count: strategiesCount } = await supabase
      .from("wheel_strategies")
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUserId);
    
    // Get trades count
    const { count: tradesCount } = await supabase
      .from("wheel_trades")
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUserId);
    
    return c.json({
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        created_at: authUser.user.created_at,
        last_sign_in_at: authUser.user.last_sign_in_at,
        profile,
        subscription,
        stats: {
          total_strategies: strategiesCount || 0,
          total_trades: tradesCount || 0
        }
      }
    }, 200);
    
  } catch (error) {
    console.error("Error in GET /admin/users/:userId:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ✏️ UPDATE USER SUBSCRIPTION (Admin only)
app.patch("/make-server-7c0f82ca/admin/users/:userId/subscription", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const adminUser = await getUserId(authHeader);
    
    if (!adminUser || !(await isAdmin(adminUser.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const targetUserId = c.req.param("userId");
    const { planName, status, expiresAt } = await c.req.json();
    
    const supabase = getSupabaseAdmin();
    
    // Get plan ID from name
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("name", planName)
      .single();
    
    if (planError || !plan) {
      return c.json({ error: "Invalid plan name" }, 400);
    }
    
    // Update or insert subscription
    const { data, error } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: targetUserId,
        plan_id: plan.id,
        status: status || 'active',
        expires_at: expiresAt || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) {
      console.error("Database error updating subscription:", error);
      return c.json({ error: "Failed to update subscription", details: error.message }, 500);
    }
    
    // Log audit trail
    await supabase.from("admin_audit_log").insert({
      admin_user_id: adminUser.id,
      target_user_id: targetUserId,
      action: 'subscription_updated',
      entity_type: 'subscription',
      entity_id: data.id,
      new_values: { planName, status, expiresAt }
    });
    
    console.log(`✅ Subscription updated for user ${targetUserId} by admin ${adminUser.email}`);
    return c.json({ subscription: data }, 200);
    
  } catch (error) {
    console.error("Error in PATCH /admin/users/:userId/subscription:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// 🚫 SUSPEND/ACTIVATE USER (Admin only)
app.patch("/make-server-7c0f82ca/admin/users/:userId/status", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const adminUser = await getUserId(authHeader);
    
    if (!adminUser || !(await isAdmin(adminUser.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const targetUserId = c.req.param("userId");
    const { action } = await c.req.json(); // 'suspend' or 'activate'
    
    if (!['suspend', 'activate'].includes(action)) {
      return c.json({ error: "Invalid action. Use 'suspend' or 'activate'" }, 400);
    }
    
    const supabase = getSupabaseAdmin();
    
    // Update subscription status
    const { data, error } = await supabase
      .from("user_subscriptions")
      .update({ 
        status: action === 'suspend' ? 'suspended' : 'active',
        updated_at: new Date().toISOString()
      })
      .eq("user_id", targetUserId)
      .select()
      .single();
    
    if (error) {
      console.error("Database error updating user status:", error);
      return c.json({ error: "Failed to update user status", details: error.message }, 500);
    }
    
    // Log audit trail
    await supabase.from("admin_audit_log").insert({
      admin_user_id: adminUser.id,
      target_user_id: targetUserId,
      action: action === 'suspend' ? 'user_suspended' : 'user_activated',
      entity_type: 'user',
      entity_id: targetUserId
    });
    
    console.log(`✅ User ${targetUserId} ${action}d by admin ${adminUser.email}`);
    return c.json({ message: `User ${action}d successfully`, subscription: data }, 200);
    
  } catch (error) {
    console.error("Error in PATCH /admin/users/:userId/status:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// 📦 BACKUP & RESTORE ROUTES
// ============================================

// 💾 CREATE BACKUP (User or Admin)
app.post("/make-server-7c0f82ca/backups/create", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserId(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { targetUserId } = await c.req.json();
    const backupUserId = targetUserId || user.id;
    
    // If backing up another user, must be admin
    if (backupUserId !== user.id && !(await isAdmin(user.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const supabase = getSupabaseAdmin();
    
    // Collect all user data
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", backupUserId)
      .single();
    
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*, plan:subscription_plans(*)")
      .eq("user_id", backupUserId)
      .single();
    
    const { data: strategies } = await supabase
      .from("wheel_strategies")
      .select("*")
      .eq("user_id", backupUserId);
    
    const { data: trades } = await supabase
      .from("wheel_trades")
      .select("*")
      .eq("user_id", backupUserId);
    
    const backupData = {
      version: "1.0",
      created_at: new Date().toISOString(),
      user_id: backupUserId,
      profile,
      subscription,
      strategies: strategies || [],
      trades: trades || []
    };
    
    const backupJson = JSON.stringify(backupData);
    const backupSize = new Blob([backupJson]).size;
    
    // Save backup to database
    const { data: backup, error } = await supabase
      .from("user_backups")
      .insert({
        user_id: backupUserId,
        backup_data: backupData,
        backup_type: targetUserId ? 'manual' : 'automatic',
        backup_size_bytes: backupSize,
        created_by: user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error("Database error creating backup:", error);
      return c.json({ error: "Failed to create backup", details: error.message }, 500);
    }
    
    console.log(`✅ Backup created for user ${backupUserId} (${(backupSize / 1024).toFixed(2)} KB)`);
    return c.json({ 
      backup: {
        id: backup.id,
        size_kb: (backupSize / 1024).toFixed(2),
        created_at: backup.created_at
      }
    }, 201);
    
  } catch (error) {
    console.error("Error in POST /backups/create:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// 📥 GET USER BACKUPS
app.get("/make-server-7c0f82ca/backups", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserId(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const targetUserId = c.req.query("userId") || user.id;
    
    // If viewing another user's backups, must be admin
    if (targetUserId !== user.id && !(await isAdmin(user.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("user_backups")
      .select("id, backup_type, backup_size_bytes, created_at, restored_at")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (error) {
      console.error("Database error fetching backups:", error);
      return c.json({ error: "Failed to fetch backups", details: error.message }, 500);
    }
    
    return c.json({ backups: data || [] }, 200);
    
  } catch (error) {
    console.error("Error in GET /backups:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// 📤 EXPORT BACKUP (Download JSON)
app.get("/make-server-7c0f82ca/backups/:backupId/download", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserId(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const backupId = c.req.param("backupId");
    const supabase = getSupabaseAdmin();
    
    const { data: backup, error } = await supabase
      .from("user_backups")
      .select("*")
      .eq("id", backupId)
      .single();
    
    if (error || !backup) {
      return c.json({ error: "Backup not found" }, 404);
    }
    
    // Check authorization
    if (backup.user_id !== user.id && !(await isAdmin(user.id))) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    
    // Return JSON file
    return new Response(JSON.stringify(backup.backup_data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="btcwheel-backup-${backupId}.json"`
      }
    });
    
  } catch (error) {
    console.error("Error in GET /backups/:backupId/download:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// 📊 STATISTICS & ANALYTICS
// ============================================

// 📈 GET ADMIN DASHBOARD STATS
app.get("/make-server-7c0f82ca/admin/stats", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUserId(authHeader);
    
    if (!user || !(await isAdmin(user.id))) {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    
    const supabase = getSupabaseAdmin();
    
    // Total users
    const { count: totalUsers } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true });
    
    // Users by plan
    const { data: planDistribution } = await supabase
      .from("user_subscriptions")
      .select(`
        status,
        plan:subscription_plans(name, display_name)
      `);
    
    const planStats = planDistribution?.reduce((acc: any, sub: any) => {
      const planName = sub.plan?.display_name || 'Unknown';
      acc[planName] = (acc[planName] || 0) + 1;
      return acc;
    }, {});
    
    // Active vs inactive users
    const activeCount = planDistribution?.filter(s => s.status === 'active').length || 0;
    const suspendedCount = planDistribution?.filter(s => s.status === 'suspended').length || 0;
    
    // Total strategies
    const { count: totalStrategies } = await supabase
      .from("wheel_strategies")
      .select("*", { count: "exact", head: true });
    
    // Total trades
    const { count: totalTrades } = await supabase
      .from("wheel_trades")
      .select("*", { count: "exact", head: true });
    
    // New users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: newUsersThisWeek } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneWeekAgo.toISOString());
    
    return c.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeUsers: activeCount,
        suspendedUsers: suspendedCount,
        newUsersThisWeek: newUsersThisWeek || 0,
        totalStrategies: totalStrategies || 0,
        totalTrades: totalTrades || 0,
        planDistribution: planStats || {}
      }
    }, 200);
    
  } catch (error) {
    console.error("Error in GET /admin/stats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;