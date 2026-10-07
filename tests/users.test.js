const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /users returns the seeded list', async () => {
  const res = await request(app).get('/users');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).get('/users/999');
  assert.equal(res.status, 404);
});

test('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Grace Hopper', email: 'grace@example.com' });
  assert.equal(res.status, 201);
  assert.equal(res.body.name, 'Grace Hopper');
  assert.ok(res.body.id);
});

test('PUT /users/:id updates an existing user', async () => {
  const res = await request(app).put('/users/1').send({ name: 'Ada L.' });
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Ada L.');
});

test('PUT /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).put('/users/999').send({ name: 'Nobody' });
  assert.equal(res.status, 404);
});

test('POST /users returns a JSON 400 for malformed JSON', async () => {
  const res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send('{bad');
  assert.equal(res.status, 400);
  assert.match(res.headers['content-type'], /application\/json/);
  assert.deepEqual(res.body, { error: 'Request body must be valid JSON' });
});

test('POST /users returns 400 when name or email is not a string', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 123, email: ['grace@example.com'] });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email must be non-empty strings' });
  assert.equal(store.listUsers().length, 2);
});

test('PUT /users/:id returns 400 for an empty name or null email', async () => {
  const res = await request(app).put('/users/1').send({ name: '', email: null });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email must be non-empty strings' });
  assert.equal(store.getUser(1).name, 'Ada Lovelace');
  assert.equal(store.getUser(1).email, 'ada@example.com');
});
