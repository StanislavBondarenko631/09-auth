'use client';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import css from './Notes.client.module.css';
import NoteList from '@/components/NoteList/NoteList';
import Pagination from '@/components/Pagination/Pagination';

// import Modal from '@/components/Modal/Modal';
// import NoteForm from '@/components/NoteForm/NoteForm';

import SearchBox from '@/components/SearchBox/SearchBox';
import { fetchNotes } from '@/lib/api/clientApi';
import Loader from '@/components/Loader/Loader';
import ErrorView from '@/components/ErrorView/ErrorView';
import Link from 'next/link';

interface NotesClientProps {
  tag: string;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [page, setPage] = useState<number>(1);
  // const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes', { page, search, tag }],
    queryFn: () => fetchNotes({ page, search, tag }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.totalPages || 1;

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
        {/* <button
          type="button"
          className={css.button}
          onClick={() => setIsModalOpen(true)}
        >
          Create note +
        </button> */}

        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </header>
      {isLoading && <Loader />}
      {isError && (
        <ErrorView message="Failed to load notes. Please try again later." />
      )}

      {!isLoading && !isError && (
        <>
          {(data?.notes || []).length > 0 ? (
            <NoteList notes={data?.notes || []} />
          ) : (
            <ErrorView
              message={
                search.trim() !== ''
                  ? 'No notes found matching your search.'
                  : 'Your note collection is empty. Create your first note!'
              }
            />
          )}
        </>
      )}

      {/* {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm onClose={() => setIsModalOpen(false)} />
        </Modal>
      )} */}
    </div>
  );
}
