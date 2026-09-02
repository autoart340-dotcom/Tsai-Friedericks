'use strict';

// The only module that talks to the database driver directly. If better-sqlite3
// ever fails to build on a host, swapping to node:sqlite is a change to this
// file alone — nothing else imports the driver.

const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');
const config = require('../config');

let db;

function connect() {
  if (db) return db;

  const file = path.resolve(config.databasePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });

  db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

function migrate(connection) {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    connection.exec(fs.readFileSync(path.join(dir, file), 'utf8'));
  }
}

module.exports = { connect, get db() { return connect(); } };
