export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}
