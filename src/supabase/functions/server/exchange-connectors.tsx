// 🔌 Exchange API Connectors per Bitcoin Wheel Strategy
// Supporta: Binance, Bybit, Kucoin, Bingx, OKX, Deribit, Bitget

interface Trade {
  id: string;
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'option' | 'spot' | 'future';
  optionType?: 'call' | 'put';
  price: number;
  quantity: number;
  premium?: number;
  strike?: number;
  expiry?: string;
  timestamp: number;
  fee?: number;
}

interface ExchangeConnector {
  name: string;
  getTrades: (apiKey: string, apiSecret: string, startDate?: Date, endDate?: Date) => Promise<Trade[]>;
  getOptionTrades?: (apiKey: string, apiSecret: string, startDate?: Date, endDate?: Date) => Promise<Trade[]>;
  testConnection: (apiKey: string, apiSecret: string) => Promise<boolean>;
}

// 🔐 Helper per firma HMAC SHA256
async function createSignature(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 📡 BINANCE CONNECTOR
export const BinanceConnector: ExchangeConnector = {
  name: 'Binance',
  
  async getTrades(apiKey: string, apiSecret: string, startDate?: Date, endDate?: Date): Promise<Trade[]> {
    const timestamp = Date.now();
    const params = new URLSearchParams({
      timestamp: timestamp.toString(),
      recvWindow: '5000'
    });
    
    if (startDate) params.append('startTime', startDate.getTime().toString());
    if (endDate) params.append('endTime', endDate.getTime().toString());
    
    const signature = await createSignature(apiSecret, params.toString());
    params.append('signature', signature);
    
    const response = await fetch(`https://api.binance.com/api/v3/myTrades?${params}`, {
      headers: { 'X-MBX-APIKEY': apiKey }
    });
    
    if (!response.ok) throw new Error(`Binance API error: ${response.status}`);
    
    const data = await response.json();
    
    return data.map((trade: any) => ({
      id: trade.id.toString(),
      exchange: 'Binance',
      symbol: trade.symbol,
      side: trade.isBuyer ? 'buy' : 'sell',
      type: 'spot',
      price: parseFloat(trade.price),
      quantity: parseFloat(trade.qty),
      timestamp: trade.time,
      fee: parseFloat(trade.commission)
    }));
  },
  
  async testConnection(apiKey: string, apiSecret: string): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const params = `timestamp=${timestamp}&recvWindow=5000`;
      const signature = await createSignature(apiSecret, params);
      
      const response = await fetch(
        `https://api.binance.com/api/v3/account?${params}&signature=${signature}`,
        { headers: { 'X-MBX-APIKEY': apiKey } }
      );
      
      return response.ok;
    } catch {
      return false;
    }
  }
};

// 📡 BYBIT CONNECTOR
export const BybitConnector: ExchangeConnector = {
  name: 'Bybit',
  
  async getTrades(apiKey: string, apiSecret: string, startDate?: Date, endDate?: Date): Promise<Trade[]> {
    const timestamp = Date.now().toString();
    const params: Record<string, string> = {
      api_key: apiKey,
      timestamp: timestamp
    };
    
    if (startDate) params.start_time = startDate.getTime().toString();
    if (endDate) params.end_time = endDate.getTime().toString();
    
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    const signature = await createSignature(apiSecret, sortedParams);
    
    const response = await fetch(
      `https://api.bybit.com/v5/execution/list?${sortedParams}&sign=${signature}`,
      { headers: { 'X-BAPI-API-KEY': apiKey, 'X-BAPI-TIMESTAMP': timestamp } }
    );
    
    if (!response.ok) throw new Error(`Bybit API error: ${response.status}`);
    
    const data = await response.json();
    
    return data.result?.list?.map((trade: any) => ({
      id: trade.execId,
      exchange: 'Bybit',
      symbol: trade.symbol,
      side: trade.side.toLowerCase(),
      type: trade.category === 'option' ? 'option' : trade.category === 'spot' ? 'spot' : 'future',
      price: parseFloat(trade.execPrice),
      quantity: parseFloat(trade.execQty),
      timestamp: parseInt(trade.execTime),
      fee: parseFloat(trade.execFee || '0')
    })) || [];
  },
  
  async getOptionTrades(apiKey: string, apiSecret: string, startDate?: Date, endDate?: Date): Promise<Trade[]> {
    const timestamp = Date.now().toString();
    const params: Record<string, string> = {
      api_key: apiKey,
      timestamp: timestamp,
      category: 'option'
    };
    
    if (startDate) params.start_time = startDate.getTime().toString();
    if (endDate) params.end_time = endDate.getTime().toString();
    
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    const signature = await createSignature(apiSecret, sortedParams);
    
    const response = await fetch(
      `https://api.bybit.com/v5/execution/list?${sortedParams}&sign=${signature}`,
      { headers: { 'X-BAPI-API-KEY': apiKey, 'X-BAPI-TIMESTAMP': timestamp } }
    );
    
    if (!response.ok) throw new Error(`Bybit API error: ${response.status}`);
    
    const data = await response.json();
    
    return data.result?.list?.map((trade: any) => ({
      id: trade.execId,
      exchange: 'Bybit',
      symbol: trade.symbol,
      side: trade.side.toLowerCase(),
      type: 'option',
      optionType: trade.symbol.includes('C-') ? 'call' : 'put',
      price: parseFloat(trade.execPrice),
      quantity: parseFloat(trade.execQty),
      strike: parseFloat(trade.strikePrice || '0'),
      expiry: trade.symbol.split('-')[1],
      timestamp: parseInt(trade.execTime),
      fee: parseFloat(trade.execFee || '0')
    })) || [];
  },
  
  async testConnection(apiKey: string, apiSecret: string): Promise<boolean> {
    try {
      const timestamp = Date.now().toString();
      const params = `api_key=${apiKey}&timestamp=${timestamp}`;
      const signature = await createSignature(apiSecret, params);
      
      const response = await fetch(
        `https://api.bybit.com/v5/account/wallet-balance?${params}&sign=${signature}`,
        { headers: { 'X-BAPI-API-KEY': apiKey, 'X-BAPI-TIMESTAMP': timestamp } }
      );
      
      return response.ok;
    } catch {
      return false;
    }
  }
};

