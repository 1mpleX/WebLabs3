import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { updateEventAsync, deleteEventAsync, fetchEvents, createEvent } from '../../store/slices/eventSlice';
import { Event } from '../../types';
import styles from './EventList.module.scss';
import axiosInstance from '../../api/axios';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  image_url?: string;
}

export const EventList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events } = useSelector((state: RootState) => state.events);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    image_url: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (currentUser) {
      console.log('Fetching events for user:', currentUser.id);
      dispatch(fetchEvents());
    }
  }, [dispatch, currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let eventId;
      if (editingEventId) {
        const result = await dispatch(updateEventAsync({ id: editingEventId, data: formData })).unwrap();
        eventId = result.id;
      } else {
        const result = await dispatch(createEvent(formData)).unwrap();
        eventId = result.id;
      }

      // Если выбран файл, загружаем его
      if (selectedFile && eventId) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        await axiosInstance.post(`/events/${eventId}/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Обновляем список событий, чтобы получить обновленные данные
        dispatch(fetchEvents());
      }

      setEditingEventId(null);
      setIsAddingEvent(false);
      setFormData({ title: '', description: '', date: '', image_url: '' });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error:', error);
    }
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

  // Функция для получения полного URL изображения
  const getImageUrl = (imageUrl: string) => {
    // Получаем базовый URL без /api на конце
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    // Убираем начальный слеш, если он есть
    const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    return `${baseUrl}/${cleanImageUrl}`;
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
        <label>Изображение:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
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
            setSelectedFile(null);
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
              <img 
                src={getImageUrl(event.image_url)}
                alt={event.title}
                className={styles.eventImage}
                onError={(e) => {
                  console.error('Error loading image:', event.image_url);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
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