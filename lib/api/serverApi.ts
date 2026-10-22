import { cookies } from 'next/headers';
import { api } from './api';

import Note from '@/types/note';
import type User from '@/types/user';

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
  const cookieStore = await cookies();

  const response = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page,
      search,
      tag: tag === 'all' ? undefined : tag,
    },
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const cookieStore = await cookies();

  const response = await api.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
};

export const checkSession = async (cookieString?: string) => {
  const headers: Record<string, string> = {};

  if (cookieString) {
    headers.Cookie = cookieString;
  } else {
    const cookieStore = await cookies();
    headers.Cookie = cookieStore.toString();
  }

  return await api.get('/auth/session', { headers });
};

export const getMe = async (): Promise<User> => {
  const cookieStore = await cookies();
  const response = await api.get<User>('/users/me', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  return response.data;
};
