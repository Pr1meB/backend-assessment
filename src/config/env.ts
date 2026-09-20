import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
});

export type Env = z.infer<typeof envSchema>;

export const config = envSchema.parse(process.env);
