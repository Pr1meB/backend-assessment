import { Injectable } from '@nestjs/common';
import { SummariesRepository } from './summaries.repository';

@Injectable()
export class SummariesService {
  constructor(private readonly summariesRepository: SummariesRepository) {}

  async getUserSummary(userId: string) {
    return this.summariesRepository.getSummary(userId);
  }
}
