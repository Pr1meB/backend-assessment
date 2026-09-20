import { Injectable, ConflictException } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './events.schema';

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async createEvent(data: CreateEventDto) {
    const inserted = await this.eventsRepository.insertIfNotExists(data);

    if (inserted) {
      return { status: 201, data: inserted };
    }

    const existing = await this.eventsRepository.findById(data.id);
    
    if (!existing) {
      throw new ConflictException('Event ID exists but could not be retrieved');
    }

    const isIdentical = 
      existing.userId === data.userId &&
      existing.type === data.type &&
      existing.timestamp.toISOString() === new Date(data.timestamp).toISOString() &&
      this.deepEqual(existing.metadata, data.metadata || null);

    if (isIdentical) {
      return { status: 200, data: existing };
    }

    throw new ConflictException('Event ID already exists with different contents');
  }

  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key) || !this.deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    
    return true;
  }
}
