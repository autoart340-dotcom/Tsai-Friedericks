'use strict';

const config = require('../config');

let transport = null;

if (config.smtp.configured) {
  try {
    const nodemailer = require('nodemailer');
    transport = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  } catch (error) {
    console.warn('[mailer] nodemailer unavailable, email alerts disabled:', error.message);
  }
}

// Notification is best effort by design. The enquiry is already committed to the
// database before this runs, so a mail outage can never lose a lead.
async function notifyNewInquiry(inquiry) {
  if (!transport) return { sent: false, reason: 'smtp-not-configured' };

  try {
    await transport.sendMail({
      from: config.smtp.from,
      to: config.smtp.to,
      replyTo: inquiry.email,
      subject: `New enquiry from ${inquiry.name}`,
      text: [
        `Name:     ${inquiry.name}`,
        `Email:    ${inquiry.email}`,
        `Phone:    ${inquiry.phone || '-'}`,
        `Company:  ${inquiry.company || '-'}`,
        `Type:     ${inquiry.project_type || '-'}`,
        `Budget:   ${inquiry.budget_range || '-'}`,
        `Timeline: ${inquiry.timeline || '-'}`,
        '',
        inquiry.message,
        '',
        `View it: ${config.siteUrl}/admin/inquiries/${inquiry.id}`,
      ].join('\n'),
    });
    return { sent: true };
  } catch (error) {
    console.error('[mailer] failed to send enquiry alert:', error.message);
    return { sent: false, reason: error.message };
  }
}

module.exports = { notifyNewInquiry, isConfigured: () => Boolean(transport) };
