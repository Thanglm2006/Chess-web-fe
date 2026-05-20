import { AuthService } from "./AuthService";
export class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Set();
        this.messageQueue = [];
    }

    addListener(handler) {
        this.listeners.add(handler);
    }

    removeListener(handler) {
        this.listeners.delete(handler);
    }

    async connect() {
        if (this.socket &&
            (this.socket.readyState === WebSocket.OPEN ||
             this.socket.readyState === WebSocket.CONNECTING)) {
            return;
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

            while (this.messageQueue.length > 0) {
                const msg = this.messageQueue.shift();
                this.socket.send(msg);
            }
        };

        this.socket.onmessage = (event) => {
            this.listeners.forEach(handler => handler(event.data));
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        this.socket.onclose = async (event) => {
            console.warn("Socket closed:", event.reason);

            this.socket = null;

            if (event.reason === "TOKEN_EXPIRED") {
                try {
                    await AuthService.refreshToken();

                    await this.connect();
                } catch (err) {
                    console.error("Refresh failed", err);
                }
            }
        };
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
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}
export const socketClient = new SocketService();