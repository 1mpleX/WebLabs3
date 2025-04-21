export interface User {
    id: number;
    name: string;
    email: string;
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