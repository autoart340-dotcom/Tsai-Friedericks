# Tsai-Friedericks

Website and enquiry management backend for Tsai-Friedericks, a film and video production company.

A public marketing site plus a password-protected admin dashboard. Every enquiry sent through
the contact form is written to a database and worked from the dashboard, so leads do not live
in an inbox.

## What it does

**Public site** — home with showreel, portfolio grid, project pages, services, about, contact.
Server rendered, no build step, works without JavaScript.

**Admin** — sign in at `/admin`. See new enquiries, open them, set status
(`new → read → replied → archived`), keep internal notes, search and filter, export to CSV.

## Requirements

- Node.js 20 or newer
- A host with a **persistent disk** (see [Deployment](#deployment))

## Running locally

```bash
npm install
cp .env.example .env
```

Fill in the two required secrets in `.env`. Generate each with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Create your admin account, then start the server:

```bash
npm run create-admin
npm start
```

The site is at `http://localhost:3000`, the dashboard at `http://localhost:3000/admin`.

Use `npm run dev` while editing — it restarts on change. Run the tests with `npm test`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SESSION_SECRET` | **Yes** | Signs the admin session cookie. The app refuses to start without it. |
| `IP_SALT` | **Yes** | Salts visitor IPs before storage. Raw IPs are never written to the database. |
| `SITE_URL` | Recommended | Public URL, used for `sitemap.xml` and social preview tags. |
| `PORT` | No | Defaults to `3000`. |
| `DATABASE_PATH` | No | Defaults to `data/app.sqlite`. |
| `SMTP_*`, `NOTIFY_EMAIL` | No | Email alerts for new enquiries. See below. |

Never commit `.env` — it is git-ignored.

### Email alerts are optional

Without SMTP settings the site works normally and enquiries are still saved; you simply are not
emailed about them, and the dashboard says so. Enquiries are written to the database **before**
any email is attempted, so a mail outage can never lose a lead.

To turn alerts on, set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` and `NOTIFY_EMAIL`.

## Editing content

All copy lives in `src/content/` — no route or template changes needed.

- `src/content/site.js` — company name, contact details, navigation, homepage copy, services, about
- `src/content/projects.js` — portfolio entries

**Adding a project is a code change plus a redeploy.** There is no browser-based editor; that was
a deliberate scope decision. Copy an existing entry in `projects.js`, change the fields, and give
it a unique `slug`. Cover images go in `public/img/` — the placeholders are SVGs sized 16:9,
replace them with real stills at 1600×900 or larger.

## Deployment

The app is a single Node process with a SQLite file. It runs anywhere that gives you a
**persistent disk**: Render, Railway, Fly.io, or any VPS.

**It will lose data on Vercel or Netlify serverless functions**, where the filesystem is
discarded between invocations. If you need to deploy there, the database must move to a hosted
Postgres first.

1. Set the environment variables from the table above, with `NODE_ENV=production`.
2. Mount a persistent volume and point `DATABASE_PATH` at it, e.g. `/data/app.sqlite`.
3. Deploy, then run `npm run create-admin` once on the host.
4. Put the app behind HTTPS. Session cookies are marked `secure` in production and will not be
   sent over plain HTTP.

Back up by copying the SQLite file — that single file is the whole database.

## Security

- Admin passwords hashed with bcrypt; sign-in failures never reveal whether an email exists
- CSRF tokens on every form; session cookies `httpOnly` and `sameSite=lax`
- Contact form rate limited to 5/hour per IP, sign-in to 10/15 minutes
- Honeypot field and a minimum fill time to defeat naive bots
- All input schema-validated; all output escaped; CSV export neutralises formula injection
- Content Security Policy set; the site cannot be framed
- Visitor IPs stored only as a salted hash

## Project layout

```
src/
  server.js          app wiring, security headers, error handling
  config.js          environment parsing, fails fast on missing secrets
  db/                connection, migrations — the only place the driver is used
  routes/            public.js, contact.js, admin.js
  middleware/        auth, CSRF, rate limiting, error pages
  lib/               validation, mailer, CSV, IP hashing
  content/           site copy and portfolio  ← edit here
views/               EJS templates
public/              CSS, client JS, images
scripts/             create-admin.js
tests/               node:test + supertest
```
