# Sin licencia declarada — ver NOTICE.md.
"""WebSocket que consume el frontend — se suscribe una vez y recibe cada
comando remoto (disparado por Stream Deck vía HTTP) en tiempo real."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from connection_manager import manager

router = APIRouter()


@router.websocket("/ws/remote")
async def remote_ws(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            # No esperamos mensajes del cliente — solo mantenemos la
            # conexión viva. recv() bloquea hasta que el cliente cierre.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
