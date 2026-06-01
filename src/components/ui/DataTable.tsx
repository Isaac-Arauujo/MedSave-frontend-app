import type { ReactNode } from 'react';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading: boolean;
  rowKey: (row: T) => string | number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

const SKELETON_ROWS = 5;

export const DataTable = <T,>({
  columns,
  data,
  isLoading,
  rowKey,
  currentPage,
  totalPages,
  onPageChange,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription = 'Não há dados para exibir no momento.',
}: DataTableProps<T>) => {
  if (!isLoading && data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-outline-variant">
        <table className="min-w-full divide-y divide-outline-variant">
          <thead className="bg-surface-container">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant ${column.headerClassName ?? ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`}>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-surface-container" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((row) => (
                  <tr key={rowKey(row)}>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm text-on-surface ${column.cellClassName ?? ''}`}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <Pagination
        className="mt-6"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};
