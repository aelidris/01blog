import { User } from './user.model';
export interface Comment { id: number; content: string; createdAt: string; author: User; }
