export interface Post {
  id?: number;
  description: string;
  mediaUrl: string;
  timestamp?: string;
  user?: any; // We will link this to the logged-in user
}