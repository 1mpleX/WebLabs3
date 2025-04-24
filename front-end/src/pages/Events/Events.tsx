import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchEvents } from '../../store/slices/eventSlice';
import { Event } from '../../types';
import EventCard from '../../components/EventCard/EventCard';
import { EventForm } from '../../components/EventForm/EventForm';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import axiosInstance from '../../api/axios';
import styles from './Events.module.scss';

const Events = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error } = useSelector((state: RootState) => state.events);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingEventId, setUploadingEventId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

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
      dispatch(fetchEvents());
    } catch (err) {
      console.error('Ошибка при загрузке изображения', err);
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
        <div className={styles.controls}>
          <button 
            className={styles.createButton}
            onClick={() => setIsCreating(true)}
          >
            Создать мероприятие
          </button>
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
      </div>

      {isCreating && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <EventForm onClose={() => setIsCreating(false)} />
          </div>
        </div>
      )}

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