import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { sql } from 'drizzle-orm';
import { events } from '../database/schema';

@Injectable()
export class SummariesRepository {
  constructor(private readonly dbService: DatabaseService) {}

  async getSummary(userId: string) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const result = await this.dbService.db.execute(sql`
      SELECT
        COUNT(*)::int as "totalEvents",
        MIN(${events.timestamp}) as "firstActivityAt",
        MAX(${events.timestamp}) as "lastActivityAt",
        COALESCE(
          (SELECT json_object_agg(type, count) 
           FROM (
             SELECT type, COUNT(*)::int as count 
             FROM ${events} 
             WHERE ${events.userId} = ${userId} 
             GROUP BY type
           ) t
          ), 
          '{}'::json
        ) as "activityByType",
        COUNT(*) FILTER (WHERE ${events.timestamp} >= ${todayStr}::date)::int as "today",
        COUNT(*) FILTER (WHERE ${events.timestamp} >= (${todayStr}::date - INTERVAL '7 days'))::int as "last7Days",
        COUNT(*) FILTER (WHERE ${events.timestamp} >= (${todayStr}::date - INTERVAL '30 days'))::int as "last30Days"
      FROM ${events}
      WHERE ${events.userId} = ${userId}
    `);

    const row = result.rows[0];

    return {
      userId,
      totalEvents: row.totalEvents || 0,
      firstActivityAt: row.firstActivityAt || null,
      lastActivityAt: row.lastActivityAt || null,
      activityByType: row.activityByType || {},
      periods: {
        today: row.today || 0,
        last7Days: row.last7Days || 0,
        last30Days: row.last30Days || 0,
      }
    };
  }
}
