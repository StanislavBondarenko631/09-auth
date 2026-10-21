import { api } from './api';

import type Note from '@/types/note';
import type { NoteTag } from '@/types/note';

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
