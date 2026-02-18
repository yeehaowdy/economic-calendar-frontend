import React, { useState, useEffect, useMemo } from 'react';
import './Calendar.css';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [daysToShow, setDaysToShow] = useState(1); 
  const [currentTime, setCurrentTime] = useState(new Date());

  const [filterCurrency, setFilterCurrency] = useState(() => {
      return localStorage.getItem('mo-filter-currency') || 'All';
    });
  
    const [filterImpact, setFilterImpact] = useState(() => {
      return localStorage.getItem('mo-filter-impact') || 'All';
    });
  
    const [timeZone, setTimeZone] = useState(() => {
      return localStorage.getItem('mo-timezone') || 'Europe/Budapest';
    });
  
    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);
  
    useEffect(() => {
      localStorage.setItem('mo-filter-currency', filterCurrency);
    }, [filterCurrency]);
  
    useEffect(() => {
      localStorage.setItem('mo-filter-impact', filterImpact);
    }, [filterImpact]);
  
    useEffect(() => {
      localStorage.setItem('mo-timezone', timeZone);
    }, [timeZone]);

  useEffect(() => {
    fetch("http://localhost:3000/api/calendar")
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const groupedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    const todayStr = new Date().toISOString().split('T')[0];
    
    const uniqueDays = [...new Set(sorted
      .map(e => e.date?.split('T')[0])
      .filter(d => d >= todayStr)
    )].slice(0, daysToShow);

    const result = {};
    uniqueDays.forEach(day => {
      result[day] = sorted.filter(e => {
        const isSameDay = e.date?.startsWith(day);
        const matchCur = filterCurrency === 'All' || e.country === filterCurrency;
        const matchImp = filterImpact === 'All' || e.impact?.toLowerCase() === filterImpact.toLowerCase();
        return isSameDay && matchCur && matchImp;
      });
    });
    return result;
  }, [events, filterCurrency, filterImpact, daysToShow]);

  const currencies = ['All', ...new Set(events.map(e => e.country).filter(Boolean))].sort();

  if (loading) return <div style={{padding: '120px', textAlign: 'center', fontWeight: 800, color: '#000'}}>SYNCING...</div>;

  return (
    <div className="calendar-wrapper">
      <header className="mo-header">
        <div className="mo-header-inner">
          <div className="mo-logo-group">
            <div className="mo-logo">Economic Calendar</div>
            <div className="mo-time-switcher">
              <span className="mo-market-time">
                {new Intl.DateTimeFormat('en-GB', {
                  timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit'
                }).format(currentTime)}
              </span>
              <select className="mo-tz-select" value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
                <option value="Europe/Budapest">CET</option>
                <option value="Europe/London">GMT</option>
                <option value="America/New_York">EST</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
          <button className="mo-btn-filter" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'CLOSE' : 'FILTERS'}
          </button>
        </div>
        
        {/* FILTERS POSITIONED FIXED BELOW HEADER */}
        <div className={`mo-filter-drawer ${showFilters ? 'open' : ''}`}>
          <div className="mo-grid">
            <div className="mo-group">
              <label>Currency</label>
              <select className="mo-select" value={filterCurrency} onChange={(e) => setFilterCurrency(e.target.value)}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mo-group">
              <label>Impact</label>
              <select className="mo-select" value={filterImpact} onChange={(e) => setFilterImpact(e.target.value)}>
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="mo-list-container">
        {Object.keys(groupedEvents).map(day => (
          <div key={day} className="mo-day-group">
            <div className="mo-day-header">
              {new Intl.DateTimeFormat('en-GB', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(day))}
            </div>
            {groupedEvents[day].length > 0 ? groupedEvents[day].map(e => (
              <div className="mo-row" key={e.id}>
                <div className="mo-time-col">
                  <div className="mo-time">{new Intl.DateTimeFormat('en-GB', {timeZone, hour:'2-digit', minute:'2-digit'}).format(new Date(e.date))}</div>
                </div>
                <div className="mo-info-col">
                  <span className="mo-currency">{e.country}</span>
                  <span className="mo-level-text" style={{ color:
                    e.impact === 'High' ? '#ff0000' : e.impact === 'Medium' ? '#e89b00' : '#09b537'
                  }}>{e.impact || 'Low'}</span>
                </div>
                <div className="mo-event-title">
                  {e.title}
                </div>
                <div className="mo-data-group">
                  <div className="mo-data-item">
                    <span className="mo-data-label">ACT</span>
                    <span className="mo-data-val mo-bold">{e.actual || '—'}</span>
                  </div>
                  <div className="mo-data-item">
                    <span className="mo-data-label">FOR</span>
                    <span className="mo-data-val">{e.forecast || '—'}</span>
                  </div>
                  <div className="mo-data-item">
                    <span className="mo-data-label">PREV</span>
                    <span className="mo-data-val">{e.previous || '—'}</span>
                  </div>
                </div>
              </div>
            )) : <div style={{textAlign: 'center', padding: '20px', fontSize: '11px', color: '#999'}}>No events for this day.</div>}
          </div>
        ))}

        <div className="mo-pagination-group" style={{margin: '0 auto'}}>
          <button className="mo-btn-action" onClick={() => setDaysToShow(prev => prev + 1)}>
            Show More
          </button>
          {daysToShow > 1 && (
            <button className="mo-btn-action mo-btn-secondary" onClick={() => setDaysToShow(prev => Math.max(1, prev - 1))}>
              Show Less
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Calendar;