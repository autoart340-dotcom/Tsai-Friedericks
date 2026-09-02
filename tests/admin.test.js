'use strict';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { app, db, csrfFrom, resetDb } = require('./helpers');

const EMAIL = 'owner@example.com';
const PASSWORD = 'correct horse battery staple';

function seedAdmin() {
  resetDb();
  db.prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)')
    .run(EMAIL, bcrypt.hashSync(PASSWORD, 4));
}

function seedInquiry(overrides = {}) {
  const row = { name: 'Dana Reeve', email: 'dana@example.com', message: 'A brand film.', ...overrides };
  return db
    .prepare('INSERT INTO inquiries (name, email, message) VALUES (@name, @email, @message)')
    .run(row).lastInsertRowid;
}

async function signIn() {
  const agent = request.agent(app);
  const page = await agent.get('/admin/login');
  await agent
    .post('/admin/login')
    .type('form')
    .send({ _csrf: csrfFrom(page.text), email: EMAIL, password: PASSWORD, next: '/admin' });
  return agent;
}

test('admin pages redirect to login when signed out', async () => {
  for (const path of ['/admin', '/admin/inquiries', '/admin/inquiries/1']) {
    const res = await request(app).get(path);
    assert.equal(res.status, 302, `${path} should redirect`);
    assert.match(res.headers.location, /^\/admin\/login/);
  }
});

test('wrong credentials are refused without revealing which field was wrong', async () => {
  seedAdmin();
  const agent = request.agent(app);
  const page = await agent.get('/admin/login');

  const res = await agent
    .post('/admin/login')
    .type('form')
    .send({ _csrf: csrfFrom(page.text), email: EMAIL, password: 'wrong password entirely' });

  assert.equal(res.status, 401);
  assert.match(res.text, /not recognised/);
});

test('signing in reaches the dashboard', async () => {
  seedAdmin();
  const agent = await signIn();
  const res = await agent.get('/admin');
  assert.equal(res.status, 200);
  assert.match(res.text, /Dashboard/);
});

test('an open redirect via ?next is not followed', async () => {
  seedAdmin();
  const agent = request.agent(app);
  const page = await agent.get('/admin/login');

  const res = await agent
    .post('/admin/login')
    .type('form')
    .send({ _csrf: csrfFrom(page.text), email: EMAIL, password: PASSWORD, next: 'https://evil.example/steal' });

  assert.equal(res.headers.location, '/admin');
});

test('opening a new enquiry marks it read, and notes and status persist', async () => {
  seedAdmin();
  const id = seedInquiry();
  const agent = await signIn();

  const detail = await agent.get(`/admin/inquiries/${id}`);
  assert.equal(detail.status, 200);
  assert.equal(db.prepare('SELECT status FROM inquiries WHERE id = ?').get(id).status, 'read');

  const csrf = csrfFrom(detail.text);
  await agent.post(`/admin/inquiries/${id}/status`).type('form').send({ _csrf: csrf, status: 'replied' });
  await agent.post(`/admin/inquiries/${id}/notes`).type('form').send({ _csrf: csrf, admin_notes: 'Quoted 20k.' });

  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
  assert.equal(row.status, 'replied');
  assert.equal(row.admin_notes, 'Quoted 20k.');
});

test('search filters the enquiry list', async () => {
  seedAdmin();
  seedInquiry({ name: 'Dana Reeve', email: 'dana@example.com' });
  seedInquiry({ name: 'Sam Okafor', email: 'sam@example.com' });
  const agent = await signIn();

  const res = await agent.get('/admin/inquiries?q=Okafor');
  assert.match(res.text, /Okafor/);
  assert.doesNotMatch(res.text, /Dana Reeve/);
});

test('CSV export returns an attachment with the enquiry rows', async () => {
  seedAdmin();
  seedInquiry({ name: 'Dana Reeve' });
  const agent = await signIn();

  const res = await agent.get('/admin/inquiries/export.csv');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-disposition'], /attachment; filename="enquiries-/);
  assert.match(res.text, /Dana Reeve/);
});

test('a formula injection attempt is neutralised in the CSV', async () => {
  seedAdmin();
  seedInquiry({ name: '=cmd|calc!A1' });
  const agent = await signIn();

  const res = await agent.get('/admin/inquiries/export.csv');
  assert.match(res.text, /"'=cmd\|calc!A1"/);
});

test('deleting removes the enquiry', async () => {
  seedAdmin();
  const id = seedInquiry();
  const agent = await signIn();

  const detail = await agent.get(`/admin/inquiries/${id}`);
  await agent.post(`/admin/inquiries/${id}/delete`).type('form').send({ _csrf: csrfFrom(detail.text) });

  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM inquiries WHERE id = ?').get(id).n, 0);
});

test('signing out ends the session', async () => {
  seedAdmin();
  const agent = await signIn();
  const dash = await agent.get('/admin');

  await agent.post('/admin/logout').type('form').send({ _csrf: csrfFrom(dash.text) });

  const after = await agent.get('/admin');
  assert.equal(after.status, 302);
});
