import React, { useState, useEffect } from 'react';
import './News.css';
import '../Spinner.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem('market_data_cache');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/news?page=${currentPage}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setNews(data.data || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, [currentPage, API_URL]);

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
    <div className="news-wrapper">

      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>

      <header className="news-header">
        <h1 className="news-title">MARKET <span>INSIGHTS</span></h1>
        <p className="news-subtitle">Latest economic updates and high-impact news</p>
      </header>

      
      <div className="ticker-container">
        <div className="ticker-wrapper">
          {stocks.concat(stocks).map((stock, index) => (
            <div key={index} className="ticker-item">
              <span className="ticker-symbol">
                {stock.symbol === 'SPY' ? 'S&P 500' : stock.symbol === 'DIA' ? 'DOW JONES' : stock.symbol === 'QQQ' ? 'NASDAQ' : stock.symbol}
              </span>
              <span className={`ticker-value ${stock.direction}`}>
                <span className="ticker-arrow">{stock.direction === 'up' ? '↗' : '↘'}</span>
                {stock.pc ? `${stock.pc > 0 ? '+' : ''}${stock.pc.toFixed(2)}%` : '0.00%'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="news-grid">
        {news.length > 0 ? news.map((item) => (
          <article className="news-card" key={item.id}>
            {item.image && (
              <div className="news-card-image">
                <img src={item.image} alt={item.title} />
              </div>
            )}
            <div className="news-card-content">
              <div className="news-card-meta">
                <span className={`news-tag tag-${item.relatedCurrency?.toLowerCase()}`}>
                  {item.relatedCurrency || 'GLOBAL'}
                </span>
                <span className="news-date">
                  {new Date(item.pubDate).toLocaleDateString('en-GB', { 
                    day: '2-digit', month: 'short', year: 'numeric' 
                  }).toUpperCase()}
                </span>
              </div>
              <h2 className="news-card-title">{item.title}</h2>
              <p className="news-card-desc">
                {item.description ? item.description.substring(0, 120) + '...' : 'No description available.'}
              </p>
              <div className="news-card-footer">
                <span className="news-source">{item.source}</span>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-read-more">
                  READ ARTICLE
                </a>
              </div>
            </div>
          </article>
        )) : (
          <div className="mo-no-news">No market news found in the database.</div>
        )}
      </main>

      <div className="pagination-bar">
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(prev => prev - 1)}
          className="page-btn"
        >
          PREVIOUS
        </button>
        <span className="page-info">{currentPage} / {totalPages}</span>
        <button 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="page-btn"
        >
          NEXT
        </button>
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

export default News;