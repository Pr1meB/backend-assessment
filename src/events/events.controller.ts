import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto, createEventSchema } from './events.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Ingest a new event' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'evt_001' },
        userId: { type: 'string', example: 'user_123' },
        type: { type: 'string', example: 'ACTIVITY_A' },
        timestamp: { type: 'string', format: 'date-time', example: '2026-09-10T10:30:00Z' },
        metadata: { type: 'object', additionalProperties: true, example: { value: 50000 } }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Event created successfully.' })
  @ApiResponse({ status: 200, description: 'Event already exists with identical contents (Idempotent).' })
  @ApiResponse({ status: 409, description: 'Conflict: Event ID already exists with different contents.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async createEvent(
    @Body(new ZodValidationPipe(createEventSchema)) createEventDto: CreateEventDto,
    @Res() res: Response,
  ) {
    const result = await this.eventsService.createEvent(createEventDto);
    return res.status(result.status).json(result.data);
  }
}
