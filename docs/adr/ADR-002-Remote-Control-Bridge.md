# ADR-002 — Puente de control remoto (Stream Deck) vía FastAPI + WebSocket

**Fecha:** 2026-08-15
**Estado:** `accepted`
**Autor:** Dr. J.N. Jaurrieta Hinojos
**Tags:** #adr/closed #arquitectura/control-remoto

---

## Contexto

Opsin necesita poder controlarse desde un Elgato Stream Deck (u otro disparador HTTP) durante una consulta, sin que el examinador tenga que tocar el teclado/mouse de la pantalla que ve el paciente. Un SPA puro (servido estático) no puede escuchar en un puerto TCP — hace falta algo que reciba el request HTTP del Stream Deck y se lo pase al navegador con la cartilla abierta.

Ya existía toda la lógica de interacción implementada y probada para teclado real (flechas, espacio, 1-7, f) y para algunas acciones solo con checkbox (espejo, fondo oscuro, puntero láser, pantalla completa) en `App.tsx`.

## Decisión

**Decisión:** Backend FastAPI mínimo (`backend/`) con dos piezas:

1. `POST|GET /api/remote/key/{key}` — el Stream Deck "simula" una tecla. El backend valida contra una lista blanca y retransmite `{type: "key", key}` por WebSocket a todas las pestañas conectadas.
2. `POST|GET /api/remote/action/{action}` — para las 4 acciones sin atajo de teclado propio (espejo, fondo oscuro, puntero láser, pantalla completa), retransmite `{type: "action", action}`.

El frontend expone `RemoteClient` (`src/remote/RemoteClient.ts`), que se conecta a `/ws/remote` (proxeado por Vite en dev) y llama a los mismos callbacks (`handleCommandKey`, `handleRemoteAction`) que ya usa el listener de teclado real — **una sola fuente de verdad para "qué hace cada comando"**, no una reimplementación paralela para remoto.

Ambos endpoints HTTP aceptan GET además de POST porque varios plugins gratuitos de Stream Deck para macOS/Windows solo soportan GET sin body — prioriza compatibilidad sobre pureza REST.

Sin autenticación (v1): pensado para uso en red local/confiable únicamente.

---

## Alternativas consideradas

| Alternativa | Pros | Contras | Razón de descarte |
|---|---|---|---|
| Un endpoint HTTP por acción semántica (ej. `/next-line`, `/mirror`) en vez de "simular tecla" | Más legible en el Stream Deck | Duplica la lógica de qué hace cada comando (una vez en el teclado, otra en el backend/mapeo remoto) — riesgo de que diverjan | Reusar `handleCommandKey` es más simple y menos propenso a bugs de sincronía |
| Polling en vez de WebSocket | Sin necesidad de manejar reconexión | Latencia + carga innecesaria — un puntero láser o control en vivo necesita respuesta inmediata | WebSocket da respuesta inmediata sin polling constante |
| Body JSON en vez de path param (`POST /api/remote {action:"..."}`) | Más flexible / REST-ish | Varios plugins gratuitos de Stream Deck no soportan configurar body — path param funciona con cualquier plugin que solo pida una URL | Prioriza compatibilidad con el hardware real |

---

## Consecuencias

### Positivas
- Cero duplicación de lógica de interacción — el remoto literalmente "aprieta las mismas teclas" que ya estaban probadas.
- Funciona con los plugins de Stream Deck más simples/gratuitos (GET plano, sin body).

### Negativas / trade-offs
- `fullscreen-toggle` no puede **activar** pantalla completa desde un comando remoto — `requestFullscreen()` exige un gesto de usuario directo en la página (restricción de seguridad del navegador, no de Opsin). Sí puede salir de pantalla completa remotamente. Documentado en `backend/README.md`.
- Sin autenticación — cualquier dispositivo en la misma red puede mandar comandos. Aceptable en un despliegue de red local/confiable, pero a revisar si Opsin se despliega fuera de una red controlada.

### Riesgos
- Reconexión: si el backend se reinicia a mitad de consulta, el frontend reintenta conectar cada 2s (`RemoteClient`) — sin esto, un Stream Deck "muerto" silencioso sería confuso a mitad de consulta.

---

## Impacto en privacidad

Sin autenticación, confía en la red local. No hay dato de paciente en este flujo (solo comandos de UI: qué cartilla/línea/modo mostrar).

---

## Criterios de revisión

- Si Opsin se despliega fuera de una red controlada, revisar si hace falta autenticación mínima (ej. token compartido) antes de exponer `/api/remote/*`.

---

## Referencias

- [[ADR-001-Opsin-Independent-Module]]
- `backend/README.md` — cómo configurar un botón de Stream Deck

---

## Historial

| Fecha | Estado | Nota |
|---|---|---|
| 2026-08-15 | accepted | Decisión tomada en sesión de arquitectura con Claude |
