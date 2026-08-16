# Sin licencia declarada — ver NOTICE.md.
"""Endpoints HTTP que dispara Stream Deck (plugin "HTTP Request" — GET o
POST, sin necesidad de configurar body/headers, para máxima compatibilidad
con los plugins gratuitos más simples). Cada request se traduce en un
mensaje por WebSocket a todas las pestañas conectadas.

Dos familias de comando:
- /key/{key}: simula una tecla — el frontend reusa exactamente la misma
  lógica que ya tiene para el teclado real (ver App.tsx, handleCommandKey).
- /action/{action}: acciones que no tienen atajo de teclado propio
  (espejo, fondo oscuro, puntero láser, pantalla completa).
"""

from fastapi import APIRouter, HTTPException

from connection_manager import manager

router = APIRouter(prefix="/api/remote")

ALLOWED_KEYS = {
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "f",
}

ALLOWED_ACTIONS = {
    "mirror-toggle",
    "dark-background-toggle",
    "laser-pointer-toggle",
    "fullscreen-toggle",
}


@router.api_route("/key/{key}", methods=["GET", "POST"])
async def send_key(key: str) -> dict:
    if key not in ALLOWED_KEYS:
        raise HTTPException(status_code=400, detail=f"key no reconocida: {key}")
    await manager.broadcast({"type": "key", "key": key})
    return {"ok": True, "key": key}


@router.api_route("/action/{action}", methods=["GET", "POST"])
async def send_action(action: str) -> dict:
    if action not in ALLOWED_ACTIONS:
        raise HTTPException(status_code=400, detail=f"action no reconocida: {action}")
    await manager.broadcast({"type": "action", "action": action})
    return {"ok": True, "action": action}
