import React from 'react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, pages, onPageChange }) => {
  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(pages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-3 my-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <Button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        variant="secondary"
        size="sm"
        className="px-4"
      >
        ←
      </Button>

      {startPage > 1 && (
        <>
          <Button
            onClick={() => onPageChange(1)}
            variant={page === 1 ? 'primary' : 'secondary'}
            size="sm"
          >
            1
          </Button>
          {startPage > 2 && <span className="px-2 text-slate-600 font-bold">...</span>}
        </>
      )}

      <div className="flex gap-2">
        {pageNumbers.map((num) => (
          <Button
            key={num}
            onClick={() => onPageChange(num)}
            variant={page === num ? 'primary' : 'secondary'}
            size="sm"
            className={`min-w-[40px] ${page === num ? 'shadow-primary-500/20' : ''}`}
          >
            {num}
          </Button>
        ))}
      </div>

      {endPage < pages && (
        <>
          {endPage < pages - 1 && <span className="px-2 text-slate-600 font-bold">...</span>}
          <Button
            onClick={() => onPageChange(pages)}
            variant={page === pages ? 'primary' : 'secondary'}
            size="sm"
          >
            {pages}
          </Button>
        </>
      )}

      <Button
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        variant="secondary"
        size="sm"
        className="px-4"
      >
        →
      </Button>
    </div>
  );
};
