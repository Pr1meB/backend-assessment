import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { events } from '../database/schema';
import { CreateEventDto } from './events.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class EventsRepository {
  constructor(private readonly dbService: DatabaseService) {}

  async insertIfNotExists(data: CreateEventDto) {
    const result = await this.dbService.db
      .insert(events)
      .values({
        id: data.id,
        userId: data.userId,
        type: data.type,
        timestamp: new Date(data.timestamp),
        metadata: data.metadata || null,
      })
      .onConflictDoNothing({ target: events.id })
      .returning();

    return result[0];
  }

  async findById(id: string) {
    const result = await this.dbService.db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    return result[0];
  }
}
