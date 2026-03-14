import { User } from './user.model';
export interface Report {
  id: number; reason: string; status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string; reporter: User; reportedUser: User;
}
