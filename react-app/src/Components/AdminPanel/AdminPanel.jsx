import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import './AdminPanel.css';
import '../Spinner.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source: '',
    link: '',
    image: '',
    relatedCurrency: 'GLOBAL',
    pubDate: new Date().toISOString().split('T')[0]
  });

  const [eventFormData, setEventFormData] = useState({
    title: '',
    country: 'USD',
    impact: 'Medium',
    actual: '',
    forecast: '',
    previous: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:30'
  });

  const [editingId, setEditingId] = useState(null);
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
          fetchNews();
          fetchCalendar();
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/news/admin`);
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("News fetching error:", err.message);
      setLoading(false);
    }
  };

  const fetchCalendar = async () => {
    try {
      const res = await fetch(`${API_URL}/api/calendar`);
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Calendar fetching error:", err.message);
    }
  };

  const resetForms = () => {
    setEditingId(null);
    setFormData({
      title: '', description: '', source: '', link: '', image: '', 
      relatedCurrency: 'GLOBAL', pubDate: new Date().toISOString().split('T')[0]
    });

    setEventFormData({
      title: '', country: 'USD', impact: 'Medium', actual: '', 
      forecast: '', previous: '', date: new Date().toISOString().split('T')[0], time: '14:30'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventFormData({ ...eventFormData, [name]: value });
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/api/news/${editingId}` : `${API_URL}/api/news`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setEditingId(null);
        setFormData({ title: '', description: '', source: '', link: '', image: '', relatedCurrency: 'GLOBAL', pubDate: new Date().toISOString().split('T')[0] });
        fetchNews();
        alert('News item successfully saved!');
      }
    } catch (err) {
      console.error("Saving error (News):", err);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/api/calendar/${editingId}` : `${API_URL}/api/calendar`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventFormData)
      });

      if (res.ok) {
        setEditingId(null);
        setEventFormData({ title: '', country: 'USD', impact: 'Medium', actual: '', forecast: '', previous: '', date: new Date().toISOString().split('T')[0], time: '14:30' });
        fetchCalendar();
        alert('Event successfully saved!');
      }
    } catch (err) {
      console.error("Saving error (Calendar):", err);
    }
  };

  const handleEdit = (item, type) => {
    setEditingId(item.id);
    if (type === 'news') {
      setFormData({
        title: item.title,
        description: item.description || '',
        source: item.source || '',
        link: item.link || '',
        image: item.image || '',
        relatedCurrency: item.relatedCurrency || 'GLOBAL',
        pubDate: new Date(item.pubDate).toISOString().split('T')[0]
      });
      setActiveTab('news');
    } else {
      setEventFormData({
        title: item.title,
        country: item.country || 'USD',
        impact: item.impact || 'Medium',
        actual: item.actual || '',
        forecast: item.forecast || '',
        previous: item.previous || '',
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: item.time || '14:30'
      });
      setActiveTab('calendar');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, endpoint) => {
    if (window.confirm(`Are you sure you want to delete this ${endpoint === 'news' ? 'news item' : 'calendar event'}?`)) {
      try {
        const res = await fetch(`${API_URL}/api/${endpoint}/${id}`, { method: 'DELETE' });
        if (res.ok) endpoint === 'news' ? fetchNews() : fetchCalendar();
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

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
  if (!isAdmin) return <div className="admin-error">Access Denied. Admins only.</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>ADMIN <span>DASHBOARD</span></h1>
        <div className="admin-tab-selector">
          <button 
            className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('news'); setEditingId(null); }}
          >
            NEWS MANAGEMENT
          </button>
          <button 
            className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('calendar'); setEditingId(null); }}
          >
            CALENDAR MANAGEMENT
          </button>
        </div>
      </header>

      {activeTab === 'news' ? (
        <>
          <section className="admin-form-section">
            <h2>{editingId ? 'Edit News' : 'Add New Article'}</h2>
            <form onSubmit={handleNewsSubmit} className="admin-form">
              <div className="form-group">
                <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Title" required />
                <input name="source" value={formData.source} onChange={handleInputChange} placeholder="Source (e.g. Bloomberg)" required />
              </div>
              <div className="form-group">
                <input name="image" value={formData.image} onChange={handleInputChange} placeholder="Image URL" />
                <select name="relatedCurrency" value={formData.relatedCurrency} onChange={handleInputChange}>
                  <option value="GLOBAL">GLOBAL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>
              <input name="link" value={formData.link} onChange={handleInputChange} placeholder="Article Link" required />
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief Description..." rows="3" />
              <div className="form-actions">
                <button type="submit" className="save-btn">{editingId ? 'UPDATE' : 'PUBLISH'}</button>
                {editingId && <button type="button" onClick={resetForms} className="cancel-btn">CANCEL</button>}
              </div>
            </form>
          </section>

          <section className="admin-list-section">
            <h2>Existing Articles</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Source</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map(item => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.source}</td>
                      <td className="table-actions">
                        <button onClick={() => handleEdit(item, 'news')} className="edit-btn">Edit</button>
                        <button onClick={() => handleDelete(item.id, 'news')} className="delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="admin-form-section">
            <h2>{editingId ? 'Edit Event' : 'Add Calendar Event'}</h2>
            <form onSubmit={handleEventSubmit} className="admin-form">
              <div className="form-group">
                <input name="title" value={eventFormData.title} onChange={handleEventInputChange} placeholder="Event Name (e.g. CPI Data)" required />
                <select name="country" value={eventFormData.country} onChange={handleEventInputChange}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
              <div className="form-group">
                <input type="date" name="date" value={eventFormData.date} onChange={handleEventInputChange} required />
                <input type="time" name="time" value={eventFormData.time} onChange={handleEventInputChange} />
              </div>
              <div className="form-group">
                <input name="actual" value={eventFormData.actual} onChange={handleEventInputChange} placeholder="Actual" />
                <input name="forecast" value={eventFormData.forecast} onChange={handleEventInputChange} placeholder="Forecast" />
                <input name="previous" value={eventFormData.previous} onChange={handleEventInputChange} placeholder="Previous" />
                <select name="impact" value={eventFormData.impact} onChange={handleEventInputChange}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">{editingId ? 'UPDATE' : 'PUBLISH'}</button>
                {editingId && <button type="button" onClick={resetForms} className="cancel-btn">CANCEL</button>}
              </div>
            </form>
          </section>

          <section className="admin-list-section">
            <h2>Scheduled Events</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Event</th>
                    <th>Impact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id}>
                      <td>{event.date?.split('T')[0]}</td>
                      <td><strong>{event.country}</strong>: {event.title}</td>
                      <td>{event.impact}</td>
                      <td className="table-actions">
                        <button onClick={() => handleEdit(event, 'calendar')} className="edit-btn">Edit</button>
                        <button onClick={() => handleDelete(event.id, 'calendar')} className="delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminPanel;