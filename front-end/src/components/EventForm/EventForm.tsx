import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createEvent } from '../../store/slices/eventSlice';
import styles from './EventForm.module.scss';

interface EventFormProps {
  onClose: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Сбрасываем ошибку при изменении данных
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Отправка данных мероприятия:', formData);
      await dispatch(createEvent(formData)).unwrap();
      console.log('Мероприятие успешно создано');
      onClose();
    } catch (error) {
      console.error('Ошибка при создании мероприятия:', error);
      setError(error instanceof Error ? error.message : 'Произошла ошибка при создании мероприятия');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Создать мероприятие</h2>
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label>Название:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          disabled={loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Описание:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          disabled={loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Дата:</label>
        <input
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
          disabled={loading}
        />
      </div>

      <div className={styles.buttons}>
        <button type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Создать'}
        </button>
        <button type="button" onClick={onClose} disabled={loading}>
          Отмена
        </button>
      </div>
    </form>
  );
}; 