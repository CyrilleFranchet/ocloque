# ocloque — World clocks

Single-page app: **local time** on the left, **one or more IANA time zones** on the right, with a **+** button to add clocks. Clock titles use **short names** from the browser (`EST`, `IST`, …) with the **IANA** id below; the time zone picker includes **abbreviation shortcuts** (e.g. EST → `America/New_York`) for quicker search. Served as static files behind **nginx** in Docker.

## Requirements

- Node.js 22+ (for local development and the Docker build stage)

## Scripts

| Command | Description |
|--------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server |
| `npm test` | Vitest unit tests |
| `npm run build` | Typecheck and production build to `dist/` |

## Docker

Build and run with Compose (maps host **8080** to container **80**):

```bash
docker compose up --build
```

Then open `http://localhost:8080`.

Equivalent plain Docker:

```bash
docker build -t ocloque .
docker run --rm -p 8080:80 ocloque
```

The image runs `npm test` during the build so broken tests block the image.

## Documentation

- Product spec: [`docs/PRD.md`](docs/PRD.md)
- Implementation log: [`docs/progress.md`](docs/progress.md)
