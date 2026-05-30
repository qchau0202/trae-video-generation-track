# Liquid Frontend

Web UI for Liquid (Brand Vault → Framework → Campaign → Generate → Compare → Feedback → Export).

## Environment variables

- `VITE_API_URL` (default in `.env.development`: `http://localhost:5000/api/v1`)

## Run

```bash
npm install
npm run dev
```

## Routes

- `/login`
- `/` (dashboard)
- `/brand-vault`
- `/products`
- `/offers`
- `/frameworks`
- `/campaigns` and `/campaigns/new` and `/campaigns/:id`
- `/share/:token` (public review link)
