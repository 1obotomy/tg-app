import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://tg-app-backend-lojl.onrender.com';

function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', date: '', time: '' });

  useEffect(() => {
    fetch(API_URL + '/api/events')
      .then(r => r.json())
      .then(setEvents)
      .catch(e => alert('Ошибка загрузки: ' + e.message));
  }, []);

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addEvent = (e) => {
    e.preventDefault();
    if (!form.date || !form.time) {
      alert('Введите дату и время!');
      return;
    }

    // Формируем iso-дату для API (или, если бекенд работает с раздельными — отправляй оба)
    const dateTime = `${form.date}T${form.time}`;
    fetch(API_URL + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, date: dateTime })
    })
      .then(r => r.json())
      .then(ev => setEvents([...events, ev]))
      .catch(e => alert('Ошибка добавления: ' + e.message));
    setForm({ title: '', date: '', time: '' });
  };

  const deleteEvent = (id) => {
    fetch(API_URL + `/api/events/${id}`, { method: 'DELETE' })
      .then(() => setEvents(events.filter(ev => ev.id !== id)))
      .catch(e => alert('Ошибка удаления: ' + e.message));
  };

  return (
    <div className="app-container">
      <h2>Календарь событий</h2>
      <form onSubmit={addEvent}>
        <input
          type="text"
          required
          placeholder="Название события"
          value={form.title}
          onChange={e => handleFormChange('title', e.target.value)}
        />
        <input
          type="date"
          required
          value={form.date}
          onChange={e => handleFormChange('date', e.target.value)}
          placeholder="Дата"
        />
        <input
          type="time"
          required
          value={form.time}
          onChange={e => handleFormChange('time', e.target.value)}
          placeholder="Время"
        />
        <button type="submit">Добавить</button>
      </form>
      <ul>
        {events.map(ev => (
          <li key={ev.id}>
            <div>
              <div style={{ fontWeight: 600 }}>{ev.title}</div>
              <span>
                {ev.date
                  ? new Date(ev.date).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
                  : ''}
              </span>
            </div>
            <button onClick={() => deleteEvent(ev.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
