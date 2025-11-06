export type UserRole = 'reporter' | 'editor';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface News {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: string;
  imageUrl: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'editing' | 'finished' | 'published' | 'disabled';
}

export interface Section {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}