import type { Plugin } from 'vite';

export function figmaAssetsPlugin(): Plugin {
  const FIGMA_ASSET_PREFIX = 'figma:asset/';
  
  return {
    name: 'vite-plugin-figma-assets',
    enforce: 'pre',
    
    resolveId(source) {
      if (source.startsWith(FIGMA_ASSET_PREFIX)) {
        // Extract the filename from figma:asset/filename.png
        const filename = source.slice(FIGMA_ASSET_PREFIX.length);
        // Return a special marker that we'll handle in load
        return '\0figma-asset:' + filename;
      }
    },
    
    load(id) {
      if (id.startsWith('\0figma-asset:')) {
        const filename = id.slice('\0figma-asset:'.length);
        
        // In production/build: return a placeholder or fallback
        // This prevents build errors when figma assets don't exist
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
          console.warn(`[figma-assets] Figma asset not found in production: ${filename}. Using fallback.`);
          // Return a data URL placeholder or use a public asset
          return `export default '/favicon.png'`;
        }
        
        // In development: try to resolve the asset
        return `export default new URL('./${filename}', import.meta.url).href`;
      }
    }
  };
}