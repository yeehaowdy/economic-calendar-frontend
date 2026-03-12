import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import './Markets.css';
import '../Spinner.css';

const Markets = () => {
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem('market_data_cache');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(stocks.length === 0);
  const [searchTerm, setSearchTerm] = useState('');

  const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

  const symbols = [
    { sym: 'SPY', type: 'stock', display: 'S&P 500' }, 
    { sym: 'QQQ', type: 'stock', display: 'NASDAQ 100' },
    { sym: 'DIA', type: 'stock', display: 'DOW JONES' },
    { sym: 'AAPL', type: 'stock' }, { sym: 'NVDA', type: 'stock' }, { sym: 'MSFT', type: 'stock' },
    { sym: 'AMZN', type: 'stock' }, { sym: 'TSLA', type: 'stock' }, { sym: 'META', type: 'stock' },
    { sym: 'GOOGL', type: 'stock' }, { sym: 'NFLX', type: 'stock' }, { sym: 'ADBE', type: 'stock' },
    { sym: 'AMD', type: 'stock' }, { sym: 'PYPL', type: 'stock' }, { sym: 'INTC', type: 'stock' },
    { sym: 'BINANCE:BTCUSDT', display: 'BTC/USD', type: 'crypto' },
    { sym: 'BINANCE:ETHUSDT', display: 'ETH/USD', type: 'crypto' },
    { sym: 'BINANCE:BNBUSDT', display: 'BNB/USD', type: 'crypto' },
    { sym: 'BINANCE:SOLUSDT', display: 'SOL/USD', type: 'crypto' },
    { sym: 'BINANCE:XRPUSDT', display: 'XRP/USD', type: 'crypto' },
    { sym: 'BINANCE:AVAXUSDT', display: 'AVAX/USD', type: 'crypto' },
    { sym: 'IWM', type: 'stock' }, { sym: 'VXX', type: 'stock' }, { sym: 'GLD', type: 'stock' },
    { sym: 'SLV', type: 'stock' }, { sym: 'USO', type: 'stock' }, { sym: 'TLT', type: 'stock' },
    { sym: 'COST', type: 'stock' }, { sym: 'PEP', type: 'stock' }, { sym: 'KO', type: 'stock' },
    { sym: 'JPM', type: 'stock' }, { sym: 'V', type: 'stock' }, { sym: 'MA', type: 'stock' },
    { sym: 'WMT', type: 'stock' }, { sym: 'DIS', type: 'stock' }, { sym: 'NKE', type: 'stock' },
    { sym: 'PFE', type: 'stock' }, { sym: 'XOM', type: 'stock' }
  ];

  const fetchStockData = useCallback(async () => {
  try {
    const results = [];
    for (const item of symbols) {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${item.sym}&token=${FINNHUB_KEY}`);
      const data = await res.json();
      
      if (data.c) {
        results.push({
          symbol: item.display || item.sym.replace('BINANCE:', '').replace('USDT', ''),
          originalSymbol: item.sym,
          current: data.c,
          pc: data.dp,
          high: data.h,
          low: data.l,
          open: data.o,
          direction: data.dp >= 0 ? 'up' : 'down',
          chartData: [ { p: data.o }, { p: data.l }, { p: data.h }, { p: data.c } ]
        });
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (results.length > 0) {
      setStocks(results);
      localStorage.setItem('market_data_cache', JSON.stringify(results));
    }
    setLoading(false);
      } catch (err) {
        console.error("Market data error:", err);
        setLoading(false);
      }
    }, [FINNHUB_KEY]);

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 65000); 
    return () => clearInterval(interval);
  }, [fetchStockData]);

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="mo-sync-container">
        <div className="mo-sync-content">
          <div className="mo-sync-spinner"></div>
          <div className="mo-syncing-text">LOADING</div>
        </div>
      </div>
    );
  }

  return (
    <div className="market-wrapper">

      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>

      <header className="market-header">
        <div className="market-header-content">
          <h1 className="market-title">LIVE <span>MARKET DATA</span></h1>
          <p className="market-subtitle">Real-time quotes and daily performance</p>
        </div>
        <div className="market-search">
          <input 
            type="text" 
            placeholder="SEARCH..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="market-search-input"
          />
        </div>
      </header>

      <div className="market-grid">
        {filteredStocks.length > 0 ? (
          filteredStocks.map((stock, index) => (
            <div 
              className={`market-card ${stock.direction}`} 
              key={index} 
              onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=${stock.originalSymbol}`, '_blank')}
            >
              <div className="market-card-top">
                <span className="market-card-symbol">{stock.symbol}</span>
                <span className={`market-card-badge ${stock.direction}`}>
                  {stock.direction === 'up' ? '↗' : '↘'} {Math.abs(stock.pc).toFixed(2)}%
                </span>
              </div>
              
              <div className="market-card-main">
                <div className="market-card-chart" style={{ height: '60px', marginTop: '15px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stock.chartData}>
                      <YAxis domain={['dataMin', 'dataMax']} hide />
                      <Line 
                        type="monotone" 
                        dataKey="p" 
                        stroke={stock.direction === 'up' ? '#10b981' : '#ef4444'} 
                        strokeWidth={2} 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="market-price-label">CURRENT PRICE</div>
                <div className="market-price-value">
                  ${stock.current?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="market-card-stats">
                <div className="market-stat-item">
                  <span className="stat-label">HIGH</span>
                  <span className="stat-value">${stock.high?.toFixed(2)}</span>
                </div>
                <div className="market-stat-item">
                  <span className="stat-label">LOW</span>
                  <span className="stat-value">${stock.low?.toFixed(2)}</span>
                </div>
                <div className="market-stat-item">
                  <span className="stat-label">OPEN</span>
                  <span className="stat-value">${stock.open?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="market-no-results">
            <h3>NO ASSETS FOUND</h3>
            <p>Try searching for a different symbol or name.</p>
          </div>
        )}
      </div>
      <footer className="footer-info">
        <div className="footer-line"></div>
        <div className="footer-content">
          <p>Questions? support@insight.com</p>
          <p>© 2026 INSIGHT LABS</p>
        </div>
      </footer>
    </div>
  );
};

export default Markets;