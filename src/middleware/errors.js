'use strict';

const config = require('../config');

function notFound(req, res) {
  res.status(404).render('errors/404', { title: 'Page not found' });
}

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity.
function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  if (status >= 500) console.error(error);

  res.status(status).render('errors/500', {
    title: status === 403 ? 'Request blocked' : 'Something went wrong',
    status,
    // Never leak internals in production; 4xx messages are ours and safe to show.
    detail: status < 500 || !config.isProduction ? error.message : null,
  });
}

module.exports = { notFound, errorHandler };
