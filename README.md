# Opsin

Cartillas de agudeza visual standalone + control remoto (Stream Deck).

Competidor directo de [My Call Bag](https://mycallbag.com) / [amslergr.id](https://amslergr.id), construido desde cero (ningún código derivado de GPL) — ver [`docs/adr/ADR-001-Opsin-Independent-Module.md`](docs/adr/ADR-001-Opsin-Independent-Module.md).

## Stack

Vite + React 19 + TypeScript + Tailwind (frontend) · FastAPI (backend de control remoto).

## Desarrollo

```bash
npm install
npm run dev       # frontend en :8006
```

```bash
cd backend
uvicorn main:app --reload --port 8106
```

## Licencia

MIT — ver [`LICENSE`](LICENSE). Algunos assets de terceros (fuente, imágenes de patologías) mantienen su propia licencia — ver [`NOTICE.md`](NOTICE.md).
