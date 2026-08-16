# Opsin backend — puente de control remoto (Stream Deck)

FastAPI, sin autenticación (LAN-only — ver `docs/adr/ADR-002-Remote-Control-Bridge.md`). Traduce comandos HTTP (los dispara un Elgato Stream Deck con el plugin "HTTP Request") a mensajes por WebSocket que recibe el frontend.

## Desarrollo

```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/uvicorn main:app --reload --port 8106
```

El frontend en dev (`npm run dev`, puerto 8006) ya tiene el proxy configurado en `vite.config.ts` — no hace falta CORS extra para desarrollo local.

## Endpoints

- `GET /api/health` — chequeo básico.
- `POST|GET /api/remote/key/{key}` — simula una tecla; el frontend la procesa exactamente igual que si se hubiera presionado en el teclado. `key` ∈ `ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Space, 1, 2, 3, 4, 5, 6, 7, f`.
- `POST|GET /api/remote/action/{action}` — acciones sin atajo de teclado propio. `action` ∈ `mirror-toggle, dark-background-toggle, laser-pointer-toggle, fullscreen-toggle`.
- `GET /ws/remote` — WebSocket que consume el frontend (no lo llames desde Stream Deck).

Ambos endpoints HTTP aceptan GET y POST — GET porque varios plugins gratuitos de Stream Deck solo soportan GET sin body.

## Configurar un botón de Stream Deck

Con el plugin "HTTP Request" (o equivalente): método GET, URL `http://<ip-de-la-máquina>:8106/api/remote/key/ArrowDown` (por ejemplo, para "siguiente línea"). Repetir un botón por comando.

**Limitación conocida:** `fullscreen-toggle` no puede *activar* pantalla completa desde un comando remoto — los navegadores exigen que `requestFullscreen()` se dispare desde un gesto directo del usuario (clic/tecla real en la página), no desde un mensaje de WebSocket. Sí puede *salir* de pantalla completa remotamente. Para entrar, hay que usar la tecla `f` o el botón en la propia pantalla.

## Preset completo (Stream Deck+ y XL)

Ver [`docs/stream-deck-preset.md`](../docs/stream-deck-preset.md) — tabla de botones lista para copiar/pegar, con el plugin recomendado ("Web Requests" del Marketplace de Elgato) y layouts para 8 botones (Stream Deck+/Mini) y 32 botones (XL).
