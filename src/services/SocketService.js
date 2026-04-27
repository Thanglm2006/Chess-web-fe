export class SocketService {
    constructor() {
        this.socket = null;
        this.messageHandler = null;
    }

    connect(token, handler) {
        this.messageHandler = handler;
        if (this.socket) {
            this.socket.close();
        }

        // Vite proxy maps /ws to ws://localhost:8080
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log("WebSocket Connected Successfully!");
        };

        this.socket.onmessage = (event) => {
            if (this.messageHandler) {
                this.messageHandler(event.data);
            }
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };
        
        this.socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };
    }

    send(jsonMessage) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(typeof jsonMessage === 'string' ? jsonMessage : JSON.stringify(jsonMessage));
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
