// Common types used across the application

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type Result<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };
