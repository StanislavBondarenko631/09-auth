import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from '@tanstack/react-query';

import { fetchNotes } from '@/lib/api/serverApi';

import NotesClient from '@/app/(private routes)/notes/filter/[...slug]/Notes.client';

import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const currentTag = slug ? slug[0] : 'all';

  const formattedTag = currentTag.charAt(0).toUpperCase() + currentTag.slice(1);
  const title = `${formattedTag} Notes | NoteHub`;
  const description = `Browse your filtered notes for the tag: ${currentTag}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://notehub.com/notes/filter/${currentTag}`,
      images: [
        {
          url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
          width: 1200,
          height: 630,
          alt: 'NoteHub Preview',
        },
      ],
    },
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const currentTag = slug ? slug[0] : 'all';

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['notes', { page: 1, search: '', tag: currentTag }],
    queryFn: () => fetchNotes({ page: 1, search: '', tag: currentTag }),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={currentTag} />
    </HydrationBoundary>
  );
}
