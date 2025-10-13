import React from 'react';

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
};

const Pagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const makePages = () => {
    const pages: number[] = [];
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  };

  return (
    <div className='flex items-center justify-between mt-6'>
      <div className='text-sm text-[color:var(--color-muted-foreground)]'>
        Mostrando {startItem}–{endItem} de {totalItems}
      </div>

      <div className='flex items-center gap-3'>
        <nav aria-label='Pagination' className='flex items-center gap-2'>
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className='px-3 py-1 rounded bg-[color:var(--color-card)]'
          >
            «
          </button>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className='px-3 py-1 rounded bg-[color:var(--color-card)]'
          >
            ‹
          </button>

          {makePages().map(p => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage}
              className={`px-3 py-1 rounded ${
                p === currentPage
                  ? 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]'
                  : 'bg-[color:var(--color-card)]'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className='px-3 py-1 rounded bg-[color:var(--color-card)]'
          >
            ›
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className='px-3 py-1 rounded bg-[color:var(--color-card)]'
          >
            »
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
