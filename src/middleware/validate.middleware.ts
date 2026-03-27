import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Noto\'g\'ri ma\'lumotlar kiritildi',
          errors: (error as any).errors.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      return res.status(500).json({ success: false, message: 'Server xatosi' });
    }
  };
};
