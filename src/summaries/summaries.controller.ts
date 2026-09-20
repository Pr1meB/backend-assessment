import { Controller, Get, Param } from '@nestjs/common';
import { SummariesService } from './summaries.service';

@Controller('users')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Get(':userId/summary')
  async getSummary(@Param('userId') userId: string) {
    return this.summariesService.getUserSummary(userId);
  }
}
