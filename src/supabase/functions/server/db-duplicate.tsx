// Database Duplication Tool - Copy finanzacreativa data to btcwheel
import { Hono } from 'npm:hono@4.6.14';
import * as kv from './kv_store.tsx';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const app = new Hono();

// Get Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
};

// 🔍 GET ALL KEYS BY PREFIX
app.get('/make-server-7c0f82ca/db-duplicate/scan/:prefix', async (c) => {
  try {
    const prefix = c.req.param('prefix');
    console.log(`📦 Scanning database for prefix: ${prefix}`);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('kv_store_7c0f82ca')
      .select('key, value')
      .like('key', `${prefix}%`);

    if (error) throw error;

    console.log(`✅ Found ${data.length} keys with prefix ${prefix}`);

    return c.json({
      success: true,
      prefix,
      count: data.length,
      keys: data.map(d => ({
        key: d.key,
        value: d.value,
        // Parse the key structure
        parsed: parseKey(d.key)
      }))
    });
  } catch (error: any) {
    console.error('❌ Error scanning database:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 🔄 DUPLICATE SINGLE KEY
app.post('/make-server-7c0f82ca/db-duplicate/copy', async (c) => {
  try {
    const { sourceKey, targetKey, overwrite = false } = await c.req.json();
    
    console.log(`🔄 Copying key: ${sourceKey} → ${targetKey}`);

    // Get source value
    const sourceValue = await kv.get(sourceKey);
    if (!sourceValue) {
      return c.json({ 
        success: false, 
        error: `Source key not found: ${sourceKey}` 
      }, 404);
    }

    // Check if target exists
    if (!overwrite) {
      const targetValue = await kv.get(targetKey);
      if (targetValue) {
        return c.json({ 
          success: false, 
          error: `Target key already exists: ${targetKey}. Set overwrite=true to replace.` 
        }, 409);
      }
    }

    // Copy the value
    await kv.set(targetKey, sourceValue);
    console.log(`✅ Copied successfully`);

    return c.json({
      success: true,
      sourceKey,
      targetKey,
      value: sourceValue
    });
  } catch (error: any) {
    console.error('❌ Error copying key:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 🚀 BULK DUPLICATE - Copy all finanzacreativa keys to btcwheel
app.post('/make-server-7c0f82ca/db-duplicate/bulk-copy', async (c) => {
  try {
    const { 
      sourcePrefix, 
      targetPrefix, 
      overwrite = false,
      dryRun = false 
    } = await c.req.json();

    console.log(`🚀 Bulk copy: ${sourcePrefix} → ${targetPrefix} (dryRun: ${dryRun})`);

    // Get all source keys
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('kv_store_7c0f82ca')
      .select('key, value')
      .like('key', `${sourcePrefix}%`);

    if (error) throw error;

    console.log(`📦 Found ${data.length} keys to copy`);

    const results = {
      total: data.length,
      copied: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const item of data) {
      const sourceKey = item.key;
      const targetKey = sourceKey.replace(sourcePrefix, targetPrefix);
      
      try {
        // Check if target exists
        if (!overwrite) {
          const targetValue = await kv.get(targetKey);
          if (targetValue) {
            console.log(`⏭️ Skipping ${targetKey} (already exists)`);
            results.skipped++;
            results.details.push({
              sourceKey,
              targetKey,
              status: 'skipped',
              reason: 'already_exists'
            });
            continue;
          }
        }

        if (!dryRun) {
          // Actually copy the data
          await kv.set(targetKey, item.value);
          console.log(`✅ Copied: ${sourceKey} → ${targetKey}`);
        } else {
          console.log(`🔍 DRY RUN: Would copy ${sourceKey} → ${targetKey}`);
        }

        results.copied++;
        results.details.push({
          sourceKey,
          targetKey,
          status: dryRun ? 'dry_run' : 'copied',
          valueSize: JSON.stringify(item.value).length
        });
      } catch (err: any) {
        console.error(`❌ Error copying ${sourceKey}:`, err.message);
        results.errors++;
        results.details.push({
          sourceKey,
          targetKey,
          status: 'error',
          error: err.message
        });
      }
    }

    console.log(`✅ Bulk copy complete: ${results.copied} copied, ${results.skipped} skipped, ${results.errors} errors`);

    return c.json({
      success: true,
      dryRun,
      results
    });
  } catch (error: any) {
    console.error('❌ Error in bulk copy:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 📊 GET STATISTICS
app.get('/make-server-7c0f82ca/db-duplicate/stats', async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    // Get all keys and group by prefix
    const { data, error } = await supabase
      .from('kv_store_7c0f82ca')
      .select('key');

    if (error) throw error;

    const stats: Record<string, number> = {};
    
    data.forEach(item => {
      const prefix = item.key.split('_')[0] + '_' + (item.key.split('_')[1] || '');
      stats[prefix] = (stats[prefix] || 0) + 1;
    });

    return c.json({
      success: true,
      total: data.length,
      byPrefix: stats,
      prefixes: Object.keys(stats)
    });
  } catch (error: any) {
    console.error('❌ Error getting stats:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 🗑️ DELETE BY PREFIX (use with caution!)
app.delete('/make-server-7c0f82ca/db-duplicate/delete/:prefix', async (c) => {
  try {
    const prefix = c.req.param('prefix');
    const { confirm } = await c.req.json();

    if (!confirm || confirm !== `DELETE_${prefix}`) {
      return c.json({
        success: false,
        error: 'Confirmation required. Send {"confirm": "DELETE_<prefix>"}'
      }, 400);
    }

    console.log(`🗑️ Deleting all keys with prefix: ${prefix}`);

    const supabase = getSupabaseClient();
    const { data, error: selectError } = await supabase
      .from('kv_store_7c0f82ca')
      .select('key')
      .like('key', `${prefix}%`);

    if (selectError) throw selectError;

    const keysToDelete = data.map(d => d.key);
    console.log(`Found ${keysToDelete.length} keys to delete`);

    if (keysToDelete.length > 0) {
      await kv.mdel(keysToDelete);
      console.log(`✅ Deleted ${keysToDelete.length} keys`);
    }

    return c.json({
      success: true,
      deleted: keysToDelete.length,
      keys: keysToDelete
    });
  } catch (error: any) {
    console.error('❌ Error deleting keys:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Helper function to parse key structure
function parseKey(key: string) {
  const parts = key.split('_');
  return {
    app: parts[0], // finanzacreativa or btcwheel
    type: parts[1], // strategies, trades, plans, etc
    id: parts.slice(2).join('_') // user id or strategy id
  };
}

// 🔄 DUPLICATE USER DATA - Copy one user's data from one prefix to another
export async function duplicateUserData(
  userId: string,
  sourcePrefix: string,
  targetPrefix: string
): Promise<{ success: boolean; duplicatedCount: number; errors: string[] }> {
  console.log(`🔄 Duplicating user ${userId} data: ${sourcePrefix} → ${targetPrefix}`);

  const supabase = getSupabaseClient();
  const errors: string[] = [];
  let duplicatedCount = 0;

  try {
    // Scan for all keys matching this user in source prefix
    const { data, error } = await supabase
      .from('kv_store_7c0f82ca')
      .select('key, value')
      .like('key', `${sourcePrefix}_${userId}%`);

    if (error) throw error;

    console.log(`📦 Found ${data.length} keys for user ${userId} in ${sourcePrefix}`);

    for (const item of data) {
      try {
        const sourceKey = item.key;
        const targetKey = sourceKey.replace(sourcePrefix, targetPrefix);

        // Copy the value
        await kv.set(targetKey, item.value);
        console.log(`✅ Duplicated: ${sourceKey} → ${targetKey}`);
        duplicatedCount++;
      } catch (err: any) {
        console.error(`❌ Error duplicating ${item.key}:`, err.message);
        errors.push(`Error duplicating ${item.key}: ${err.message}`);
      }
    }

    console.log(`✅ Duplication complete: ${duplicatedCount} keys duplicated, ${errors.length} errors`);

    return {
      success: errors.length === 0,
      duplicatedCount,
      errors
    };
  } catch (error: any) {
    console.error('❌ Fatal error in duplicateUserData:', error);
    return {
      success: false,
      duplicatedCount,
      errors: [error.message]
    };
  }
}

export default app;