// Cliente WebSocket para el puente de control remoto (Stream Deck) — se
// conecta a /ws/remote (proxeado por Vite en dev, servido directo por el
// backend en prod) y reenvía cada comando recibido a los callbacks
// registrados desde App.tsx. Reconecta solo automáticamente si la
// conexión se corta (ej. backend reiniciado).

export type RemoteMessage = { type: 'key'; key: string } | { type: 'action'; action: string }

export interface RemoteClientCallbacks {
  onKey: (key: string) => void
  onAction: (action: string) => void
}

export class RemoteClient {
  private ws: WebSocket | null = null
  private callbacks: RemoteClientCallbacks
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private closedByUser = false

  constructor(callbacks: RemoteClientCallbacks) {
    this.callbacks = callbacks
  }

  connect(): void {
    this.closedByUser = false
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/ws/remote`
    const ws = new WebSocket(url)

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as RemoteMessage
        if (msg.type === 'key') this.callbacks.onKey(msg.key)
        else if (msg.type === 'action') this.callbacks.onAction(msg.action)
      } catch {
        // mensaje no-JSON o con forma inesperada — se ignora, no es fatal.
      }
    }

    ws.onclose = () => {
      if (!this.closedByUser) {
        this.reconnectTimer = setTimeout(() => this.connect(), 2000)
      }
    }

    this.ws = ws
  }

  disconnect(): void {
    this.closedByUser = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
  }
}
