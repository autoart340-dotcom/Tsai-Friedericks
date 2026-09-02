'use strict';

const crypto = require('node:crypto');
const config = require('../config');

// Visitor IPs are only ever stored as a salted hash. This is enough to spot a
// single source flooding the form, without retaining personal data.
function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHmac('sha256', config.ipSalt).update(String(ip)).digest('hex').slice(0, 32);
}

module.exports = { hashIp };
