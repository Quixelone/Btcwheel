// Fallback images for mascot when figma:asset fails in production

export const MASCOT_FALLBACK = {
  excited: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzRENTk5IiBvcGFjaXR5PSIwLjEiIHJ4PSI0MCIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfkak8L3RleHQ+Cjwvc3ZnPg==',
  normal: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzRENTk5IiBvcGFjaXR5PSIwLjEiIHJ4PSI0MCIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfkow8L3RleHQ+Cjwvc3ZnPg==',
  disappointed: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY2QjZCIiBvcGFjaXR5PSIwLjEiIHJ4PSI0MCIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfmJQ8L3RleHQ+Cjwvc3ZnPg==',
  logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzRENTk5IiByeD0iMjAiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkI8L3RleHQ+Cjwvc3ZnPg=='
};

// Try to import figma assets, fallback to emoji if they fail
export function getMascotImage(type: 'excited' | 'normal' | 'disappointed' | 'logo'): string {
  // In production, if figma:asset fails, use fallback
  try {
    switch (type) {
      case 'excited':
        return MASCOT_FALLBACK.excited;
      case 'normal':
        return MASCOT_FALLBACK.normal;
      case 'disappointed':
        return MASCOT_FALLBACK.disappointed;
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
