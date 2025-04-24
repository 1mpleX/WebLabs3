import { Request, Response, NextFunction } from 'express';

export const customLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${req.method}] ${req.path} - Status: ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
};

export default customLogger;
