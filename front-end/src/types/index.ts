export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    gender: 'male' | 'female';
    birthDate: string;
    events?: Event[];
  }
  
  export interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    createdBy: number;
    image_url?: string;
  }
  
  export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
  }