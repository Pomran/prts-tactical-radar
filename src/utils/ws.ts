/**
 * PRTS Tactical Radar — Presence WebSocket client (Level 1 realtime).
 *
 * Connects to /api/radar/ws, auto-reconnects with backoff, and dispatches
 * presence:init/join/update/leave + inbox:deliver messages to subscribers.
 * Exposes a simple subscribe/onStatus API used by the app store.
 */
import { PresenceMessage } from '../types';

const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/radar/ws`;

type MessageHandler = (msg: PresenceMessage) => void;
type StatusHandler = (connected: boolean) => void;

export class PresenceSocket {
  private ws: WebSocket | null = null;
  private handlers = new Set<MessageHandler>();
  private statusHandlers = new Set<StatusHandler>();
  private reconnectDelay = 500;
  private closedByUser = false;
  private connected = false;

  /** True once the socket has had at least one successful open (for fallback logic). */
  connectedOnce = false;

  start(): void {
    this.closedByUser = false;
    this.connect();
  }

  private connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    const ws = new WebSocket(WS_URL);
    this.ws = ws;

    ws.onopen = () => {
      this.connected = true;
      this.connectedOnce = true;
      this.reconnectDelay = 500;
      this.emitStatus(true);
    };

    ws.onmessage = (ev) => {
      let msg: PresenceMessage;
      try {
        msg = JSON.parse(String(ev.data));
      } catch {
        return;
      }
      if (!msg || typeof msg.type !== 'string') return;
      for (const h of this.handlers) {
        try { h(msg); } catch { /* ignore handler errors */ }
      }
    };

    ws.onclose = () => {
      this.connected = false;
      this.emitStatus(false);
      if (this.closedByUser) return;
      // Reconnect with exponential backoff (cap ~30s).
      const delay = this.reconnectDelay;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
      setTimeout(() => this.connect(), delay);
    };

    ws.onerror = () => {
      try { ws.close(); } catch { /* ignore */ }
    };
  }

  /** Send a presence:set upsert. Fire-and-forget. */
  sendPresence(presence: any): void {
    if (!this.connected || !this.ws) return;
    try {
      this.ws.send(JSON.stringify({ type: 'presence:set', presence }));
    } catch { /* ignore */ }
  }

  isConnected(): boolean {
    return this.connected;
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    // Replay current status immediately.
    handler(this.connected);
    return () => this.statusHandlers.delete(handler);
  }

  private emitStatus(connected: boolean): void {
    for (const h of this.statusHandlers) h(connected);
  }

  stop(): void {
    this.closedByUser = true;
    try { this.ws?.close(); } catch { /* ignore */ }
    this.ws = null;
    this.connected = false;
    this.emitStatus(false);
  }
}
