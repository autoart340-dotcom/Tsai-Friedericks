'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { verifyCsrf } = require('../middleware/csrf');
const { loginLimiter } = require('../middleware/rateLimit');
const { loginSchema } = require('../lib/validate');
const { toCsv } = require('../lib/csv');
const mailer = require('../lib/mailer');

const router = express.Router();
const PAGE_SIZE = 25;
const STATUSES = ['new', 'read', 'replied', 'archived'];

// Only allow redirects to our own admin area, never to an attacker's host.
function safeNext(value) {
  return typeof value === 'string' && /^\/admin(\/|$)/.test(value) ? value : '/admin';
}

router.get('/admin/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('admin/login', {
    title: 'Sign in',
    values: {},
    formError: null,
    next: safeNext(req.query.next),
  });
});

router.post('/admin/login', loginLimiter, verifyCsrf, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    const fail = () =>
      res.status(401).render('admin/login', {
        title: 'Sign in',
        values: { email: req.body.email || '' },
        // Deliberately identical for unknown email and wrong password.
        formError: 'Those credentials were not recognised.',
        next: safeNext(req.body.next),
      });

    if (!parsed.success) return fail();

    const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(parsed.data.email);
    // Compare against a dummy hash when the user is missing, so response time
    // does not reveal whether an email address exists.
    const hash = user ? user.password_hash : '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu';
    const ok = await bcrypt.compare(parsed.data.password, hash);
    if (!user || !ok) return fail();

    // Rotate the session identifier on privilege change.
    req.session.csrf = null;
    req.session.adminId = user.id;
    req.session.adminEmail = user.email;
    db.prepare("UPDATE admin_users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

    res.redirect(safeNext(req.body.next));
  } catch (error) {
    next(error);
  }
});

router.post('/admin/logout', verifyCsrf, (req, res) => {
  req.session = null;
  res.redirect('/admin/login');
});

router.get('/admin', requireAuth, (req, res) => {
  const row = db
    .prepare(
      `SELECT
         COUNT(*)                                       AS total,
         SUM(CASE WHEN status = 'new'     THEN 1 ELSE 0 END) AS "new",
         SUM(CASE WHEN status = 'read'    THEN 1 ELSE 0 END) AS "read",
         SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) AS replied
       FROM inquiries`
    )
    .get();

  res.render('admin/dashboard', {
    title: 'Dashboard',
    counts: { total: row.total || 0, new: row.new || 0, read: row.read || 0, replied: row.replied || 0 },
    recent: db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC, id DESC LIMIT 8').all(),
    mailerConfigured: mailer.isConfigured(),
  });
});

// Shared WHERE builder so the list view and the CSV export can never disagree.
function buildFilter(query) {
  const status = STATUSES.includes(query.status) ? query.status : '';
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : '';

  const clauses = [];
  const params = {};
  if (status) {
    clauses.push('status = @status');
    params.status = status;
  }
  if (q) {
    clauses.push('(name LIKE @q OR email LIKE @q OR company LIKE @q OR message LIKE @q)');
    params.q = `%${q}%`;
  }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params, status, q };
}

router.get('/admin/inquiries', requireAuth, (req, res) => {
  const { where, params, status, q } = buildFilter(req.query);
  const total = db.prepare(`SELECT COUNT(*) AS n FROM inquiries ${where}`).get(params).n;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), totalPages);

  const inquiries = db
    .prepare(`SELECT * FROM inquiries ${where} ORDER BY created_at DESC, id DESC LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });

  res.render('admin/inquiries', {
    title: 'Enquiries',
    inquiries,
    total,
    page,
    totalPages,
    filters: { status, q },
    buildPageUrl: (p) => {
      const search = new URLSearchParams();
      if (status) search.set('status', status);
      if (q) search.set('q', q);
      search.set('page', p);
      return `/admin/inquiries?${search.toString()}`;
    },
  });
});

// Declared before /admin/inquiries/:id so "export.csv" is not read as an id.
router.get('/admin/inquiries/export.csv', requireAuth, (req, res) => {
  const { where, params } = buildFilter(req.query);
  const rows = db.prepare(`SELECT * FROM inquiries ${where} ORDER BY created_at DESC, id DESC`).all(params);
  const columns = [
    'id', 'created_at', 'status', 'name', 'email', 'phone', 'company',
    'project_type', 'budget_range', 'timeline', 'message', 'admin_notes',
  ];
  const stamp = new Date().toISOString().slice(0, 10);
  res.type('text/csv').set('Content-Disposition', `attachment; filename="enquiries-${stamp}.csv"`);
  res.send(toCsv(columns, rows));
});

function findInquiry(req, res, next) {
  const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(Number(req.params.id));
  if (!inquiry) return next();
  req.inquiry = inquiry;
  next();
}

router.get('/admin/inquiries/:id', requireAuth, findInquiry, (req, res) => {
  // Opening an unread enquiry marks it read, so the "new" count means something.
  if (req.inquiry.status === 'new') {
    db.prepare("UPDATE inquiries SET status = 'read', updated_at = datetime('now') WHERE id = ?").run(req.inquiry.id);
    req.inquiry.status = 'read';
  }
  res.render('admin/inquiry', { title: `Enquiry from ${req.inquiry.name}`, inquiry: req.inquiry });
});

router.post('/admin/inquiries/:id/status', requireAuth, verifyCsrf, findInquiry, (req, res) => {
  if (STATUSES.includes(req.body.status)) {
    db.prepare("UPDATE inquiries SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .run(req.body.status, req.inquiry.id);
  }
  res.redirect(`/admin/inquiries/${req.inquiry.id}`);
});

router.post('/admin/inquiries/:id/notes', requireAuth, verifyCsrf, findInquiry, (req, res) => {
  db.prepare("UPDATE inquiries SET admin_notes = ?, updated_at = datetime('now') WHERE id = ?")
    .run(String(req.body.admin_notes || '').slice(0, 5000), req.inquiry.id);
  res.redirect(`/admin/inquiries/${req.inquiry.id}`);
});

router.post('/admin/inquiries/:id/delete', requireAuth, verifyCsrf, findInquiry, (req, res) => {
  db.prepare('DELETE FROM inquiries WHERE id = ?').run(req.inquiry.id);
  res.redirect('/admin/inquiries');
});

module.exports = router;
