import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { updateEventAsync, deleteEventAsync, fetchEvents, createEvent } from '../../store/slices/eventSlice';
import { Event } from '../../types';
import styles from './EventList.module.scss';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  image_url?: string;
}

export const EventList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events } = useSelector((state: RootState) => state.events);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    image_url: '',
  });

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEventId) {
      dispatch(updateEventAsync({ id: editingEventId, data: formData }));
      setEditingEventId(null);
    } else {
      dispatch(createEvent(formData));
      setIsAddingEvent(false);
    }
    setFormData({ title: '', description: '', date: '', image_url: '' });
  };

  const handleEdit = (event: Event) => {
    setEditingEventId(event.id);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      image_url: event.image_url || '',
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      dispatch(deleteEventAsync(id));
    }
  };

  const EventForm = () => (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Название:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Описание:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>Дата:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label>URL изображения:</label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleInputChange}
        />
      </div>
      <div className={styles.buttons}>
        <button type="submit">
          {editingEventId ? 'Сохранить' : 'Добавить'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsAddingEvent(false);
            setEditingEventId(null);
            setFormData({ title: '', description: '', date: '', image_url: '' });
          }}
        >
          Отмена
        </button>
      </div>
    </form>
  );

  return (
    <div className={styles.eventList}>
      <div className={styles.header}>
        <h2>Мои мероприятия</h2>
        {!isAddingEvent && !editingEventId && (
          <button onClick={() => setIsAddingEvent(true)}>
            Добавить мероприятие
          </button>
        )}
      </div>

      {(isAddingEvent || editingEventId) && <EventForm />}

      <div className={styles.events}>
        {events.map(event => (
          <div key={event.id} className={styles.eventCard}>
            {event.image_url && (
              <img src={event.image_url} alt={event.title} />
            )}
            <div className={styles.eventContent}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p className={styles.date}>
                {new Date(event.date).toLocaleDateString()}
              </p>
              <div className={styles.actions}>
                <button onClick={() => handleEdit(event)}>
                  Редактировать
                </button>
                <button onClick={() => handleDelete(event.id)}>
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 