import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://tg-app-backend-lojl.onrender.com';

// Доступные эмодзи для выбора
const EMOJI_OPTIONS = ['🎉', '📅', '🏠', '💼', '🏃‍♂️', '📚', '🍽️', '🎵', '💊', '🛒', '✈️', '🎯'];

// Дни недели (0 - Вс, 1 - Пн, ..., 6 - Сб)
const WEEKDAYS = [
  { id: 1, name: 'Пн', fullName: 'Понедельник' },
  { id: 2, name: 'Вт', fullName: 'Вторник' },
  { id: 3, name: 'Ср', fullName: 'Среда' },
  { id: 4, name: 'Чт', fullName: 'Четверг' },
  { id: 5, name: 'Пт', fullName: 'Пятница' },
  { id: 6, name: 'Сб', fullName: 'Суббота' },
  { id: 0, name: 'Вс', fullName: 'Воскресенье' }
];

function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ 
    title: '', 
    date: '', 
    time: '', 
    emoji: '📅', 
    repeatDays: [] 
  });

  useEffect(() => {
    fetch(API_URL + '/api/events')
      .then(r => r.json())
      .then(setEvents)
      .catch(e => alert('Ошибка загрузки событий: ' + e.message));
  }, []);

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRepeatDayToggle = (dayId) => {
    setForm(prev => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(dayId)
        ? prev.repeatDays.filter(id => id !== dayId)
        : [...prev.repeatDays, dayId]
    }));
  };

  const addEvent = (e) => {
    e.preventDefault();
    if (!form.date || !form.time) {
      alert('Введите дату и время!');
      return;
    }

    // Формируем datetime для API
    const dateTime = `${form.date}T${form.time}`;
    const eventData = {
      title: form.title,
      date: dateTime,
      emoji: form.emoji,
      repeatDays: form.repeatDays
    };

    fetch(API_URL + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    })
      .then(r => r.json())
      .then(ev => setEvents([...events, ev]))
      .catch(e => alert('Ошибка добавления: ' + e.message));
    
    setForm({ title: '', date: '', time: '', emoji: '📅', repeatDays: [] });
  };

  const deleteEvent = (id) => {
    fetch(API_URL + `/api/events/${id}`, { method: 'DELETE' })
      .then(() => setEvents(events.filter(ev => ev.id !== id)))
      .catch(e => alert('Ошибка удаления: ' + e.message));
  };

  const formatEventDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('ru-RU', { 
        dateStyle: 'short', 
        timeStyle: 'short' 
      });
    } catch {
      return dateStr;
    }
  };

  const formatRepeatDays = (repeatDays) => {
    if (!Array.isArray(repeatDays) || repeatDays.length === 0) return '';
    const dayNames = repeatDays.map(id => WEEKDAYS.find(w => w.id === id)?.name).filter(Boolean);
    return `Повтор: ${dayNames.join(', ')}`;
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
        />
        
        <input
          type="time"
          required
          value={form.time}
          onChange={e => handleFormChange('time', e.target.value)}
        />

        {/* Выбор эмодзи */}
        <div className="emoji-selector">
          <label>Выберите эмодзи:</label>
          <div className="emoji-grid">
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                type="button"
                className={`emoji-btn ${form.emoji === emoji ? 'selected' : ''}`}
                onClick={() => handleFormChange('emoji', emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Выбор дней повторения */}
        <div className="repeat-days">
          <label>Повторять в дни:</label>
          <div className="weekdays-grid">
            {WEEKDAYS.map(day => (
              <label key={day.id} className="weekday-checkbox">
                <input
                  type="checkbox"
                  checked={form.repeatDays.includes(day.id)}
                  onChange={() => handleRepeatDayToggle(day.id)}
                />
                <span>{day.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit">Добавить</button>
      </form>

      <ul>
        {events.map(ev => (
          <li key={ev.id}>
            <div>
              <div style={{ fontWeight: 600 }}>
                {ev.emoji} {ev.title}
              </div>
              <span>{formatEventDate(ev.date)}</span>
              {ev.repeatDays && ev.repeatDays.length > 0 && (
                <div className="repeat-info">{formatRepeatDays(ev.repeatDays)}</div>
              )}
            </div>
            <button onClick={() => deleteEvent(ev.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
