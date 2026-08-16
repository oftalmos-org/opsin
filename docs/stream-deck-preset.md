# Preset de Stream Deck para Opsin

Guía para configurar los botones a mano (no es un archivo `.streamDeckProfile`
importable — el formato es un paquete binario propietario de Elgato y no vale
la pena arriesgarse a que no importe bien; esto se configura en unos minutos
y funciona en cualquier modelo: Stream Deck+, Mini, XL, etc.).

## 1. Plugin necesario

**Web Requests** (Elgato Marketplace) — hace `GET`/`POST` planos sin body,
que es exactamente lo que exponen los endpoints de Opsin.

- Buscar "Web Requests" dentro de la app de Stream Deck (ícono de tienda) o
  instalar desde [marketplace.elgato.com](https://marketplace.elgato.com/product/web-requests-d7d46868-f9c8-4fa5-b775-ab3b9a7c8add).
- Alternativa equivalente: **API Ninja** de BarRaider (docs.barraider.com).

Por cada botón: arrastrar la acción del plugin al botón, método **GET**, y
pegar la URL de la tabla de abajo.

## 2. URL base

```
http://<IP-de-la-máquina-que-corre-el-backend>:8106
```

- En pruebas (misma máquina que el navegador): `http://localhost:8106`.
- En el consultorio: la IP de la máquina donde corre `uvicorn main:app --port 8106`
  (ver `backend/README.md`). Confirmar que el Stream Deck esté en la misma
  red que esa máquina.

Todas las URLs de este documento asumen esa base — reemplazar `<BASE>`.

## 3. Layout — Stream Deck+ / Mini (pruebas, 8 botones)

Un solo panel, sin carpetas. Cubre lo esencial: elegir tipo de cartilla y
pantalla completa.

| Botón | Título sugerido | URL |
|---|---|---|
| 1 | Sloan | `<BASE>/api/remote/key/1` |
| 2 | Fijación | `<BASE>/api/remote/key/2` |
| 3 | Pediátrico | `<BASE>/api/remote/key/3` |
| 4 | Patologías | `<BASE>/api/remote/key/4` |
| 5 | Tumbling E | `<BASE>/api/remote/key/5` |
| 6 | Landolt C | `<BASE>/api/remote/key/6` |
| 7 | HOTV | `<BASE>/api/remote/key/7` |
| 8 | Pantalla completa | `<BASE>/api/remote/key/f` |

## 4. Layout — Stream Deck XL (consultorio, 32 botones)

Todo en una sola página, sin necesidad de carpetas/folders.

**Fila 1 — tipo de cartilla (igual que arriba, botones 1-8):**

| Botón | Título | URL |
|---|---|---|
| 1 | Sloan | `<BASE>/api/remote/key/1` |
| 2 | Fijación | `<BASE>/api/remote/key/2` |
| 3 | Pediátrico | `<BASE>/api/remote/key/3` |
| 4 | Patologías | `<BASE>/api/remote/key/4` |
| 5 | Tumbling E | `<BASE>/api/remote/key/5` |
| 6 | Landolt C | `<BASE>/api/remote/key/6` |
| 7 | HOTV | `<BASE>/api/remote/key/7` |
| 8 | Pantalla completa | `<BASE>/api/remote/key/f` |

**Fila 2 — navegación (nivel AV / diagrama según modo):**

| Botón | Título | URL |
|---|---|---|
| 9 | ↑ Subir línea / agrandar | `<BASE>/api/remote/key/ArrowUp` |
| 10 | ↓ Bajar línea / achicar | `<BASE>/api/remote/key/ArrowDown` |
| 11 | ← Aleatorizar / diagrama anterior | `<BASE>/api/remote/key/ArrowLeft` |
| 12 | → Aleatorizar / diagrama siguiente | `<BASE>/api/remote/key/ArrowRight` |
| 13 | ⎵ Cambiar modo despliegue | `<BASE>/api/remote/key/Space` |

**Fila 3 — toggles:**

| Botón | Título | URL |
|---|---|---|
| 17 | Espejo | `<BASE>/api/remote/action/mirror-toggle` |
| 18 | Fondo oscuro | `<BASE>/api/remote/action/dark-background-toggle` |
| 19 | Puntero láser | `<BASE>/api/remote/action/laser-pointer-toggle` |
| 20 | Pantalla completa (toggle) | `<BASE>/api/remote/action/fullscreen-toggle` |

El resto de los 32 botones de la XL quedan libres para lo que se agregue
después (por ejemplo, atajos directos a patologías específicas si se
justifica más adelante).

## 5. Notas importantes

- **`fullscreen-toggle` / tecla `f` no pueden *activar* pantalla completa
  remotamente** — es una restricción de seguridad del navegador
  (`requestFullscreen()` exige un gesto de usuario real en la página, no
  puede venir de un WebSocket). Sí pueden **salir** de pantalla completa.
  Para entrar hay que usar la tecla `f` o el botón en la propia pantalla del
  paciente al menos la primera vez.
- Los endpoints son `GET` sin autenticación — pensado para red local/confiable
  (ver `docs/adr/ADR-002-Remote-Control-Bridge.md`). No exponer el backend
  fuera de esa red sin agregar autenticación.
- Si el backend se reinicia a mitad de consulta, el frontend reconecta el
  WebSocket solo en ~2s — no hace falta recargar la página del paciente.
