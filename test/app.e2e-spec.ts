import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { events } from '../src/database/schema';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dbService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
    
    dbService = app.get(DatabaseService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up DB before each test
    await dbService.db.delete(events);
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  describe('/events (POST)', () => {
    const validEvent = {
      id: 'evt_001',
      userId: 'user_123',
      type: 'ACTIVITY_A',
      timestamp: '2026-09-10T10:30:00Z',
      metadata: { value: 50000 },
    };

    it('should create a valid event', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .send(validEvent)
        .expect(201);
        
      expect(res.body.id).toBe(validEvent.id);
    });

    it('should return 400 for invalid payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .send({ ...validEvent, type: '' })
        .expect(400);
        
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle duplicate identical events idempotently', async () => {
      await request(app.getHttpServer()).post('/events').send(validEvent).expect(201);
      
      const res = await request(app.getHttpServer())
        .post('/events')
        .send(validEvent)
        .expect(200);
        
      expect(res.body.id).toBe(validEvent.id);
    });

    it('should return 409 for duplicate event with conflicting data', async () => {
      await request(app.getHttpServer()).post('/events').send(validEvent).expect(201);
      
      const res = await request(app.getHttpServer())
        .post('/events')
        .send({ ...validEvent, type: 'ACTIVITY_B' })
        .expect(409);
        
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('/users/:userId/summary (GET)', () => {
    it('should return empty summary for user with no events', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/user_none/summary')
        .expect(200);
        
      expect(res.body).toEqual({
        userId: 'user_none',
        totalEvents: 0,
        firstActivityAt: null,
        lastActivityAt: null,
        activityByType: {},
        periods: { today: 0, last7Days: 0, last30Days: 0 },
      });
    });

    it('should calculate summary correctly for multiple events', async () => {
      const today = new Date().toISOString();
      const past = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days ago
      
      await dbService.db.insert(events).values([
        { id: '1', userId: 'u1', type: 'A', timestamp: new Date(today), metadata: {} },
        { id: '2', userId: 'u1', type: 'A', timestamp: new Date(past), metadata: {} },
        { id: '3', userId: 'u1', type: 'B', timestamp: new Date(today), metadata: {} },
      ]);
      
      const res = await request(app.getHttpServer())
        .get('/users/u1/summary')
        .expect(200);
        
      expect(res.body.totalEvents).toBe(3);
      expect(res.body.activityByType).toEqual({ A: 2, B: 1 });
      expect(res.body.periods.today).toBe(2);
      expect(res.body.periods.last7Days).toBe(2);
      expect(res.body.periods.last30Days).toBe(3);
    });
  });
});
