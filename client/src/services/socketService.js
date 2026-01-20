import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:8080';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to Socket.IO Server');
        });

        this.socket.on('disconnect', () => {
            console.warn('❌ Disconnected from Socket.IO Server');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoom(roomId) {
        if (this.socket) {
            this.socket.emit('join_room', roomId);
        }
    }

    sendMessage(roomId, messageData) {
        if (this.socket) {
            this.socket.emit('send_message', {
                roomId,
                ...messageData
            });
        }
    }

    onReceiveMessage(callback) {
        if (this.socket) {
            this.socket.on('receive_message', callback);
        }
    }

    offReceiveMessage(callback) {
        if (this.socket) {
            this.socket.off('receive_message', callback);
        }
    }
}

export default new SocketService();
