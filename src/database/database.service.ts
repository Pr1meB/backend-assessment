import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '../config/env';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public db: NodePgDatabase<typeof schema>;
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
    });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    await this.pool.connect();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
