export interface User {
  id: number; username: string; email: string; bio?: string;
  avatarUrl?: string; role: 'USER' | 'ADMIN'; banned: boolean;
  createdAt: string; subscriberCount: number; subscriptionCount: number;
  subscribedByCurrentUser: boolean;
}
