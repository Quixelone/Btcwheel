import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js";

// 📦 Data Migration & Porting Module
// Handles data migration between different app prefixes (finanzacreativa -> btcwheel)

// Helper to get the Supabase client
const getClient = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

interface MigrationOptions {
  sourcePrefix: string; // e.g., "finanzacreativa"
  targetPrefix: string; // e.g., "btcwheel"
  userId?: string; // Optional user filter
  dataTypes?: string[]; // e.g., ["strategies", "trades", "plans"]
}

interface ExportData {
  metadata: {
    exportedAt: string;
    sourceApp: string;
    version: string;
  };
  strategies: any[];
  trades: Record<string, any[]>; // strategyId -> trades[]
  plans: any[];
  activePlan: any | null;
  userProgress: any | null;
}

/**
 * 🔄 Migrates data from one prefix to another in the KV store
 */
export async function migrateData(options: MigrationOptions): Promise<{ success: boolean; migratedCount: number; errors: string[] }> {
  const { sourcePrefix, targetPrefix, userId, dataTypes = ["strategies", "trades", "plans"] } = options;
  
  let migratedCount = 0;
  const errors: string[] = [];
  
  try {
    console.log(`🚀 Starting migration: ${sourcePrefix} -> ${targetPrefix}`);
    
    // Build the source key prefix
    const basePrefix = userId ? `user:${userId}:${sourcePrefix}` : sourcePrefix;
    
    // Get all keys with source prefix
    const sourceData = await kv.getByPrefix(basePrefix);
    
    console.log(`📊 Found ${sourceData.length} items with prefix: ${basePrefix}`);
    
    for (const item of sourceData) {
      try {
        // Extract the key suffix (everything after the source prefix)
        const key = item.key || '';
        
        // Replace source prefix with target prefix
        let targetKey = key;
        if (userId) {
          targetKey = key.replace(`user:${userId}:${sourcePrefix}`, `user:${userId}:${targetPrefix}`);
        } else {
          targetKey = key.replace(sourcePrefix, targetPrefix);
        }
        
        // Save to target key
        await kv.set(targetKey, item.value);
        migratedCount++;
        
        console.log(`✅ Migrated: ${key} -> ${targetKey}`);
      } catch (error) {
        const errorMsg = `Failed to migrate key: ${item.key} - ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    console.log(`✅ Migration complete: ${migratedCount} items migrated`);
    
    return {
      success: errors.length === 0,
      migratedCount,
      errors
    };
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return {
      success: false,
      migratedCount,
      errors: [error.message]
    };
  }
}

/**
 * 📤 Exports all user data to JSON format
 */
export async function exportUserData(userId: string, appPrefix: string = "btcwheel"): Promise<ExportData> {
  console.log(`📤 Exporting data for user: ${userId}, app: ${appPrefix}`);
  
  try {
    // Get strategies
    const strategiesData = await kv.get(`user:${userId}:${appPrefix}_strategies`);
    const strategies = strategiesData || [];
    
    // Get trades for each strategy
    const trades: Record<string, any[]> = {};
    for (const strategy of strategies) {
      const strategyTrades = await kv.get(`user:${userId}:${appPrefix}_trades_${strategy.id}`);
      if (strategyTrades && strategyTrades.length > 0) {
        trades[strategy.id] = strategyTrades;
      }
    }
    
    // Get long-term plans
    const plansData = await kv.get(`user:${userId}:${appPrefix}_longterm_plans`);
    const plans = plansData || [];
    
    // Get active plan
    const activePlan = await kv.get(`user:${userId}:${appPrefix}_active_plan`);
    
    // Get user progress
    const userProgress = await kv.get(`user:${userId}:${appPrefix}_user_progress`);
    
    const exportData: ExportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        sourceApp: appPrefix,
        version: "1.0.0"
      },
      strategies,
      trades,
      plans,
      activePlan,
      userProgress
    };
    
    console.log(`✅ Export complete: ${strategies.length} strategies, ${Object.keys(trades).length} trade sets, ${plans.length} plans`);
    
    return exportData;
    
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}

/**
 * 📥 Imports data from JSON format
 */
export async function importUserData(userId: string, data: ExportData, targetPrefix: string = "btcwheel", mergeMode: boolean = false): Promise<{ success: boolean; importedCount: number; errors: string[] }> {
  console.log(`📥 Importing data for user: ${userId}, target: ${targetPrefix}, merge: ${mergeMode}`);
  
  let importedCount = 0;
  const errors: string[] = [];
  
  try {
    // Import strategies
    if (data.strategies && data.strategies.length > 0) {
      try {
        let existingStrategies: any[] = [];
        
        if (mergeMode) {
          const existing = await kv.get(`user:${userId}:${targetPrefix}_strategies`);
          existingStrategies = existing || [];
        }
        
        // Merge or replace
        const mergedStrategies = mergeMode 
          ? [...existingStrategies, ...data.strategies]
          : data.strategies;
        
        await kv.set(`user:${userId}:${targetPrefix}_strategies`, mergedStrategies);
        importedCount += data.strategies.length;
        
        console.log(`✅ Imported ${data.strategies.length} strategies`);
      } catch (error) {
        errors.push(`Failed to import strategies: ${error.message}`);
      }
    }
    
    // Import trades
    if (data.trades && Object.keys(data.trades).length > 0) {
      for (const [strategyId, strategyTrades] of Object.entries(data.trades)) {
        try {
          await kv.set(`user:${userId}:${targetPrefix}_trades_${strategyId}`, strategyTrades);
          importedCount += strategyTrades.length;
          
          console.log(`✅ Imported ${strategyTrades.length} trades for strategy ${strategyId}`);
        } catch (error) {
          errors.push(`Failed to import trades for strategy ${strategyId}: ${error.message}`);
        }
      }
    }
    
    // Import long-term plans
    if (data.plans && data.plans.length > 0) {
      try {
        let existingPlans: any[] = [];
        
        if (mergeMode) {
          const existing = await kv.get(`user:${userId}:${targetPrefix}_longterm_plans`);
          existingPlans = existing || [];
        }
        
        const mergedPlans = mergeMode 
          ? [...existingPlans, ...data.plans]
          : data.plans;
        
        await kv.set(`user:${userId}:${targetPrefix}_longterm_plans`, mergedPlans);
        importedCount += data.plans.length;
        
        console.log(`✅ Imported ${data.plans.length} plans`);
      } catch (error) {
        errors.push(`Failed to import plans: ${error.message}`);
      }
    }
    
    // Import active plan (don't merge, just replace if exists)
    if (data.activePlan) {
      try {
        await kv.set(`user:${userId}:${targetPrefix}_active_plan`, data.activePlan);
        importedCount++;
        
        console.log(`✅ Imported active plan`);
      } catch (error) {
        errors.push(`Failed to import active plan: ${error.message}`);
      }
    }
    
    // Import user progress
    if (data.userProgress) {
      try {
        await kv.set(`user:${userId}:${targetPrefix}_user_progress`, data.userProgress);
        importedCount++;
        
        console.log(`✅ Imported user progress`);
      } catch (error) {
        errors.push(`Failed to import user progress: ${error.message}`);
      }
    }
    
    console.log(`✅ Import complete: ${importedCount} items imported`);
    
    return {
      success: errors.length === 0,
      importedCount,
      errors
    };
    
  } catch (error) {
    console.error("❌ Import failed:", error);
    return {
      success: false,
      importedCount,
      errors: [error.message]
    };
  }
}

/**
 * 🔍 Lists all available data prefixes in the database
 */
export async function listDataPrefixes(): Promise<string[]> {
  try {
    // Get all keys - we need to query the database directly
    const supabase = getClient();
    const { data, error } = await supabase
      .from("kv_store_7c0f82ca")
      .select("key");
    
    if (error) {
      throw error;
    }
    
    // Extract unique prefixes
    const prefixes = new Set<string>();
    
    for (const item of data || []) {
      const key = item.key || '';
      
      // Extract prefix patterns like "user:userId:prefix_"
      const match = key.match(/user:[^:]+:([^_]+)_/);
      if (match) {
        prefixes.add(match[1]);
      }
      
      // Also check for top-level prefixes
      const topMatch = key.match(/^([^:_]+)[_:]/);
      if (topMatch && !topMatch[1].startsWith('kv_')) {
        prefixes.add(topMatch[1]);
      }
    }
    
    return Array.from(prefixes);
    
  } catch (error) {
    console.error("❌ Failed to list prefixes:", error);
    return [];
  }
}

export default {
  migrateData,
  exportUserData,
  importUserData,
  listDataPrefixes
};