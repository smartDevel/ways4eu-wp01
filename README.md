# ways4euwp-01

Next.js frontend for [ways4eu.wordpress.com](https://ways4eu.wordpress.com/).

## Development

Use Node.js 22:

```bash
npm ci
npm run dev
```

The application reads public posts, pages, authors, tags, and categories from
the WordPress.com REST API. No local secrets are required.

## Verification

```bash
npm run lint
npm run build
npm start
```
