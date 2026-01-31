export class HttpError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}
