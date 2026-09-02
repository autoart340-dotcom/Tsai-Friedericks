'use strict';

const crypto = require('node:crypto');

// Synchroniser token pattern. The token lives in the signed session cookie and
// must be echoed back in the form body for any state-changing request.
function csrfToken(req) {
  if (!req.session.csrf) {
    req.session.csrf = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrf;
}

function attachCsrf(req, res, next) {
  res.locals.csrfToken = csrfToken(req);
  next();
}

function verifyCsrf(req, res, next) {
  const expected = req.session && req.session.csrf;
  const supplied = req.body && req.body._csrf;

  // Compare byte lengths, not string lengths: timingSafeEqual throws on a
  // length mismatch, and a multi-byte token would pass a character-count
  // check while producing a longer buffer.
  const expectedBuffer = typeof expected === 'string' ? Buffer.from(expected) : null;
  const suppliedBuffer = typeof supplied === 'string' ? Buffer.from(supplied) : null;

  const ok =
    expectedBuffer &&
    suppliedBuffer &&
    expectedBuffer.length === suppliedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);

  if (!ok) {
    const error = new Error('Your session expired. Please reload the page and try again.');
    error.status = 403;
    return next(error);
  }
  next();
}

module.exports = { attachCsrf, verifyCsrf, csrfToken };
