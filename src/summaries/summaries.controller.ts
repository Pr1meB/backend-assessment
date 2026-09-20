import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SummariesService } from './summaries.service';

@ApiTags('summaries')
@Controller('users')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Get(':userId/summary')
  @ApiOperation({ summary: 'Get activity summary for a user' })
  @ApiParam({ name: 'userId', type: 'string', description: 'The unique identifier of the user', example: 'user_123' })
  @ApiResponse({ status: 200, description: 'Summary successfully retrieved.' })
  async getSummary(@Param('userId') userId: string) {
    return this.summariesService.getUserSummary(userId);
  }
}
