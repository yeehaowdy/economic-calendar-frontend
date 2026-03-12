import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import './Home.css';

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="home-wrapper">

      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>

      <section className="home-hero">
        <div className="hero-content">
          <div className="status-badge">● PLATFORM LIVE</div>
          <h1 className="hero-title">
            NAVIGATE THE <br />
            <span>FINANCIAL MARKETS</span>
          </h1>
          <p className="hero-subtitle">
            Real-time data, economic insights, and market analysis in one minimalist platform.
          </p>
          <div className="hero-actions">
            <Link to="/markets" className="home-btn-primary">View Markets</Link>
            <Link to="/calendar" className="home-btn-secondary">Economic Calendar</Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="feature-grid">
          <Link to="/calendar" className="feature-card">
            <div className="feature-number">01</div>
            <h3>Economic Calendar</h3>
            <p>Stay ahead of high-impact global events and economic indicators.</p>
            <span className="feature-link">Explore events</span>
          </Link>

          <Link to="/markets" className="feature-card">
            <div className="feature-number">02</div>
            <h3>Live Markets</h3>
            <p>Track stocks, crypto, and indices with real-time price updates.</p>
            <span className="feature-link">Check prices</span>
          </Link>

          <Link to="/news" className="feature-card">
            <div className="feature-number">03</div>
            <h3>Market News</h3>
            <p>Breaking financial news and deep dives into market trends.</p>
            <span className="feature-link">Read news</span>
          </Link>
        </div>
      </section>

      <section className="home-cta">
        <div className="cta-card">
          <div className="cta-content">
            <h2 className="cta-title">READY TO SYNC?</h2>
            <p className="cta-text">
              {user 
                ? "You are part of the network. Access your personalized dashboard and profile." 
                : "Join our community to track your favorite assets and get personalized market updates."}
            </p>
          </div>
          <div className="cta-action">
            <Link 
              to={user ? "/profile" : "/login"} 
              className="home-btn-primary join-btn"
            >
              {user ? "GO TO PROFILE" : "JOIN THE NETWORK"}
            </Link>
          </div>
        </div>
      </section>

      <section className="home-info">
        <div className="feature-grid">
        
          <div className="feature-card">
            <h3>Symbols</h3>
            <p>40+ symbols tracked in real-time</p>
          </div>

          <div className="feature-card">
            <h3>Data Sources</h3>
            <p>ForexFactory.com, FinnHub.io, NewsAPI.org</p>
          </div>

          <div className="feature-card">
            <h3>Developers</h3>
            <p>
              <strong>Botond Terenyi, Levente Tarjányi, and Roland Papp</strong> — The core engineering team driving the platform's development.
            </p>
          </div>
        </div>
      </section>

      <section className="manifesto-card">
        <div className="manifesto-box">
          <h3 className="manifesto-title">The Insight Manifesto</h3>
          <p className="manifesto-quote">
            "In a world of infinite data, <span>clarity</span> is the ultimate edge."
          </p>
          <div className="manifesto-line"></div>
        </div>
      </section>

      <footer className="footer-info">
        <div className="footer-line"></div>
        <div className="footer-content">
          <p>Questions? <span>support@insight.com</span></p>
          <p>© 2026 INSIGHT LABS</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;