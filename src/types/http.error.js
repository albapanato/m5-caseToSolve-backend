export class HttpError extends Error {
  constructor(status, statusMessage, message, options) {
    super(message, options);
    this.status = status;
    this.statusMessage = statusMessage;
  }
}
