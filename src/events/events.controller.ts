import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto, createEventSchema } from './events.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(
    @Body(new ZodValidationPipe(createEventSchema)) createEventDto: CreateEventDto,
    @Res() res: Response,
  ) {
    const result = await this.eventsService.createEvent(createEventDto);
    return res.status(result.status).json(result.data);
  }
}
