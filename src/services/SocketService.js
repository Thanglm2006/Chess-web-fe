import { AuthService } from "./AuthService";
export class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Set();
        this.messageQueue = [];
        this.pingInterval = null;
        this.reconnectTimeout = null;
        this.reconnectDelay = 1000;
        this.intentionalDisconnect = false;
    }

    addListener(handler) {
        this.listeners.add(handler);
    }

    removeListener(handler) {
        this.listeners.delete(handler);
    }

    async connect() {
        this.intentionalDisconnect = false;

        if (this.socket &&
            (this.socket.readyState === WebSocket.OPEN ||
             this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        const token = await AuthService.getValidToken();

        if (!token) {
            console.error("No valid token");
            return;
        }

        let wsHost = window.location.host;
        let wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            if (apiBaseUrl) {
                const url = new URL(apiBaseUrl);
                wsHost = url.host;
                wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
            }
        } catch (e) {
            console.error("Failed to parse dynamic WS host", e);
        }

        const wsUrl = `${wsProtocol}//${wsHost}/ws?token=${token}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log("WebSocket Connected!");
            this.reconnectDelay = 1000; // Reset backoff delay

            while (this.messageQueue.length > 0) {
                const msg = this.messageQueue.shift();
                this.socket.send(msg);
            }

            this.startHeartbeat();
        };

        this.socket.onmessage = (event) => {
            this.listeners.forEach(handler => handler(event.data));
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        this.socket.onclose = async (event) => {
            console.warn("Socket closed:", event.reason, "Code:", event.code);
            this.socket = null;
            this.stopHeartbeat();

            if (this.intentionalDisconnect) {
                return;
            }

            if (event.reason === "TOKEN_EXPIRED") {
                try {
                    await AuthService.refreshToken();
                    await this.connect();
                    return;
                } catch (err) {
                    console.error("Refresh failed during onclose", err);
                }
            }

            // Auto reconnect with exponential backoff
            console.log(`WebSocket will attempt to reconnect in ${this.reconnectDelay}ms...`);
            this.reconnectTimeout = setTimeout(() => {
                this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
                this.connect();
            }, this.reconnectDelay);
        };
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.pingInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.send({ type: "PING" });
            }
        }, 30000); // Send PING every 30 seconds to keep connection alive
    }

    stopHeartbeat() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    send(jsonMessage) {
        const msgStr =
            typeof jsonMessage === "string"
                ? jsonMessage
                : JSON.stringify(jsonMessage);

        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(msgStr);
        } else {
            this.messageQueue.push(msgStr);
        }
    }

    disconnect() {
        this.intentionalDisconnect = true;
        this.stopHeartbeat();
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}
export const socketClient = new SocketService();