/**
 * @class AppError
 * @extends Error
 * @description Custom error class for handling operational errors.
 * Operational errors are predictable errors that should be handled gracefully,
 * as opposed to programming errors which indicate bugs.
 */
class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  /**
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code.
   */
  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;