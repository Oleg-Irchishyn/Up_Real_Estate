# UP Real Estate

A static landing page for a real estate agency: hero banner, featured listings,
latest properties, agent profiles, testimonials, partners and a contact section.
Built with Gulp (Nunjucks for HTML, Sass for styles, Webpack + Babel for JS).

Live demo: https://oleg-irchishyn.github.io/Up_Real_Estate/web/

## Requirements

- Node.js and npm

## Local setup

```bash
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is required: this project's build tooling (Gulp 3 and
several of its plugins) predates modern npm's strict peer-dependency
resolution.

## Running locally

```bash
npm run dev
```

Builds the project into `dev/`, starts a dev server at `http://localhost:9451`
with live reload, and watches `src/` for changes.

## Production build

```bash
npm run build
```

Builds the minified, production-ready site into `web/` — this is the folder
GitHub Pages serves.
