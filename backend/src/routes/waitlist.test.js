const request = require('supertest');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const waitlistRoutes = require('./waitlist');
app.use('/waitlist', waitlistRoutes);

describe('POST /waitlist/join', () => {
  it('should return 400 if name is missing', async () => {
    const res = await request(app)
      .post('/waitlist/join')
      .send({ phone: '5551234567', partySize: 2 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name, phone, and party size are required');
  });

  it('should return 400 if phone is missing', async () => {
    const res = await request(app)
      .post('/waitlist/join')
      .send({ name: 'Test User', partySize: 2 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name, phone, and party size are required');
  });

  it('should return 400 if partySize is missing', async () => {
    const res = await request(app)
      .post('/waitlist/join')
      .send({ name: 'Test User', phone: '5551234567' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name, phone, and party size are required');
  });
});

describe('GET /waitlist', () => {
  it('should return an array', async () => {
    const res = await request(app).get('/waitlist');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PATCH /waitlist/:id/seat', () => {
  it('should return 404 for non-existent id', async () => {
    const res = await request(app)
      .patch('/waitlist/00000000-0000-0000-0000-000000000000/seat');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Customer not found');
  });
});

describe('DELETE /waitlist/:id', () => {
  it('should return 404 for non-existent id', async () => {
    const res = await request(app)
      .delete('/waitlist/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Customer not found');
  });
});

describe('POST /waitlist/:id/notify', () => {
  it('should return 404 for non-existent id', async () => {
    const res = await request(app)
      .post('/waitlist/00000000-0000-0000-0000-000000000000/notify');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Customer not found');
  });
});