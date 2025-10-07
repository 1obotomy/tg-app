import React, { useState, useEffect } from 'react';

// Укажи новый backend Render URL здесь!
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
    <div>
      <h2>Календарь событий</h2>
      <form onSubmit={addEvent}>
        <input
          required
          placeholder="Название"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <input
          required
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
        />
        <button type="submit">Добавить</button>
      </form>
      <ul>
        {events.map(ev => (
          <li key={ev.id}>
            {ev.title} – {ev.date}
            <button onClick={() => deleteEvent(ev.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
