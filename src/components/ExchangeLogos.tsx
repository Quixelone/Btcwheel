// 🎨 Exchange Logos - Loghi reali degli exchange crypto
// Usa loghi ufficiali tramite URL diretti

interface ExchangeLogoProps {
  exchangeId: string;
  size?: number;
  className?: string;
}

// Mappa dei loghi ufficiali degli exchange
export const EXCHANGE_LOGOS: Record<string, string> = {
  // Loghi ufficiali tramite URL diretti
  binance: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg',
  bybit: 'https://cryptologos.cc/logos/bybit-logo.svg',
  kucoin: 'https://cryptologos.cc/logos/kucoin-token-kcs-logo.svg',
  bingx: 'https://images.unsplash.com/photo-1622570230304-a37c75da9d70?w=200',
  okx: 'https://cryptologos.cc/logos/okb-okb-logo.svg',
  deribit: 'https://images.unsplash.com/photo-1639603683079-7398c604497a?w=200',
  bitget: 'https://cryptologos.cc/logos/bitget-token-bgb-logo.svg',
};

// Colori brand degli exchange per il fallback
export const EXCHANGE_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  binance: { 
    bg: 'bg-yellow-500', 
    text: 'text-yellow-500',
    gradient: 'from-yellow-400 to-yellow-600'
  },
  bybit: { 
    bg: 'bg-orange-500', 
    text: 'text-orange-500',
    gradient: 'from-orange-400 to-orange-600'
  },
  kucoin: { 
    bg: 'bg-green-500', 
    text: 'text-green-500',
    gradient: 'from-green-400 to-green-600'
  },
  bingx: { 
    bg: 'bg-blue-600', 
    text: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-700'
  },
  okx: { 
    bg: 'bg-gray-900', 
    text: 'text-gray-900',
    gradient: 'from-gray-700 to-gray-900'
  },
  deribit: { 
    bg: 'bg-purple-600', 
    text: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-700'
  },
  bitget: { 
    bg: 'bg-cyan-500', 
    text: 'text-cyan-500',
    gradient: 'from-cyan-400 to-cyan-600'
  },
};

export function ExchangeLogo({ exchangeId, size = 40, className = '' }: ExchangeLogoProps) {
  const logoUrl = EXCHANGE_LOGOS[exchangeId.toLowerCase()];
  const colors = EXCHANGE_COLORS[exchangeId.toLowerCase()] || { 
    bg: 'bg-gray-500', 
    text: 'text-gray-500',
    gradient: 'from-gray-400 to-gray-600'
  };

  // Abbreviazione per fallback
  const getAbbreviation = (id: string) => {
    const abbrevs: Record<string, string> = {
      binance: 'BN',
      bybit: 'BY',
      kucoin: 'KC',
      bingx: 'BX',
      okx: 'OX',
      deribit: 'DB',
      bitget: 'BG',
    };
    return abbrevs[id.toLowerCase()] || id.substring(0, 2).toUpperCase();
  };

  return (
    <div 
      className={`rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logoUrl}
        alt={`${exchangeId} logo`}
        className="w-full h-full object-contain p-1"
        onError={(e) => {
          // Fallback con abbreviazione se l'immagine non carica
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.className = `${parent.className} bg-gradient-to-br ${colors.gradient}`;
            parent.innerHTML = `<span class="text-white font-bold" style="font-size: ${size * 0.4}px">${getAbbreviation(exchangeId)}</span>`;
          }
        }}
      />
    </div>
  );
}

// Componente per mostrare logo + nome
interface ExchangeCardLogoProps {
  exchangeId: string;
  name: string;
  size?: number;
  showName?: boolean;
  className?: string;
}

export function ExchangeCardLogo({ 
  exchangeId, 
  name, 
  size = 48, 
  showName = true,
  className = '' 
}: ExchangeCardLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ExchangeLogo exchangeId={exchangeId} size={size} />
      {showName && (
        <div>
          <p className="text-gray-900 font-semibold">{name}</p>
          <p className="text-xs text-gray-500 uppercase">{exchangeId}</p>
        </div>
      )}
    </div>
  );
}
