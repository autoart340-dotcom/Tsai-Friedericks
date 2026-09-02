'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Must be set before src/config is first required.
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-session-secret-not-used-in-production';
process.env.IP_SALT = 'test-ip-salt';
process.env.SITE_URL = 'http://localhost:3000';
process.env.DATABASE_PATH = path.join(
  fs.mkdtempSync(path.join(os.tmpdir(), 'tf-test-')),
  'test.sqlite'
);

const { createApp } = require('../src/server');
const { db } = require('../src/db');

const app = createApp();

function csrfFrom(html) {
  const match = html.match(/name="_csrf" value="([^"]+)"/);
  if (!match) throw new Error('No CSRF token found in the rendered page.');
  return match[1];
}

function resetDb() {
  db.exec('DELETE FROM inquiries; DELETE FROM admin_users;');
}

module.exports = { app, db, csrfFrom, resetDb };
