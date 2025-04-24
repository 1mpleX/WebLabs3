import { useState, useEffect } from 'react';
import { Event } from '../types';
import axiosInstance from '../api/axios';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/events');
        setEvents(response.data);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить мероприятия');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
};