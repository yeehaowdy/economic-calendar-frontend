import React, { useState, useEffect, useMemo } from 'react';
import './Calendar.css';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [filterCurrency, setFilterCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem('mo-filter-currency');
      return saved ? JSON.parse(saved) : ['All'];
    } catch { return ['All']; }
  });
  
  const [filterImpact, setFilterImpact] = useState(() => {
    try {
      const saved = localStorage.getItem('mo-filter-impact');
      return saved ? JSON.parse(saved) : ['All'];
    } catch { return ['All']; }
  });
  
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem('mo-timezone') || 'Europe/Budapest');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('mo-filter-currency', JSON.stringify(filterCurrency));
    localStorage.setItem('mo-filter-impact', JSON.stringify(filterImpact));
    localStorage.setItem('mo-timezone', timeZone);
  }, [filterCurrency, filterImpact, timeZone]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/calendar`)
      .then(res => res.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
      console.error("Hiba:", err);
      setLoading(false);
    });
  }, []);

  const handleToggleFilter = (value, currentList, setList) => {
    if (value === 'All') {
      setList(['All']);
    } else {
      let newList = currentList.filter(item => item !== 'All');
      if (newList.includes(value)) {
        newList = newList.filter(item => item !== value);
        if (newList.length === 0) newList = ['All'];
      } else {
        newList = [...newList, value];
      }
      setList(newList);
    }
  };

  const handleClearFilters = () => {
    setFilterCurrency(['All']);
    setFilterImpact(['All']);
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const isSameDay = e.date?.startsWith(selectedDate);
      const matchCur = filterCurrency.includes('All') || filterCurrency.includes(e.country);
      const matchImp = filterImpact.includes('All') || (e.impact && filterImpact.includes(e.impact));
      return isSameDay && matchCur && matchImp;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, filterCurrency, filterImpact, selectedDate]);

  const currencies = useMemo(() => {
  const otherCountries = [...new Set(events.map(e => e.country).filter(c => c && c !== 'All'))].sort();
  return ['All', ...otherCountries];
  }, [events]);

  if (loading) return <div className="mo-syncing">SYNCING...</div>;

  return (
    <div className="calendar-wrapper">
      {/* Sötétítő réteg */}
      {showFilters && <div className="mo-overlay" onClick={() => setShowFilters(false)}></div>}

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
                <option value="Europe/London">(UTC) London</option>
                <option value="Europe/Budapest">(UTC+1) Budapest</option>
                <option value="America/New_York">(UTC-5) New York</option>
              </select>
            </div>
          </div>
          <button className="mo-btn-filter" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'CLOSE' : 'FILTERS'}
          </button>
        </div>

        <div className={`mo-filter-drawer ${showFilters ? 'open' : ''}`}>
          <div className="mo-grid">
            <div className="mo-group">
              <label>Currencies</label>
              <div className="mo-checkbox-list">
                {currencies.map(c => (
                  <label key={c} className={`mo-chip ${filterCurrency.includes(c) ? 'active' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={filterCurrency.includes(c)}
                      onChange={() => handleToggleFilter(c, filterCurrency, setFilterCurrency)}
                      className="mo-hidden-checkbox"
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mo-group">
              <label>Impact</label>
              <div className="mo-checkbox-list">
                {['All', 'High', 'Medium', 'Low'].map(imp => (
                  <label 
                    key={imp} 
                    className={`mo-chip mo-chip-${imp.toLowerCase()} ${filterImpact.includes(imp) ? 'active' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={filterImpact.includes(imp)}
                      onChange={() => handleToggleFilter(imp, filterImpact, setFilterImpact)}
                      className="mo-hidden-checkbox"
                    />
                    <span>{imp}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mo-filter-footer">
            <button className="mo-btn-clear" onClick={handleClearFilters}>Clear All Filters</button>
          </div>
        </div>
      </header>

      <main className="mo-list-container">
        
        
        <div className="mo-day-group">
          <div className="mo-day-header">
            {new Intl.DateTimeFormat('en-GB', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(selectedDate))}
          </div>
          <div className="mo-pagination-group">
            <button className="mo-btn-action mo-btn-secondary" onClick={() => {
              const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]);
            }}>Previous</button>
            <button className="mo-btn-action mo-btn-secondaryToday" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>Today</button>
            <button className="mo-btn-action" onClick={() => {
              const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]);
            }}>Next</button>
          </div>

          {filteredEvents.length > 0 ? filteredEvents.map(e => (
            <div className="mo-row" key={e.id || Math.random()}>
              <div className="mo-time-col">
                <div className="mo-time">{new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }).format(new Date(e.date))}</div>
              </div>
              <div className="mo-info-col">
                <span className="mo-currency">{e.country}</span>
                <span className="mo-level-text" style={{
                  color: e.impact === 'High' ? '#ff0000' : e.impact === 'Medium' ? '#e89b00' : '#09b537'
                }}>{e.impact || 'Low'}</span>
              </div>
              <div className="mo-event-title">{e.title}</div>
              <div className="mo-data-group">
                <div className="mo-data-item"><span className="mo-data-label">ACT</span><span className="mo-data-val mo-bold">{e.actual || '—'}</span></div>
                <div className="mo-data-item"><span className="mo-data-label">FOR</span><span className="mo-data-val">{e.forecast || '—'}</span></div>
                <div className="mo-data-item"><span className="mo-data-label">PREV</span><span className="mo-data-val">{e.previous || '—'}</span></div>
              </div>
            </div>
          )) : (
            <div className="mo-no-events">No events for this day.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Calendar;