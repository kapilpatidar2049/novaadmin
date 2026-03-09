# Nova Beauty Admin

Admin dashboard for **Nova Beauty** – *Salon feel at home*.

## Project info

- **Brand**: Nova Beauty
- **Purpose**: Admin panel for managing cities, vendors, beauticians, services, appointments, and reports.

## Getting started

**Requirements**: Node.js & npm – [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Install dependencies
npm i

# Start the development server
npm run dev
```

Then open http://localhost:8080 (or the URL shown in the terminal).

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start dev server with HMR      |
| `npm run build`| Production build              |
| `npm run preview` | Preview production build   |
| `npm run lint` | Run ESLint                     |
| `npm run test` | Run tests                      |

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Router
- TanStack Query

## Deployment

Build for production:

```sh
npm run build
```

Serve the `dist` folder with any static host (e.g. nginx, Netlify, Vercel). Set `VITE_BASE_URL` when the app is served from a subpath (e.g. `/admin/`).
