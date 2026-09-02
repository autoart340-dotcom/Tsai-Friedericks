'use strict';

// A leading =, +, - or @ makes spreadsheet software treat a cell as a formula.
// Prefixing with a quote neutralises that without altering the visible text.
function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  const guarded = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
}

function toCsv(columns, rows) {
  const lines = [columns.map(escapeCell).join(',')];
  for (const row of rows) {
    lines.push(columns.map((column) => escapeCell(row[column])).join(','));
  }
  return `﻿${lines.join('\r\n')}\r\n`;
}

module.exports = { toCsv, escapeCell };
