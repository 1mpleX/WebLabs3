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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createEvent(formData)).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Создать мероприятие</h2>
      
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
        />
      </div>

      <div className={styles.buttons}>
        <button type="submit">Создать</button>
        <button type="button" onClick={onClose}>Отмена</button>
      </div>
    </form>
  );
}; 