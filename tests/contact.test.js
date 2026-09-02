'use strict';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { app, db, csrfFrom, resetDb } = require('./helpers');

const staleTimestamp = () => Date.now() - 30_000;

async function formSession() {
  const agent = request.agent(app);
  const page = await agent.get('/contact');
  return { agent, csrf: csrfFrom(page.text) };
}

const validPayload = (csrf, overrides = {}) => ({
  _csrf: csrf,
  form_loaded_at: staleTimestamp(),
  website: '',
  name: 'Dana Reeve',
  email: 'dana@example.com',
  phone: '555 0100',
  company: 'Reeve Studio',
  project_type: 'Commercial',
  budget_range: '15k - 50k',
  timeline: 'Within a month',
  message: 'We need a 60 second brand film delivered before the spring campaign.',
  ...overrides,
});

test('a valid enquiry is stored and redirects to thanks', async () => {
  resetDb();
  const { agent, csrf } = await formSession();

  const res = await agent.post('/contact').type('form').send(validPayload(csrf));
  assert.equal(res.status, 302);
  assert.equal(res.headers.location, '/contact/thanks');

  const row = db.prepare('SELECT * FROM inquiries').get();
  assert.equal(row.email, 'dana@example.com');
  assert.equal(row.status, 'new');
  // The raw IP must never be stored.
  assert.ok(row.ip_hash && !row.ip_hash.includes('.'));
});

test('invalid input is rejected with field errors and stores nothing', async () => {
  resetDb();
  const { agent, csrf } = await formSession();

  const res = await agent
    .post('/contact')
    .type('form')
    .send(validPayload(csrf, { email: 'not-an-email', message: 'too short' }));

  assert.equal(res.status, 422);
  assert.match(res.text, /valid email address/);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM inquiries').get().n, 0);
});

test('the honeypot silently discards bot submissions', async () => {
  resetDb();
  const { agent, csrf } = await formSession();

  const res = await agent
    .post('/contact')
    .type('form')
    .send(validPayload(csrf, { website: 'http://spam.example' }));

  assert.equal(res.status, 302);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM inquiries').get().n, 0);
});

test('submissions faster than a human can type are held back', async () => {
  resetDb();
  const { agent, csrf } = await formSession();

  const res = await agent
    .post('/contact')
    .type('form')
    .send(validPayload(csrf, { form_loaded_at: Date.now() }));

  assert.equal(res.status, 422);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM inquiries').get().n, 0);
});

test('a missing CSRF token is refused', async () => {
  resetDb();
  const { agent } = await formSession();

  const res = await agent.post('/contact').type('form').send(validPayload('wrong-token-entirely'));
  assert.equal(res.status, 403);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM inquiries').get().n, 0);
});
