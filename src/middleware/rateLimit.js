'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config');

// Disabled under test so route assertions are not order-dependent.
const build = (options) =>
  config.isTest
    ? (req, res, next) => next()
    : rateLimit({ standardHeaders: 'draft-7', legacyHeaders: false, ...options });

const contactLimiter = build({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: 'Too many enquiries sent from this connection. Please try again later.',
});

const loginLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

module.exports = { contactLimiter, loginLimiter };
