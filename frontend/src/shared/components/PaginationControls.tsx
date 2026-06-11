interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  isLoading,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className="pagination-controls">
      <button type="button" disabled={currentPage <= 1 || isLoading} onClick={onPrevious}>
        Precedent
      </button>
      <span>
        Page {currentPage} / {safeTotalPages}
      </span>
      <button type="button" disabled={currentPage >= safeTotalPages || isLoading} onClick={onNext}>
        Suivant
      </button>
    </div>
  );
}
