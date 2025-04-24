import { api } from './api';
import { Event } from '../types';

export const createEvent = async (eventData: Partial<Event>): Promise<Event> => {
  const response = await api.post('/events', eventData);
  return response.data;
};

export const getEvents = async (): Promise<Event[]> => {
  const response = await api.get('/events');
  return response.data;
};

export const updateEvent = async (id: number, eventData: Partial<Event>): Promise<Event> => {
  const response = await api.put(`/events/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id: number): Promise<void> => {
  await api.delete(`/events/${id}`);
};

export const uploadEventImage = async (id: number, file: File): Promise<{ image_url: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post(`/events/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}; 