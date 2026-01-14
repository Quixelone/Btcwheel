import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js";

// 🔐 Admin Migration Module - Mass data migration from finanzacreativa to btcwheel
// WARNING: This module performs bulk operations. Use with caution.

const getClient = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

interface UserDataSummary {
  userId: string;
  email?: string;
  strategies: number;
  trades: number;
  plans: number;
  hasActivePlan: boolean;
  hasUserProgress: boolean;
}

/**
 * 🔍 Scans the database for all users with finanzacreativa data
 */
export async function scanUsersWithData(sourcePrefix: string = "finanzacreativa"): Promise<UserDataSummary[]> {
  console.log(`🔍 Scanning for users with ${sourcePrefix} data...`);
  
  try {
    const supabase = getClient();
    
    // Get all keys from kv_store
    const { data, error } = await supabase
      .from("kv_store_7c0f82ca")
      .select("key, value");
    
    if (error) {
      throw error;
    }
    
    // Extract users with finanzacreativa data
    const userMap = new Map<string, UserDataSummary>();
    
    for (const item of data || []) {
      const key = item.key || '';
      
      // Match pattern: user:userId:prefix_*
      const match = key.match(/^user:([^:]+):([^_]+)_(.+)$/);
      if (!match) continue;
      
      const [, userId, prefix, dataType] = match;
      
      // Only process source prefix
      if (prefix !== sourcePrefix) continue;
      
      // Initialize user if not exists
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          strategies: 0,
          trades: 0,
          plans: 0,
          hasActivePlan: false,
          hasUserProgress: false
        });
      }
      
      const userData = userMap.get(userId)!;
      
      // Count data types
      if (dataType === 'strategies') {
        userData.strategies = Array.isArray(item.value) ? item.value.length : 0;
      } else if (dataType.startsWith('trades_')) {
        userData.trades += Array.isArray(item.value) ? item.value.length : 0;
      } else if (dataType === 'longterm_plans') {
        userData.plans = Array.isArray(item.value) ? item.value.length : 0;
      } else if (dataType === 'active_plan') {
        userData.hasActivePlan = !!item.value;
      } else if (dataType === 'user_progress') {
        userData.hasUserProgress = !!item.value;
      }
    }
    
    // Get user emails from auth
    const userIds = Array.from(userMap.keys());
    const usersWithEmails = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const { data: { user } } = await supabase.auth.admin.getUserById(userId);
          const summary = userMap.get(userId)!;
          return {
            ...summary,
            email: user?.email
          };
        } catch (error) {
          console.warn(`Could not fetch email for user ${userId}:`, error);
          return userMap.get(userId)!;
        }
      })
    );
    
    console.log(`✅ Found ${usersWithEmails.length} users with ${sourcePrefix} data`);
    
    return usersWithEmails;
    
  } catch (error) {
    console.error("❌ Error scanning users:", error);
    throw error;
  }
}

/**
 * 🚀 Migrates data for a single user
 */
