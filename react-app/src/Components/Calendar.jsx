//npm install date-fns date-fns-tz

import React, { useState, useEffect, useMemo } from 'react';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Szűrés és Időzóna állapotok
  const [filterCurrency, setFilterCurrency] = useState('All');
  const [filterImpact, setFilterImpact] = useState('All');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Óra frissítése másodpercenként
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Adatlekérés
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(process.env.BACKEND_URL + '/api/events');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Segédfüggvények a formázáshoz
  const formatTime = (date, tz, includeSeconds = false) => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: false
    }).format(new Date(date));
  };

  const formatDate = (date, tz) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Szűrés
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchCurrency = filterCurrency === 'All' || event.country === filterCurrency;
      const matchImpact = filterImpact === 'All' || event.impact === filterImpact;
      return matchCurrency && matchImpact;
    });
  }, [events, filterCurrency, filterImpact]);

  // Valuta lista a lenyíló menühöz
  const currencies = useMemo(() => 
    ['All', ...new Set(events.map(e => e.country))].sort(), 
    [events]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Kezelőfelület */}
      <header>
        <div>
          <label>Timezone: </label>
          <select value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
            <option value="UTC">UTC</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Budapest">Budapest</option>
            <option value="America/New_York">New York</option>
          </select>

          <label> Currency: </label>
          <select value={filterCurrency} onChange={(e) => setFilterCurrency(e.target.value)}>
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label> Impact: </label>
          <select value={filterImpact} onChange={(e) => setFilterImpact(e.target.value)}>
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div style={{ marginTop: '10px' }}>
          <strong>Current Market Time: {formatTime(currentTime, timeZone, true)}</strong>
        </div>
      </header>

      <hr />

      {/* Táblázat */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Currency</th>
            <th>Impact</th>
            <th>Name</th>
            <th>Actual</th>
            <th>Forecast</th>
            <th>Previous</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event) => (
            <tr key={event.id}>
              <td>{formatDate(event.date, timeZone)}</td>
              <td>{formatTime(event.date, timeZone)}</td>
              <td>{event.country}</td>
              <td>{event.impact}</td>
              <td>{event.title}</td>
              <td>{event.actual || '-'}</td>
              <td>{event.forecast || '-'}</td>
              <td>{event.previous || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredEvents.length === 0 && <p>No events match the filters.</p>}
    </div>
  );
};

export default Calendar;