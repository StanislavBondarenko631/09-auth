import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

import styles from './NoteList.module.css';
import { deleteNote } from '@/lib/api';
import type Note from '@/types/note';

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  if (notes.length === 0) {
    return null;
  }

  return (
    <ul className={styles.list}>
      {notes.map(note => (
        <li className={styles.listItem} key={note.id}>
          <h2 className={styles.title}>{note.title}</h2>
          <p className={styles.content}>{note.content}</p>
          <div className={styles.footer}>
            <span className={styles.tag}>{note.tag}</span>
            <Link className={styles.link} href={`/notes/${note.id}`}>
              View details
            </Link>
            <button
              className={styles.button}
              onClick={() => {
                deleteMutation.mutate(note.id);
              }}
              disabled={deleteMutation.isPending}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
