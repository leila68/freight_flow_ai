import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Validate all required environment variables at startup.
// If any are missing or malformed, the app throws immediately
// instead of failing silently at runtime.
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z
    .string()
    .default('3001')
    .transform(Number),

  DATABASE_URL: z
    .string()
    .url({ message: 'DATABASE_URL must be a valid PostgreSQL connection string' }),

  // Reserved for Phase 3 AI integration — optional for now
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY:    z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:\n');
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
