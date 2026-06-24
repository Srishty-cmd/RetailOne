import helmet from 'helmet';
import cors from 'cors';

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Mirror the request origin to support credentials (HttpOnly cookies)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

export const securityMiddleware = [
  helmet(),
  cors(corsOptions)
];
