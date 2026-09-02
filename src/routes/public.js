'use strict';

const express = require('express');
const site = require('../content/site');
const projects = require('../content/projects');
const config = require('../config');

const router = express.Router();

router.get('/', (req, res) => {
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  res.render('pages/home', { title: null, featured: featured.length ? featured : projects.slice(0, 3) });
});

router.get('/work', (req, res) => {
  const categories = [...new Set(projects.map((p) => p.category))].sort();
  const requested = typeof req.query.category === 'string' ? req.query.category : '';
  const activeCategory = categories.includes(requested) ? requested : null;

  res.render('pages/work', {
    title: 'Work',
    metaDescription: `Selected film and video work by ${site.name}.`,
    projects: activeCategory ? projects.filter((p) => p.category === activeCategory) : projects,
    categories,
    activeCategory,
  });
});

router.get('/work/:slug', (req, res, next) => {
  const index = projects.findIndex((p) => p.slug === req.params.slug);
  if (index === -1) return next();

  res.render('pages/project', {
    title: projects[index].title,
    metaDescription: projects[index].summary,
    project: projects[index],
    previous: projects[index - 1] || null,
    next: projects[index + 1] || null,
  });
});

router.get('/services', (req, res) => {
  res.render('pages/services', { title: 'Services', metaDescription: `Production services from ${site.name}.` });
});

router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About', metaDescription: site.about.lead });
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
});

router.get('/sitemap.xml', (req, res) => {
  const paths = ['/', '/work', '/services', '/about', '/contact', ...projects.map((p) => `/work/${p.slug}`)];
  const urls = paths
    .map((path) => `  <url><loc>${config.siteUrl}${path}</loc></url>`)
    .join('\n');
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
});

module.exports = router;