// 📡 KUCOIN CONNECTOR
export const KucoinConnector: ExchangeConnector = {
  name: 'Kucoin',
  
  async getTrades(apiKey: string, apiSecret: string, startDate?: Date, endDate?: Date): Promise<Trade[]> {
    const timestamp = Date.now().toString();
    const endpoint = '/api/v1/fills';
    const method = 'GET';
    
    let queryString = '';
    if (startDate) queryString += `?startAt=${Math.floor(startDate.getTime() / 1000)}`;
    if (endDate) queryString += `${queryString ? '&' : '?'}endAt=${Math.floor(endDate.getTime() / 1000)}`;
    
    const strToSign = timestamp + method + endpoint + queryString;
    const signature = await createSignature(apiSecret, strToSign);
    
    const response = await fetch(`https://api.kucoin.com${endpoint}${queryString}`, {
      headers: {
        'KC-API-KEY': apiKey,
        'KC-API-SIGN': signature,
        'KC-API-TIMESTAMP': timestamp,
        'KC-API-PASSPHRASE': await createSignature(apiSecret, 'your-passphrase'), // User needs to provide
        'KC-API-KEY-VERSION': '2'
      }
    });
    
    if (!response.ok) throw new Error(`Kucoin API error: ${response.status}`);
    
    const data = await response.json();
    
    return data.data?.items?.map((trade: any) => ({
      id: trade.tradeId,
      exchange: 'Kucoin',
      symbol: trade.symbol,
      side: trade.side,
      type: 'spot',
      price: parseFloat(trade.price),
      quantity: parseFloat(trade.size),
      timestamp: parseInt(trade.createdAt),
      fee: parseFloat(trade.fee)
    })) || [];
  },
  
  async testConnection(apiKey: string, apiSecret: string): Promise<boolean> {
    try {
      const timestamp = Date.now().toString();
      const endpoint = '/api/v1/accounts';
      const strToSign = timestamp + 'GET' + endpoint;
      const signature = await createSignature(apiSecret, strToSign);
      
      const response = await fetch(`https://api.kucoin.com${endpoint}`, {
        headers: {
          'KC-API-KEY': apiKey,
          'KC-API-SIGN': signature,
          'KC-API-TIMESTAMP': timestamp,
          'KC-API-KEY-VERSION': '2'
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
};

// 📡 BINGX CONNECTOR
export const BingxConnector: ExchangeConnector = {
  name: 'BingX',
  
  async getTrades(apiKey: string, apiSecret: string, startDate?: Date, endDate?: Date): Promise<Trade[]> {
    const timestamp = Date.now();
    const params = new URLSearchParams({
      timestamp: timestamp.toString()
    });
    
    if (startDate) params.append('startTime', startDate.getTime().toString());
    if (endDate) params.append('endTime', endDate.getTime().toString());
    
    const signature = await createSignature(apiSecret, params.toString());
    params.append('signature', signature);
    
    const response = await fetch(`https://open-api.bingx.com/openApi/spot/v1/trade/myTrades?${params}`, {
      headers: { 'X-BX-APIKEY': apiKey }
    });
    
    if (!response.ok) throw new Error(`BingX API error: ${response.status}`);
    
    const data = await response.json();
    
    return data.data?.map((trade: any) => ({
      id: trade.id.toString(),
      exchange: 'BingX',
      symbol: trade.symbol,
      side: trade.isBuyer ? 'buy' : 'sell',
      type: 'spot',
      price: parseFloat(trade.price),
      quantity: parseFloat(trade.qty),
      timestamp: trade.time,
      fee: parseFloat(trade.commission || '0')
    })) || [];
  },
  
  async testConnection(apiKey: string, apiSecret: string): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const params = `timestamp=${timestamp}`;
      const signature = await createSignature(apiSecret, params);
      
      const response = await fetch(
        `https://open-api.bingx.com/openApi/spot/v1/account/balance?${params}&signature=${signature}`,
        { headers: { 'X-BX-APIKEY': apiKey } }
      );
      
      return response.ok;
    } catch {
      return false;
    }
  }
};

// 📡 OKX CONNECTOR
export const OKXConnector: ExchangeConnector = {
  name: 'OKX',
  
  async getTrades(apiKey: string, apiSecret: string, startDate?: Date, endDate?: Date): Promise<Trade[]> {
    const timestamp = new Date().toISOString();
    const method = 'GET';
    const endpoint = '/api/v5/trade/fills';
    
    let queryString = '';
    if (startDate) queryString += `?begin=${startDate.getTime()}`;
    if (endDate) queryString += `${queryString ? '&' : '?'}end=${endDate.getTime()}`;
    
    const prehash = timestamp + method + endpoint + queryString;
    const signature = await createSignature(apiSecret, prehash);
    
    const response = await fetch(`https://www.okx.com${endpoint}${queryString}`, {
      headers: {
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': 'your-passphrase' // User needs to provide
      }
    });
    
    if (!response.ok) throw new Error(`OKX API error: ${response.status}`);
    
    const data = await response.json();
    
    return data.data?.map((trade: any) => ({
      id: trade.tradeId,
      exchange: 'OKX',
      symbol: trade.instId,
      side: trade.side,
      type: trade.instType === 'OPTION' ? 'option' : trade.instType === 'SPOT' ? 'spot' : 'future',
      price: parseFloat(trade.fillPx),
      quantity: parseFloat(trade.fillSz),
      timestamp: parseInt(trade.ts),
      fee: parseFloat(trade.fee)
    })) || [];
  },
  
  async testConnection(apiKey: string, apiSecret: string): Promise<boolean> {
    try {
      const timestamp = new Date().toISOString();
      const method = 'GET';
      const endpoint = '/api/v5/account/balance';
      const prehash = timestamp + method + endpoint;
      const signature = await createSignature(apiSecret, prehash);
      
      const response = await fetch(`https://www.okx.com${endpoint}`, {
        headers: {
          'OK-ACCESS-KEY': apiKey,
          'OK-ACCESS-SIGN': signature,
          'OK-ACCESS-TIMESTAMP': timestamp
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
};

// 📡 DERIBIT CONNECTOR (Specializzato in opzioni BTC/ETH)
export const DeribitConnector: ExchangeConnector = {
  name: 'Deribit',
  
  async getTrades(apiKey: string, apiSecret: string, startDate?: Date, endDate?: Date): Promise<Trade[]> {
    const timestamp = Date.now();
    const nonce = Math.floor(Math.random() * 1000000);
    const requestData = {
      jsonrpc: '2.0',
      id: nonce,
      method: 'private/get_user_trades_by_currency',
      params: {
        currency: 'BTC',
        kind: 'option',
        start_timestamp: startDate?.getTime() || Date.now() - 86400000,
        end_timestamp: endDate?.getTime() || Date.now()
      }
    };
    
    const signatureString = `${timestamp}\n${nonce}\n${JSON.stringify(requestData.params)}`;
    const signature = await createSignature(apiSecret, signatureString);
    
    const response = await fetch('https://www.deribit.com/api/v2/private/get_user_trades_by_currency', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `deri-hmac-sha256 id=${apiKey},ts=${timestamp},sig=${signature},nonce=${nonce}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) throw new Error(`Deribit API error: ${response.status}`);
    
    const data = await response.json();
    
    return data.result?.trades?.map((trade: any) => ({
      id: trade.trade_id,
      exchange: 'Deribit',
      symbol: trade.instrument_name,
      side: trade.direction,
      type: 'option',
      optionType: trade.instrument_name.includes('C-') ? 'call' : 'put',
      price: trade.price,
      quantity: trade.amount,
      strike: parseFloat(trade.instrument_name.split('-')[2]),
      expiry: trade.instrument_name.split('-')[1],
      premium: trade.price * trade.amount,
      timestamp: trade.timestamp,
      fee: trade.fee
    })) || [];
  },
  
  async getOptionTrades(apiKey: string, apiSecret: string, startDate?: Date, endDate?: Date): Promise<Trade[]> {
    return this.getTrades(apiKey, apiSecret, startDate, endDate);
  },
  
  async testConnection(apiKey: string, apiSecret: string): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const nonce = Math.floor(Math.random() * 1000000);
      const signatureString = `${timestamp}\n${nonce}\n`;
      const signature = await createSignature(apiSecret, signatureString);
      
      const response = await fetch('https://www.deribit.com/api/v2/private/get_account_summary', {
        method: 'GET',
        headers: {
          'Authorization': `deri-hmac-sha256 id=${apiKey},ts=${timestamp},sig=${signature},nonce=${nonce}`
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
};

// 📡 BITGET CONNECTOR
export const BitgetConnector: ExchangeConnector = {
  name: 'Bitget',
  
  async getTrades(apiKey: string, apiSecret: string, startDate?: Date, endDate?: Date): Promise<Trade[]> {
    const timestamp = Date.now().toString();
    const method = 'GET';
    const endpoint = '/api/spot/v1/trade/fills';
    
    let queryString = '';
    if (startDate) queryString += `?startTime=${startDate.getTime()}`;
    if (endDate) queryString += `${queryString ? '&' : '?'}endTime=${endDate.getTime()}`;
    
    const prehash = timestamp + method + endpoint + queryString;
    const signature = await createSignature(apiSecret, prehash);
    
    const response = await fetch(`https://api.bitget.com${endpoint}${queryString}`, {
      headers: {
        'ACCESS-KEY': apiKey,
        'ACCESS-SIGN': signature,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-PASSPHRASE': 'your-passphrase', // User needs to provide
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`Bitget API error: ${response.status}`);
    
    const data = await response.json();
    
    return data.data?.map((trade: any) => ({
      id: trade.tradeId,
      exchange: 'Bitget',
      symbol: trade.symbol,
      side: trade.side,
      type: 'spot',
      price: parseFloat(trade.priceAvg),
      quantity: parseFloat(trade.size),
      timestamp: parseInt(trade.cTime),
      fee: parseFloat(trade.fee || '0')
    })) || [];
  },
  
  async testConnection(apiKey: string, apiSecret: string): Promise<boolean> {
    try {
      const timestamp = Date.now().toString();
      const method = 'GET';
      const endpoint = '/api/spot/v1/account/assets';
      const prehash = timestamp + method + endpoint;
      const signature = await createSignature(apiSecret, prehash);
      
      const response = await fetch(`https://api.bitget.com${endpoint}`, {
        headers: {
          'ACCESS-KEY': apiKey,
          'ACCESS-SIGN': signature,
          'ACCESS-TIMESTAMP': timestamp,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
};

// 🎯 Registry di tutti i connettori
export const EXCHANGE_CONNECTORS: Record<string, ExchangeConnector> = {
  binance: BinanceConnector,
  bybit: BybitConnector,
  kucoin: KucoinConnector,
  bingx: BingxConnector,
  okx: OKXConnector,
  deribit: DeribitConnector,
  bitget: BitgetConnector
};

// 🔧 Helper function per recuperare i trade da un exchange
export async function getExchangeTrades(
  exchangeName: string,
  apiKey: string,
  apiSecret: string,
  startDate?: Date,
  endDate?: Date
): Promise<Trade[]> {
  const connector = EXCHANGE_CONNECTORS[exchangeName.toLowerCase()];
  if (!connector) {
    throw new Error(`Exchange ${exchangeName} non supportato`);
  }
  
  return await connector.getTrades(apiKey, apiSecret, startDate, endDate);
}

// 🔧 Helper per testare connessione
export async function testExchangeConnection(
  exchangeName: string,
  apiKey: string,
  apiSecret: string
): Promise<boolean> {
  const connector = EXCHANGE_CONNECTORS[exchangeName.toLowerCase()];
  if (!connector) {
    throw new Error(`Exchange ${exchangeName} non supportato`);
  }
  
  return await connector.testConnection(apiKey, apiSecret);
}
