'use strict';

const { z } = require('zod');

const trimmed = (max) => z.string().trim().max(max);

// Kept in sync with the select options rendered on the contact page.
const PROJECT_TYPES = ['Commercial', 'Music video', 'Documentary', 'Corporate / brand', 'Event', 'Other'];
const BUDGET_RANGES = ['Under 5k', '5k - 15k', '15k - 50k', '50k+', 'Not sure yet'];
const TIMELINES = ['ASAP', 'Within a month', '1 - 3 months', '3 months+', 'Flexible'];

const inquirySchema = z.object({
  name: trimmed(120).min(2, 'Please enter your name.'),
  email: trimmed(200).pipe(z.email('Please enter a valid email address.')),
  phone: trimmed(40).optional().or(z.literal('')),
  company: trimmed(160).optional().or(z.literal('')),
  project_type: z.enum(PROJECT_TYPES).optional().or(z.literal('')),
  budget_range: z.enum(BUDGET_RANGES).optional().or(z.literal('')),
  timeline: z.enum(TIMELINES).optional().or(z.literal('')),
  message: trimmed(5000).min(10, 'Please tell us a little more about the project.'),
});

const loginSchema = z.object({
  email: trimmed(200).pipe(z.email('Enter a valid email address.')),
  password: z.string().min(1, 'Enter your password.').max(200),
});

// Turns a zod error into { field: message } for redisplay next to each input.
function fieldErrors(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

module.exports = { inquirySchema, loginSchema, fieldErrors, PROJECT_TYPES, BUDGET_RANGES, TIMELINES };
