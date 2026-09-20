import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { SummariesModule } from './summaries/summaries.module';
import { AppController } from './app.controller';

@Module({
  imports: [DatabaseModule, EventsModule, SummariesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