async function migrateUserData(
  userId: string, 
  sourcePrefix: string, 
  targetPrefix: string
): Promise<{ success: boolean; migratedCount: number; errors: string[] }> {
  
  let migratedCount = 0;
  const errors: string[] = [];
  
  try {
    console.log(`📦 Migrating user ${userId}: ${sourcePrefix} -> ${targetPrefix}`);
    
    // Get all keys for this user with source prefix
    const sourcePattern = `user:${userId}:${sourcePrefix}`;
    const allData = await kv.getByPrefix(sourcePattern);
    
    console.log(`  Found ${allData.length} items to migrate`);
    
    for (const item of allData) {
      try {
        const key = item.key || '';
        
        // Replace source prefix with target prefix
        const targetKey = key.replace(
          `user:${userId}:${sourcePrefix}`,
          `user:${userId}:${targetPrefix}`
        );
        
        // Save to target key
        await kv.set(targetKey, item.value);
        migratedCount++;
        
        console.log(`  ✅ ${key} -> ${targetKey}`);
      } catch (error) {
        const errorMsg = `Failed to migrate key ${item.key}: ${error.message}`;
        console.error(`  ❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    console.log(`✅ User ${userId} migration complete: ${migratedCount} items`);
    
    return {
      success: errors.length === 0,
      migratedCount,
      errors
    };
    
  } catch (error) {
    console.error(`❌ User ${userId} migration failed:`, error);
    return {
      success: false,
      migratedCount,
      errors: [error.message]
    };
  }
}

/**
 * 🔄 Migrates all users in batch
 */
export async function migrateAllUsers(
  sourcePrefix: string = "finanzacreativa",
  targetPrefix: string = "btcwheel",
  userIds?: string[] // Optional: only migrate specific users
): Promise<{
  totalUsers: number;
  successCount: number;
  failedCount: number;
  totalItemsMigrated: number;
  results: Array<{
    userId: string;
    email?: string;
    success: boolean;
    migratedCount: number;
    errors: string[];
  }>;
}> {
  
  console.log(`🚀 Starting batch migration: ${sourcePrefix} -> ${targetPrefix}`);
  
  try {
    // Get list of users to migrate
    const usersToMigrate = userIds 
      ? (await scanUsersWithData(sourcePrefix)).filter(u => userIds.includes(u.userId))
      : await scanUsersWithData(sourcePrefix);
    
    console.log(`📊 Migrating ${usersToMigrate.length} users...`);
    
    const results = [];
    let successCount = 0;
    let failedCount = 0;
    let totalItemsMigrated = 0;
    
    // Migrate each user sequentially (to avoid overwhelming the database)
    for (const user of usersToMigrate) {
      const result = await migrateUserData(user.userId, sourcePrefix, targetPrefix);
      
      results.push({
        userId: user.userId,
        email: user.email,
        success: result.success,
        migratedCount: result.migratedCount,
        errors: result.errors
      });
      
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }
      
      totalItemsMigrated += result.migratedCount;
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Batch migration complete!`);
    console.log(`  Total users: ${usersToMigrate.length}`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failedCount}`);
    console.log(`  Total items migrated: ${totalItemsMigrated}`);
    
    return {
      totalUsers: usersToMigrate.length,
      successCount,
      failedCount,
      totalItemsMigrated,
      results
    };
    
  } catch (error) {
    console.error("❌ Batch migration failed:", error);
    throw error;
  }
}

/**
 * 🗑️ Deletes all data for a specific prefix (DANGEROUS - use with caution)
 */
export async function deleteAllDataForPrefix(
  prefix: string,
  userId?: string // Optional: only delete for specific user
): Promise<{ deletedCount: number; errors: string[] }> {
  
  console.log(`🗑️ WARNING: Deleting all data for prefix: ${prefix}${userId ? ` (user: ${userId})` : ''}`);
  
  let deletedCount = 0;
  const errors: string[] = [];
  
  try {
    const pattern = userId ? `user:${userId}:${prefix}` : prefix;
    const allData = await kv.getByPrefix(pattern);
    
    console.log(`  Found ${allData.length} items to delete`);
    
    for (const item of allData) {
      try {
        await kv.del(item.key);
        deletedCount++;
        console.log(`  ✅ Deleted: ${item.key}`);
      } catch (error) {
        const errorMsg = `Failed to delete key ${item.key}: ${error.message}`;
        console.error(`  ❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    console.log(`✅ Deletion complete: ${deletedCount} items deleted`);
    
    return {
      deletedCount,
      errors
    };
    
  } catch (error) {
    console.error("❌ Deletion failed:", error);
    return {
      deletedCount,
      errors: [error.message]
    };
  }
}

/**
 * 📊 Gets statistics about data in the database
 */
export async function getDatabaseStats(): Promise<{
  totalKeys: number;
  prefixes: Record<string, {
    userCount: number;
    itemCount: number;
  }>;
}> {
  
  try {
    const supabase = getClient();
    
    const { data, error } = await supabase
      .from("kv_store_7c0f82ca")
      .select("key");
    
    if (error) {
      throw error;
    }
    
    const prefixes: Record<string, Set<string>> = {};
    const prefixItemCounts: Record<string, number> = {};
    
    for (const item of data || []) {
      const key = item.key || '';
      
      // Extract prefix pattern: user:userId:prefix_*
      const match = key.match(/^user:[^:]+:([^_]+)_/);
      if (match) {
        const prefix = match[1];
        
        // Track unique users for this prefix
        const userMatch = key.match(/^user:([^:]+):/);
        if (userMatch) {
          const userId = userMatch[1];
          
          if (!prefixes[prefix]) {
            prefixes[prefix] = new Set();
            prefixItemCounts[prefix] = 0;
          }
          
          prefixes[prefix].add(userId);
          prefixItemCounts[prefix]++;
        }
      }
    }
    
    // Convert to stats object
    const stats: Record<string, { userCount: number; itemCount: number }> = {};
    for (const [prefix, userSet] of Object.entries(prefixes)) {
      stats[prefix] = {
        userCount: userSet.size,
        itemCount: prefixItemCounts[prefix]
      };
    }
    
    return {
      totalKeys: data?.length || 0,
      prefixes: stats
    };
    
  } catch (error) {
    console.error("❌ Error getting database stats:", error);
    throw error;
  }
}

export default {
  scanUsersWithData,
  migrateAllUsers,
  deleteAllDataForPrefix,
  getDatabaseStats
};
