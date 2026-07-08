# Eurolab Pro

Professional desktop Laboratory Information Management System scaffold.

## Stack

- React
- TypeScript
- Electron
- Vite
- SQLite
- Tailwind CSS

## Project Structure

```text
app/
  index.html
  src/
    constants/
    features/
    layouts/
    pages/
    styles/
electron/
  main.ts
  preload.ts
  services/
database/
docs/
excel/
reports/
assets/
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run typecheck
```

The current implementation intentionally contains UI structure only. Business workflows, formulas, reports, export logic, and database schema should be added when the real laboratory process is defined.
