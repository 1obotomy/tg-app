import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://tg-app-backend-lojl.onrender.com';

function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', date: '' });

  useEffect(() => {
    fetch(API_URL + '/api/events')
      .then(r => r.json())
      .then(setEvents)
      .catch(e => alert('Ошибка загрузки событий: ' + e.message));
  }, []);

  const addEvent = (e) => {
    e.preventDefault();
    fetch(API_URL + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(r => r.json())
      .then(ev => setEvents([...events, ev]))
      .catch(e => alert('Ошибка добавления: ' + e.message));
    setForm({ title: '', date: '' });
  };

  const deleteEvent = (id) => {
    fetch(API_URL + `/api/events/${id}`, { method: 'DELETE' })
      .then(() => setEvents(events.filter(ev => ev.id !== id)))
      .catch(e => alert('Ошибка удаления: ' + e.message));
  }

  return (
    <div className="app-container">
      <h2>Календарь событий</h2>
      <form onSubmit={addEvent}>
        <input
          type="text"
          required
          placeholder="Название события"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="date"
          required
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
        />
        <button type="submit">Добавить</button>
      </form>
      <ul>
        {events.map(ev => (
          <li key={ev.id}>
            <div>
              <div style={{ fontWeight: 600 }}>{ev.title}</div>
              <span>{ev.date}</span>
            </div>
            <button onClick={() => deleteEvent(ev.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
