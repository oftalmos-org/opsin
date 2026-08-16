"""Backend de Opsin — puente de control remoto para Stream Deck. Sin
autenticación (v1): pensado para red local/confiable — ver ADR-001. No
sirve datos de paciente, solo comandos de UI (qué cartilla/línea/modo
mostrar)."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.remote_http import router as remote_http_router
from routes.remote_ws import router as remote_ws_router

app = FastAPI(title="Opsin backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # LAN-only, sin datos de paciente — ver docstring arriba.
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(remote_http_router)
app.include_router(remote_ws_router)


@app.get("/api/health")
async def health() -> dict:
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8106))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
