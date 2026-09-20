import { z } from 'zod';

export const createEventSchema = z.object({
  id: z.string().min(1, 'id is required'),
  userId: z.string().min(1, 'userId is required'),
  type: z.string().min(1, 'type is required'),
  timestamp: z.string().datetime({ offset: true }),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;
