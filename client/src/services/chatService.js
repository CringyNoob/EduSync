// src/services/chatService.js
// Frontend Service for Chat API and Socket.io
import { io } from 'socket.io-client';
import api from '../utils/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3006';

class ChatService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    // =============================================
    // SOCKET CONNECTION MANAGEMENT
    // =============================================

    /**
     * Connect to Socket.io server
     * @param {string} token - JWT token for authentication
     */
    connect(token) {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Connection event handlers
        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
        });

        this.socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
            // Trigger any registered error listeners
            this._notifyListeners('error', error);
        });

        return this.socket;
    }

    /**
     * Disconnect from Socket.io server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Check if socket is connected
     */
    isConnected() {
        return this.socket?.connected || false;
    }

    // =============================================
    // SOCKET EVENT HANDLERS
    // =============================================

    /**
     * Join a conversation room
     * @param {string} conversationId 
     */
    joinRoom(conversationId) {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('join_room', { conversationId });
    }

    /**
     * Leave a conversation room
     * @param {string} conversationId 
     */
    leaveRoom(conversationId) {
        if (!this.socket?.connected) return;
        this.socket.emit('leave_room', { conversationId });
    }

    /**
     * Send a message
     * @param {string} conversationId 
     * @param {string} content 
     */
    sendMessage(conversationId, content) {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return false;
        }
        this.socket.emit('send_message', { conversationId, content });
        return true;
    }

    /**
     * Send typing indicator
     * @param {string} conversationId 
     * @param {boolean} isTyping 
     */
    sendTyping(conversationId, isTyping) {
        if (!this.socket?.connected) return;
        this.socket.emit('typing', { conversationId, isTyping });
    }

    /**
     * Mark messages as read
     * @param {string} conversationId 
     * @param {string[]} messageIds - Optional specific message IDs
     */
    markAsRead(conversationId, messageIds = null) {
        if (!this.socket?.connected) return;
        this.socket.emit('mark_read', { conversationId, messageIds });
    }

    /**
     * Register event listener
     * @param {string} event 
     * @param {Function} callback 
     */
    on(event, callback) {
        if (!this.socket) {
            console.error('Socket not initialized. Call connect() first.');
            return;
        }
        this.socket.on(event, callback);
        
        // Store listener reference for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event 
     * @param {Function} callback 
     */
    off(event, callback) {
        if (!this.socket) return;
        this.socket.off(event, callback);
        
        // Remove from stored listeners
        if (this.listeners.has(event)) {
            const listeners = this.listeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Remove all listeners for an event
     * @param {string} event 
     */
    removeAllListeners(event) {
        if (!this.socket) return;
        this.socket.removeAllListeners(event);
        this.listeners.delete(event);
    }

    /**
     * Internal: Notify stored listeners
     */
    _notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    // =============================================
    // REST API METHODS
    // =============================================

    /**
     * Initiate or get existing chat
     * @param {Object} params - { targetUserId, contextType, contextId, title }
     * @returns {Promise} Response with conversation
     */
    async initiateChat({ targetUserId, contextType = 'GENERAL', contextId = null, title = null }) {
        const response = await api.post('/chat/init', {
            targetUserId,
            contextType,
            contextId,
            title
        });
        return response.data;
    }

    /**
     * Get all conversations for current user
     * @param {string} status - 'ACTIVE', 'ARCHIVED', or 'ALL'
     * @returns {Promise} Response with conversations array
     */
    async getMyConversations(status = 'ACTIVE') {
        const response = await api.get(`/chat/my-conversations?status=${status}`);
        return response.data;
    }

    /**
     * Get single conversation details
     * @param {string} conversationId 
     * @returns {Promise} Response with conversation
     */
    async getConversation(conversationId) {
        const response = await api.get(`/chat/${conversationId}`);
        return response.data;
    }

    /**
     * Get conversation message history
     * @param {string} conversationId 
     * @param {Object} options - { limit, before }
     * @returns {Promise} Response with messages array
     */
    async getMessages(conversationId, { limit = 50, before = null } = {}) {
        let url = `/chat/${conversationId}/messages?limit=${limit}`;
        if (before) url += `&before=${before}`;
        const response = await api.get(url);
        return response.data;
    }

    /**
     * Archive a conversation
     * @param {string} conversationId 
     * @returns {Promise} Response
     */
    async archiveChat(conversationId) {
        const response = await api.put(`/chat/${conversationId}/archive`);
        return response.data;
    }

    // =============================================
    // BATCH CHATROOM METHODS
    // =============================================

    /**
     * Join or create a batch chatroom
     * @param {string} batch - Batch name (e.g., "Fall-2022")
     * @returns {Promise} Response with batch chatroom details
     */
    async joinBatchChatroom(batch) {
        const response = await api.post('/chat/batch/join', { batch });
        return response.data;
    }

    /**
     * Get user's batch chatrooms
     * @returns {Promise} Response with batch chatrooms array
     */
    async getMyBatchChatrooms() {
        const response = await api.get('/chat/batch/my-batches');
        return response.data;
    }

    /**
     * Get batch chatroom details
     * @param {string} batchId - Batch chatroom ID
     * @returns {Promise} Response with batch chatroom details
     */
    async getBatchChatroom(batchId) {
        const response = await api.get(`/chat/batch/${batchId}`);
        return response.data;
    }

    /**
     * Send message to batch chatroom
     * @param {string} batchId - Batch chatroom ID
     * @param {string} content - Message content
     * @returns {Promise} Response with sent message
     */
    async sendBatchMessage(batchId, content) {
        const response = await api.post(`/chat/batch/${batchId}/messages`, { content });
        return response.data;
    }

    /**
     * Get batch chatroom messages
     * @param {string} batchId - Batch chatroom ID
     * @param {Object} options - { limit, before }
     * @returns {Promise} Response with messages array
     */
    async getBatchMessages(batchId, { limit = 50, before = null } = {}) {
        let url = `/chat/batch/${batchId}/messages?limit=${limit}`;
        if (before) url += `&before=${before}`;
        const response = await api.get(url);
        return response.data;
    }

    /**
     * Toggle mute for batch chatroom
     * @param {string} batchId - Batch chatroom ID
     * @returns {Promise} Response with mute status
     */
    async toggleBatchMute(batchId) {
        const response = await api.put(`/chat/batch/${batchId}/mute`);
        return response.data;
    }

    /**
     * Leave batch chatroom
     * @param {string} batchId - Batch chatroom ID
     * @returns {Promise} Response
     */
    async leaveBatchChatroom(batchId) {
        const response = await api.delete(`/chat/batch/${batchId}/leave`);
        return response.data;
    }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService;
