export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface MessageResponse {
  message: string;
}

export type ApiResponse<T> = T | ApiError;
