// Thin native WebSocket wrapper that mirrors the socket.io-client API used in Seats.tsx.
// Messages are JSON: { type: string, payload: any }
// The Go WebSocket server speaks this same envelope.

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

type Listener = (payload: any) => void;

class SocketClient {
    private ws: WebSocket | null = null;
    private listeners = new Map<string, Set<Listener>>();
    private connected = false;

    get id() { return this.ws?.url ?? null; }

    connect() {
        if (this.connected) return;
        this.ws = new WebSocket(WS_URL);

        this.ws.onmessage = (event) => {
            try {
                const { type, payload } = JSON.parse(event.data as string);
                this.listeners.get(type)?.forEach((fn) => fn(payload));
            } catch { /* malformed frame — ignore */ }
        };

        this.ws.onopen = () => { this.connected = true; };

        this.ws.onclose = () => {
            this.connected = false;
            this.ws = null;
        };
    }

    disconnect() {
        this.ws?.close();
        this.connected = false;
        this.ws = null;
    }

    emit(type: string, payload?: any) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify({ type, payload }));
    }

    on(type: string, fn: Listener) {
        if (!this.listeners.has(type)) this.listeners.set(type, new Set());
        this.listeners.get(type)!.add(fn);
    }

    off(type: string, fn?: Listener) {
        if (!fn) { this.listeners.delete(type); return; }
        this.listeners.get(type)?.delete(fn);
    }
}

const socket = new SocketClient();
export default socket;
