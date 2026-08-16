# ADR-001 — Opsin como repositorio independiente, sin derivación de GPL

**Fecha:** 2026-08-15
**Estado:** `accepted`
**Autor:** Dr. J.N. Jaurrieta Hinojos
**Tags:** #adr/closed #arquitectura/modularidad #licenciamiento

---

## Contexto

Se identificó un producto comercial competidor, My Call Bag (mycallbag.com / amslergr.id) — cartillas de agudeza visual con control remoto, patente en trámite. Existía un experimento previo apuntando al upstream de terceros **Open Optometry (GPLv2)**, con cambios locales sin commitear (4 tipos de cartilla nuevos, corrección de rutas de assets).

GPLv2 es copyleft: cualquier derivado que se distribuya debe también ser GPLv2 y ofrecer el código fuente a quien lo reciba. Esto es incompatible con la intención de publicar Opsin bajo una licencia permisiva (MIT) y de mantener abierta la puerta a integraciones propietarias futuras en un fork privado separado.

Adicionalmente, el control remoto tipo Stream Deck requiere que algo escuche en un puerto TCP local — un SPA puro servido estáticamente no puede hacerlo, así que se necesita un backend local, aunque sea mínimo.

## Decisión

**Decisión:** Opsin vive en un repositorio independiente, público, bajo licencia MIT. Los optotipos y el motor de renderizado se construyen **desde cero**, sin copiar, adaptar, ni consultar código de Open Optometry mientras se escriben — usando estándares de dominio público (ISO 8596 para Landolt C, proporciones Sloan de 1959/NAS, grid clásico 5×5 para Tumbling E).

### Licencia

Todo el código original del repositorio es **MIT** desde el bootstrap (ver `LICENSE`). Los pocos assets de terceros incluidos (fuente Optician Sans, imágenes de patologías) mantienen su propia licencia — documentado en `NOTICE.md`. Integraciones específicas con otros sistemas clínicos, si se construyen, viven en un fork privado separado y no forman parte de este repositorio público.

### Control remoto

Backend local en FastAPI. Expone `POST /api/remote/*` para que el plugin "HTTP Request" de Stream Deck lo dispare, y difunde los comandos por `GET /ws/remote` a la pestaña del navegador con la cartilla abierta. Sin autenticación en v1 — pensado para uso en red local/confiable (ver sección de riesgos).

### Integración con sistemas externos

Opcional, vía `.env` + API REST: sin configuración, Opsin corre standalone sin escribir resultados a ningún sistema externo.

---

## Alternativas consideradas

| Alternativa | Pros | Contras | Razón de descarte |
|---|---|---|---|
| Fork de Open Optometry | Menos trabajo inicial, base ya probada | GPLv2 obliga a que cualquier derivado distribuido también sea GPLv2 | Incompatible con publicar bajo MIT |
| Control remoto vía QR + relay en la nube (como My Call Bag) | Más flexible, funciona fuera de LAN | Requiere infraestructura de relay, más trabajo para el MVP | Pospuesto — LAN-only con Stream Deck cubre el caso de uso actual |
| Integrar el renderizado directo dentro de un sistema clínico existente | Integración más simple | Opsin tiene dominio propio (renderizado gráfico, calibración física) sin relación con ningún modelo de datos clínico específico; además se busca poder distribuirlo/licenciarlo standalone | Acoplamiento innecesario |

---

## Consecuencias

### Positivas
- Cero riesgo de contaminación de licencia GPL.
- Reutilizable/vendible/embebible como producto standalone (código MIT).

### Negativas / trade-offs
- Más trabajo inicial que forkear Open Optometry — hay que construir cada optotipo desde cero.
- Necesita un backend local (FastAPI) solo para el puente de control remoto, aunque el resto de la app sea un SPA estático.

### Riesgos
- Que alguien copie/pegue de Open Optometry "por accidente" durante el desarrollo — mitigado manteniendo ese código fuera del checkout y del historial de git de este repositorio.
- Sin autenticación en el backend de control remoto v1 — mitigado asumiendo despliegue en red local/confiable únicamente; a revisar si se expone fuera de ese contexto.

---

## Impacto en privacidad

El backend de control remoto corre sin autenticación, pensado para red local/confiable únicamente. No hay dato de paciente en el MVP (solo calibración de pantalla y comandos de despliegue de cartilla).

---

## Criterios de revisión

- Si el modelo de confianza LAN-only deja de ser suficiente (ej. despliegue fuera de una red controlada), revisar autenticación del backend de control remoto.

---

## Referencias

- [[ADR-002-Remote-Control-Bridge]]

---

## Historial

| Fecha | Estado | Nota |
|---|---|---|
| 2026-08-15 | accepted | Decisión tomada en sesión de arquitectura con Claude |
