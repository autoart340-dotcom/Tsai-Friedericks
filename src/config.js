'use strict';

require('dotenv').config();

const required = (name) => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        'Copy .env.example to .env and fill it in. ' +
        'Generate a value with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return value.trim();
};

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

const smtpConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.NOTIFY_EMAIL
);

module.exports = {
  env,
  isProduction,
  isTest: env === 'test',
  port: Number(process.env.PORT || 3000),
  siteUrl: (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  sessionSecret: required('SESSION_SECRET'),
  ipSalt: required('IP_SALT'),
  databasePath: process.env.DATABASE_PATH || 'data/app.sqlite',
  smtp: {
    configured: smtpConfigured,
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.NOTIFY_EMAIL,
  },
};
