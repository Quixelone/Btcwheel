// Fallback images for mascot when figma:asset fails in production

export const MASCOT_FALLBACK = {
  excited: '/mascot-excited.png',
  normal: '/mascot-normal.png',
  disappointed: '/mascot-disappointed.png',
  thinking: '/mascot-thinking.png',
  logo: '/logo.svg'
};

// Try to import figma assets, fallback to emoji if they fail
export function getMascotImage(type: 'excited' | 'normal' | 'disappointed' | 'thinking' | 'logo'): string {
  // In production, if figma:asset fails, use fallback
  try {
    switch (type) {
      case 'excited':
        return MASCOT_FALLBACK.excited;
      case 'normal':
        return MASCOT_FALLBACK.normal;
      case 'disappointed':
        return MASCOT_FALLBACK.disappointed;
      case 'thinking':
        return MASCOT_FALLBACK.thinking;
      case 'logo':
        return MASCOT_FALLBACK.logo;
      default:
        return MASCOT_FALLBACK.normal;
    }
  } catch (error) {
    console.error('Failed to load mascot image:', error);
    return MASCOT_FALLBACK.normal;
  }
}
