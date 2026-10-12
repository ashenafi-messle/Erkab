export class ApiError extends Error {
  public status: number;
  public data?: unknown;

  constructor(message: string, status: number = 500, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
