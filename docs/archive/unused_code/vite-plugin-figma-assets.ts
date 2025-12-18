import type { Plugin } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        // Return the relative path to the asset
        // Vite will handle this as a regular asset import
        return `export default new URL('./${filename}', import.meta.url).href`;
      }
    }
  };
}
