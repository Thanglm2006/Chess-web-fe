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

    connect(token) {
        if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
            return; // Already connected or connecting
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log("WebSocket Connected Successfully!");
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
            if (event.reason === "TOKEN_EXPIRED") {
                const newToken = await AuthService.refreshToken();
                localStorage.setItem("accessToken", newToken.accessToken);

                reconnectWebSocket();
            } else {
                console.warn("WebSocket closed:", event);
            }
        };
    }

    send(jsonMessage) {
        const msgStr = typeof jsonMessage === 'string' ? jsonMessage : JSON.stringify(jsonMessage);
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
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
