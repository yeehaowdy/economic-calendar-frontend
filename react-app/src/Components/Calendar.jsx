import React, { useState, useMemo } from 'react';

const EconomicCalendar = () => {
  // Mock Data: In production, 'timestamp' should be UTC ISO string from your DB
  const initialData = [
    { id: 1, timestamp: '2026-02-05T13:30:00Z', currency: 'USD', title: 'Initial Jobless Claims', impact: 'High', forecast: '215K', previous: '220K' },
    { id: 2, timestamp: '2026-02-05T14:45:00Z', currency: 'EUR', title: 'ECB Press Conference', impact: 'High', forecast: '-', previous: '-' },
    { id: 3, timestamp: '2026-02-06T09:00:00Z', currency: 'GBP', title: 'GDP MoM', impact: 'Medium', forecast: '0.2%', previous: '0.1%' },
    { id: 4, timestamp: '2026-02-06T10:00:00Z', currency: 'EUR', title: 'CPI Flash Estimate', impact: 'Medium', forecast: '2.4%', previous: '2.5%' },
  ];

  // States
  const [currencyFilter, setCurrencyFilter] = useState('All');
  const [impactFilter, setImpactFilter] = useState('All');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Timezone list (Common ones, but you can add more)
  const timezones = [
    { label: 'UTC', value: 'UTC' },
    { label: 'London (GMT)', value: 'Europe/London' },
    { label: 'New York (EST/EDT)', value: 'America/New_York' },
    { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
    { label: 'Local Time', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
  ];

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return initialData.filter(event => {
      const matchCurrency = currencyFilter === 'All' || event.currency === currencyFilter;
      const matchImpact = impactFilter === 'All' || event.impact === impactFilter;
      return matchCurrency && matchImpact;
    });
  }, [currencyFilter, impactFilter]);

  // Formatting Helper for Time/Date based on selected Zone
  const formatDateTime = (timestamp, zone) => {
    const dateObj = new Date(timestamp);
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric', timeZone: zone };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: zone };

    return {
      date: new Intl.DateTimeFormat('en-US', dateOptions).format(dateObj),
      time: new Intl.DateTimeFormat('en-GB', timeOptions).format(dateObj),
    };
  };

  const getImpactColor = (impact) => {
    if (impact === 'High') return '#e74c3c';
    if (impact === 'Medium') return '#f39c12';
    return '#27ae60';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif', maxWidth: '1000px', margin: 'auto' }}>
      <h2>Economic Calendar</h2>

      {/* Control Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
        <div>
          <label>Currency: </label>
          <select onChange={(e) => setCurrencyFilter(e.target.value)} value={currencyFilter}>
            <option value="All">All Currencies</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div>
          <label>Impact: </label>
          <select onChange={(e) => setImpactFilter(e.target.value)} value={impactFilter}>
            <option value="All">All Impact</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label>Timezone: </label>
          <select onChange={(e) => setTimezone(e.target.value)} value={timezone}>
            {timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <thead style={{ background: '#34495e', color: 'white' }}>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Time</th>
            <th style={thStyle}>Cur.</th>
            <th style={thStyle}>Event</th>
            <th style={thStyle}>Impact</th>
            <th style={thStyle}>Forecast</th>
            <th style={thStyle}>Previous</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event) => {
            const { date, time } = formatDateTime(event.timestamp, timezone);
            return (
              <tr key={event.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tdStyle}>{date}</td>
                <td style={tdStyle}>{time}</td>
                <td style={tdStyle}><strong>{event.currency}</strong></td>
                <td style={tdStyle}>{event.title}</td>
                <td style={{ ...tdStyle, color: getImpactColor(event.impact), fontWeight: 'bold' }}>{event.impact}</td>
                <td style={tdStyle}>{event.forecast}</td>
                <td style={tdStyle}>{event.previous}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = { padding: '12px', textAlign: 'left', fontSize: '14px' };
const tdStyle = { padding: '12px', fontSize: '14px' };

export default EconomicCalendar;