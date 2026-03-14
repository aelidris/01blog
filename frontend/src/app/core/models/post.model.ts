import { User } from './user.model';
import { Comment } from './comment.model';
export interface Post {
  id: number; description: string; mediaUrl?: string; mediaType?: string;
  createdAt: string; updatedAt: string; author: User;
  likeCount: number; likedByCurrentUser: boolean; comments: Comment[];
}
export interface Page<T> {
  content: T[]; totalElements: number; totalPages: number;
  number: number; size: number; last: boolean;
}
