import { api } from './api';

import type Note from '@/types/note';
import type { NoteTag } from '@/types/note';

import User from '@/types/user';

interface FetchNotesParams {
  page?: number;
  search?: string;
  tag?: string;
}

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export const fetchNotes = async ({
  page,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const response = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page,
      search,
      tag: tag === 'all' ? undefined : tag,
    },
  });
  return response.data;
};

interface CreateNoteData {
  title: string;
  content: string;
  tag: NoteTag;
}

export const createNote = async ({
  title,
  content,
  tag,
}: CreateNoteData): Promise<Note> => {
  const response = await api.post<Note>('/notes', { title, content, tag });
  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const response = await api.get<Note>(`/notes/${id}`);
  return response.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response = await api.delete<Note>(`/notes/${id}`);
  return response.data;
};

interface RegisterData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData): Promise<User> => {
  const response = await api.post<User>('/auth/register', data);
  return response.data;
};

interface LoginData {
  email: string;
  password: string;
}

export const login = async (data: LoginData): Promise<User> => {
  const response = await api.post<User>('/auth/login', data);
  return response.data;
};

interface CheckSessionRequest {
  success: boolean;
}

export const checkSession = async () => {
  const res = await api.get<CheckSessionRequest>('/auth/session');
  return res.data.success;
};

export const getMe = async () => {
  const { data } = await api.get<User>('/users/me');
  return data;
};

export const logout = async () => {
  const response = await api.post<User>('/auth/logout');
  return response.data;
};

export type UpdateUserData = {
  username: string;
};

export const updateMe = async (data: UpdateUserData): Promise<User> => {
  const response = await api.patch<User>('/users/me', data);
  return response.data;
};
