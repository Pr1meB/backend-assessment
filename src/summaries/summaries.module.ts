import { Module } from '@nestjs/common';
import { SummariesController } from './summaries.controller';
import { SummariesService } from './summaries.service';
import { SummariesRepository } from './summaries.repository';

@Module({
  controllers: [SummariesController],
  providers: [SummariesService, SummariesRepository],
})
export class SummariesModule {}
