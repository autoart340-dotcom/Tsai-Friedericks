'use strict';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { app } = require('./helpers');

test('public pages render', async (t) => {
  for (const path of ['/', '/work', '/services', '/about', '/contact', '/contact/thanks']) {
    await t.test(`GET ${path} returns 200`, async () => {
      const res = await request(app).get(path);
      assert.equal(res.status, 200);
      assert.match(res.headers['content-type'], /html/);
    });
  }
});

test('project detail resolves by slug', async () => {
  const res = await request(app).get('/work/northbound');
  assert.equal(res.status, 200);
  assert.match(res.text, /Northbound/);
});

test('unknown project returns 404', async () => {
  const res = await request(app).get('/work/does-not-exist');
  assert.equal(res.status, 404);
});

test('robots.txt disallows admin and sitemap lists pages', async () => {
  const robots = await request(app).get('/robots.txt');
  assert.match(robots.text, /Disallow: \/admin/);

  const sitemap = await request(app).get('/sitemap.xml');
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.text, /<loc>http:\/\/localhost:3000\/work<\/loc>/);
  assert.doesNotMatch(sitemap.text, /\/admin/);
});

test('security headers are set and framing is denied', async () => {
  const res = await request(app).get('/');
  assert.match(res.headers['content-security-policy'], /frame-ancestors 'none'/);
  assert.equal(res.headers['x-powered-by'], undefined);
});
