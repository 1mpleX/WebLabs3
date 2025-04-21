import { useState, useEffect } from 'react';
import { Event } from '../../types';
import EventCard from '../../components/EventCard/EventCard';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import axiosInstance from '../../api/axios';
import styles from './Events.module.scss';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingEventId, setUploadingEventId] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get('/events');
      setEvents(response.data);
    } catch (err) {
      setError('Не удалось загрузить мероприятия');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (eventId: number, file: File) => {
    try {
      setUploadingEventId(eventId);
      const formData = new FormData();
      formData.append('image', file);

      await axiosInstance.post(`/events/${eventId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Обновляем список мероприятий после загрузки
      await fetchEvents();
    } catch (err) {
      setError('Ошибка при загрузке изображения');
    } finally {
      setUploadingEventId(null);
      setSelectedFile(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Мероприятия</h2>
        <div className={styles.layoutButtons}>
          <button
            onClick={() => setLayout('grid')}
            className={`${styles.layoutButton} ${layout === 'grid' ? styles.active : ''}`}
          >
            Сетка
          </button>
          <button
            onClick={() => setLayout('list')}
            className={`${styles.layoutButton} ${layout === 'list' ? styles.active : ''}`}
          >
            Список
          </button>
        </div>
      </div>
      <div className={`${styles.events} ${styles[layout]}`}>
        {events.map((event) => (
          <div key={event.id} className={styles.eventWrapper}>
            <EventCard event={event} />
            <div className={styles.uploadContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(event.id, file);
                  }
                }}
                className={styles.fileInput}
              />
              {uploadingEventId === event.id && (
                <div className={styles.uploading}>Загрузка...</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;