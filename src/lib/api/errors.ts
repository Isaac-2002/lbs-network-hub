// API and Repository errors

export class RepositoryError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class NotFoundError extends RepositoryError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends RepositoryError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
