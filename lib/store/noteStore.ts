import { create } from 'zustand';
import type { NoteTag } from '@/types/note';
import { persist } from 'zustand/middleware';

interface DraftData {
  title: string;
  content: string;
  tag: NoteTag;
}

interface NoteStore {
  draft: DraftData;
  setDraft: (note: Partial<DraftData>) => void;
  clearDraft: () => void;
}

const initialDraft: DraftData = {
  title: '',
  content: '',
  tag: 'Todo',
};

export const useNoteStore = create<NoteStore>()(
  persist(
    set => ({
      draft: initialDraft,
      setDraft: note =>
        set(state => ({
          draft: { ...state.draft, ...note },
        })),
      clearDraft: () => set(() => ({ draft: initialDraft })),
    }),
    {
      name: 'note-draft-storage',
      partialize: state => ({ draft: state.draft }),
    }
  )
);
