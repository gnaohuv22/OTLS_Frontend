import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UsePaginationReturn<T> extends PaginationState {
  paginatedData: T[];
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
}

export function usePagination<T>({
  data,
  itemsPerPage = 10,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage);

  const paginationState = useMemo((): PaginationState => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / currentItemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: currentItemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }, [data.length, currentPage, currentItemsPerPage]);

  const paginatedData = useMemo((): T[] => {
    const startIndex = (currentPage - 1) * currentItemsPerPage;
    const endIndex = startIndex + currentItemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, currentItemsPerPage]);

  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, paginationState.totalPages));
    setCurrentPage(newPage);
  };

  const nextPage = () => {
    if (paginationState.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (paginationState.hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const setItemsPerPage = (items: number) => {
    setCurrentItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    ...paginationState,
    paginatedData,
    setCurrentPage: goToPage,
    nextPage,
    previousPage,
    goToPage,
    setItemsPerPage,
  };
} 