'use strict';

const express = require('express');
const { db } = require('../db');
const { verifyCsrf } = require('../middleware/csrf');
const { contactLimiter } = require('../middleware/rateLimit');
const { inquirySchema, fieldErrors, PROJECT_TYPES, BUDGET_RANGES, TIMELINES } = require('../lib/validate');
const { hashIp } = require('../lib/hash');
const { notifyNewInquiry } = require('../lib/mailer');

const router = express.Router();

// A genuine person takes longer than this to read the page and fill the form.
const MIN_FILL_MS = 3000;

const formOptions = { projectTypes: PROJECT_TYPES, budgetRanges: BUDGET_RANGES, timelines: TIMELINES };

function renderForm(res, { values = {}, errors = {}, formError = null, status = 200 }) {
  res.status(status).render('pages/contact', {
    title: 'Contact',
    values,
    errors,
    formError,
    formLoadedAt: Date.now(),
    ...formOptions,
  });
}

router.get('/contact', (req, res) => renderForm(res, {}));

router.post('/contact', contactLimiter, verifyCsrf, async (req, res, next) => {
  try {
    // Honeypot: hidden from people, irresistible to naive bots.
    if (req.body.website) return res.redirect('/contact/thanks');

    const loadedAt = Number(req.body.form_loaded_at);
    if (Number.isFinite(loadedAt) && Date.now() - loadedAt < MIN_FILL_MS) {
      return renderForm(res, {
        values: req.body,
        errors: {},
        formError: 'That was submitted unusually quickly. Please try once more.',
        status: 422,
      });
    }

    const parsed = inquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return renderForm(res, {
        values: req.body,
        errors: fieldErrors(parsed.error),
        formError: 'Please correct the highlighted fields.',
        status: 422,
      });
    }

    const data = parsed.data;
    const result = db
      .prepare(
        `INSERT INTO inquiries
           (name, email, phone, company, project_type, budget_range, timeline, message,
            source_page, ip_hash, user_agent)
         VALUES (@name, @email, @phone, @company, @project_type, @budget_range, @timeline, @message,
                 @source_page, @ip_hash, @user_agent)`
      )
      .run({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        project_type: data.project_type || null,
        budget_range: data.budget_range || null,
        timeline: data.timeline || null,
        message: data.message,
        source_page: String(req.get('referer') || '/contact').slice(0, 300),
        ip_hash: hashIp(req.ip),
        user_agent: String(req.get('user-agent') || '').slice(0, 300),
      });

    // Saved first, notified second — a mail failure must never lose the lead.
    notifyNewInquiry({ id: result.lastInsertRowid, ...data }).catch(() => {});

    res.redirect('/contact/thanks');
  } catch (error) {
    next(error);
  }
});

router.get('/contact/thanks', (req, res) => {
  res.render('pages/thanks', { title: 'Thank you' });
});

module.exports = router;
