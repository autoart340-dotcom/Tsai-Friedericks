'use strict';

function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) return next();
  const target = encodeURIComponent(req.originalUrl);
  return res.redirect(`/admin/login?next=${target}`);
}

// Makes the signed-in admin available to admin templates.
function attachAdmin(req, res, next) {
  res.locals.admin = req.session && req.session.adminId
    ? { id: req.session.adminId, email: req.session.adminEmail }
    : null;
  next();
}

module.exports = { requireAuth, attachAdmin };
