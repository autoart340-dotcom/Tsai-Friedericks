'use strict';

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieSession = require('cookie-session');

const config = require('./config');
const site = require('./content/site');
const { connect } = require('./db');
const { attachCsrf } = require('./middleware/csrf');
const { attachAdmin } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errors');

function createApp() {
  const app = express();

  connect();

  // Correct client IPs behind a single reverse proxy (Render, Railway, nginx).
  app.set('trust proxy', 1);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          // Video embeds are the one third party we allow to render.
          frameSrc: ["'self'", 'https://player.vimeo.com', 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: config.isProduction ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(compression());
  if (!config.isTest) app.use(morgan(config.isProduction ? 'combined' : 'dev'));

  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: config.isProduction ? '7d' : 0 }));

  app.use(
    cookieSession({
      name: 'tf_session',
      keys: [config.sessionSecret],
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction,
      maxAge: 12 * 60 * 60 * 1000,
    })
  );

  // Template globals available to every view.
  app.use((req, res, nextMiddleware) => {
    res.locals.site = site;
    res.locals.siteUrl = config.siteUrl;
    res.locals.currentPath = req.path;
    res.locals.title = null;
    nextMiddleware();
  });
  app.use(attachCsrf);
  app.use(attachAdmin);

  app.use(require('./routes/public'));
  app.use(require('./routes/contact'));
  app.use(require('./routes/admin'));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  createApp().listen(config.port, () => {
    console.log(`${site.name} running at http://localhost:${config.port} (${config.env})`);
  });
}

module.exports = { createApp };
