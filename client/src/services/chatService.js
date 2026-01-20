import api from '../utils/api';
import socketService from './socketService';

const chatService = {
    // Fetch all available rooms (public + private)
    getRooms: async () => {
        try {
            const response = await api.get('/chat/rooms');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch rooms", error);
            // Fallback mock data if backend not ready or empty
            return [
                { id: '00000000-0000-0000-0000-000000000001', name: "General Lounge", type: 'public', avatar: 'bg-indigo-300' }
            ];
        }
    },

    // Fetch message history for a room
    getHistory: async (roomId) => {
        try {
            const response = await api.get(`/chat/history/${roomId}`);
            return response.data.map(msg => ({
                id: msg.id,
                text: msg.content,
                roomId: msg.room_id,
                senderId: msg.sender_id,
                senderName: msg.sender_name || 'User',
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: msg.created_at // Keep raw for sorting if needed
            }));
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    },

    // Initiate (or get) a private chat
    initiatePrivateChat: async (targetUserId, targetUserName) => {
        try {
            const response = await api.post('/chat/private', { targetUserId, targetUserName });
            return response.data;
        } catch (error) {
            console.error("Failed to initiate chat", error);
            throw error;
        }
    }
};

export default chatService;
