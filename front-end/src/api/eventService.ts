import axiosInstance from './axios';
import { Event } from '../types';

export const eventService = {
  getAllEvents: async () => {
    const response = await axiosInstance.get<Event[]>('/api/events');
    return response.data;
  },

  createEvent: async (eventData: Omit<Event, 'id'>) => {
    const response = await axiosInstance.post<Event>('/api/events', eventData);
    return response.data;
  },

  updateEvent: async (id: number, eventData: Partial<Event>) => {
    const response = await axiosInstance.put<Event>(`/api/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id: number) => {
    await axiosInstance.delete(`/api/events/${id}`);
  },

  uploadImage: async (id: number, formData: FormData) => {
    const response = await axiosInstance.post<{ image_url: string }>(`/api/events/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 