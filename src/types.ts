import 'express';

declare module 'express' {
  interface Request {
    user?: Record<string, any>;
    logInfo?: Record<string, any>;
  }
}
