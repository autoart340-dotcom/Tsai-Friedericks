#!/usr/bin/env node
'use strict';

// Creates or updates the admin account. Run once after deploying:
//   node scripts/create-admin.js
// Accepts ADMIN_EMAIL / ADMIN_PASSWORD from the environment for scripted setup.

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const bcrypt = require('bcryptjs');
const { db } = require('../src/db');

async function main() {
  let email = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    email = email || (await rl.question('Admin email: '));
    password = password || (await rl.question('Password (min 12 characters): '));
    rl.close();
  }

  email = String(email).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('That is not a valid email address.');
  if (String(password).length < 12) throw new Error('Password must be at least 12 characters.');

  const hash = await bcrypt.hash(String(password), 12);
  const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email);

  if (existing) {
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hash, existing.id);
    console.log(`Password updated for ${email}.`);
  } else {
    db.prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)').run(email, hash);
    console.log(`Admin account created for ${email}.`);
  }
}

main().catch((error) => {
  console.error(`\n${error.message}\n`);
  process.exit(1);
});
