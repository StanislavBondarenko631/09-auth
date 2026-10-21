import styles from './Pagination.module.css';

import ReactPaginateModule, { type ReactPaginateProps } from 'react-paginate';

const ReactPaginate =
  (
    ReactPaginateModule as unknown as {
      default: React.ComponentType<ReactPaginateProps>;
    }
  ).default || ReactPaginateModule;

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <ReactPaginate
      previousLabel="<"
      nextLabel=">"
      pageCount={totalPages}
      forcePage={page - 1}
      onPageChange={(data: { selected: number }) =>
        onPageChange(data.selected + 1)
      }
      containerClassName={styles.pagination}
      pageClassName={styles.pageItem}
      pageLinkClassName={styles.pageLink}
      previousClassName={styles.pageItem}
      previousLinkClassName={styles.pageLink}
      nextClassName={styles.pageItem}
      nextLinkClassName={styles.pageLink}
      activeClassName={styles.active}
      breakLabel="..."
      breakClassName={styles.pageItem}
      breakLinkClassName={styles.pageLink}
    />
  );
}
