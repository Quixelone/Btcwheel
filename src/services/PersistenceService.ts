import { supabase } from '../lib/supabase';

export const PersistenceService = {
    // Save generic key-value data
    async save(userId: string, key: string, data: any) {
        if (!userId) return false;

        const fullKey = `${key}_${userId}`;
        console.log(`💾 [Persistence] Saving ${fullKey}...`);

        try {
            const { error } = await supabase
                .from('kv_store_7c0f82ca')
                .upsert({
                    key: fullKey,
                    value: { ...data, updated_at: new Date().toISOString() }
                });

            if (error) {
                console.error(`❌ [Persistence] Save failed for ${fullKey}:`, error);
                return false;
            }

            console.log(`✅ [Persistence] Saved ${fullKey}`);
            return true;
        } catch (e) {
            console.error(`❌ [Persistence] Exception for ${fullKey}:`, e);
            return false;
        }
    },

    // Load generic key-value data
    async load(userId: string, key: string) {
        if (!userId) return null;

        const fullKey = `${key}_${userId}`;

        try {
            const { data, error } = await supabase
                .from('kv_store_7c0f82ca')
                .select('value')
                .eq('key', fullKey)
                .maybeSingle();

            if (error) {
                console.warn(`⚠️ [Persistence] Load failed for ${fullKey}:`, error);
                return null;
            }

            return data?.value || null;
        } catch (e) {
            console.error(`❌ [Persistence] Exception loading ${fullKey}:`, e);
            return null;
        }
    }
};
