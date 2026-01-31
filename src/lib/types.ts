import type { Request as ExpressRequest } from "express";

export type Request<T = unknown> = ExpressRequest<object, object, T> & {
  userId?: string;
  refreshToken?: string;
};
