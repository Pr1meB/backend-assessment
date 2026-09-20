import { pgTable, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const events = pgTable(
  'events',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    type: text('type').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true, mode: 'date' }).notNull(),
    metadata: jsonb('metadata'),
  },
  (table) => {
    return {
      userIdTimestampIdx: index('user_id_timestamp_idx').on(table.userId, table.timestamp),
    };
  }
);
