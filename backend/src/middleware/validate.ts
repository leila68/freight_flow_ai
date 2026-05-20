import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type RequestLocation = 'body' | 'query' | 'params';

// Factory function that returns an Express middleware which validates
// request.body / query / params against a Zod schema.
// On failure, responds with 400 and a structured error list.
// On success, replaces the request field with the parsed (coerced) value.
export function validate(schema: ZodSchema, from: RequestLocation = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[from]);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        issues: result.error.issues.map((issue: ZodError['issues'][0]) => ({
          field:   issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    // Replace with Zod-coerced value (e.g. string → number transforms)
    req[from] = result.data;
    next();
  };
}
