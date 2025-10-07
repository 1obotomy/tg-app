import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://tg-app-backend-lojl.onrender.com';

const EMOJI_OPTIONS = ['🎉', '📅', '🏠', '💼', '🏃‍♂️', '📚', '🍽️', '🎵', '💊', '🛒', '✈️', '🎯'];

const WEEKDAYS = [
  { id: 1, name: 'Пн' },
  { id: 2, name: 'Вт' },
  { id: 3, name: 'Ср' },
  { id: 4, name: 'Чт' },
  { id: 5, name: 'Пт' },
  { id: 6, name: 'Сб' },
  { id: 0, name: 'Вс' }
];

function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ 
    title: '', 
    date: '', 
    time: '', 
    emoji: '📅', 
    repeatDays: [], 
    isRepeated: false 
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

  const handleRepeatedSwitch = () => {
    setForm(prev => ({
      ...prev,
      isRepeated: !prev.isRepeated,
      repeatDays: !prev.isRepeated ? [] : prev.repeatDays,
      date: !prev.isRepeated ? prev.date : '',
    }));
  };

  const addEvent = (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert('Введите название события!');
      return;
    }

    if (form.isRepeated) {
      if (!form.time) {
        alert('Выберите время события!');
        return;
      }
      if (!form.repeatDays.length) {
        alert('Выберите хотя бы один день недели!');
        return;
      }
    } else {
      if (!form.date || !form.time) {
        alert('Введите дату и время!');
        return;
      }
    }

    // Формируем данные для API
    const eventData = {
      title: form.title,
      emoji: form.emoji,
      repeatDays: form.isRepeated ? form.repeatDays : [],
      isRepeated: form.isRepeated,
      time: form.time
    };
    // Если однократное — поставить обычную дату и время
    if (!form.isRepeated) {
      eventData.date = `${form.date}T${form.time}`;
    }

    fetch(API_URL + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    })
      .then(r => r.json())
      .then(ev => setEvents([...events, ev]))
      .catch(e => alert('Ошибка добавления: ' + e.message));
    
    setForm({ title: '', date: '', time: '', emoji: '📅', repeatDays: [], isRepeated: false });
  };

  const deleteEvent = (id) => {
    fetch(API_URL + `/api/events/${id}`, { method: 'DELETE' })
      .then(() => setEvents(events.filter(ev => ev.id !== id)))
      .catch(e => alert('Ошибка удаления: ' + e.message));
  };

  const formatEventDate = (ev) => {
    if (ev.isRepeated && ev.repeatDays && ev.repeatDays.length) {
      const days = ev.repeatDays.map(id => WEEKDAYS.find(w => w.id === id)?.name).filter(Boolean);
      return `Повтор: ${days.join(', ')} • Время: ${ev.time || ''}`;
    }
    if (ev.date) {
      try {
        return new Date(ev.date).toLocaleString('ru-RU', { 
          dateStyle: 'short', 
          timeStyle: 'short' 
        });
      } catch {
        return ev.date;
      }
    }
    return '';
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

        {/* Свитчер повторяемости */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <label style={{ fontWeight: 600 }}>Повторяющееся событие</label>
          <input
            type="checkbox"
            checked={form.isRepeated}
            onChange={handleRepeatedSwitch}
            style={{ width: 24, height: 24 }}
          />
        </div>

        {/* Пикер даты (только если событие однократное) */}
        {!form.isRepeated && (
          <>
            <input
              type="date"
              required
              value={form.date}
              onChange={e => handleFormChange('date', e.target.value)}
            />
          </>
        )}

        {/* Пикер времени */}
        <input
          type="time"
          required
          value={form.time}
          onChange={e => handleFormChange('time', e.target.value)}
        />

        {/* Пикер дней недели для повторяемых событий */}
        {form.isRepeated && (
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
        )}

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

        <button type="submit">Добавить</button>
      </form>

      <ul>
        {events.map(ev => (
          <li key={ev.id}>
            <div>
              <div style={{ fontWeight: 600 }}>
                {ev.emoji} {ev.title}
              </div>
              <span>{formatEventDate(ev)}</span>
            </div>
            <button onClick={() => deleteEvent(ev.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
