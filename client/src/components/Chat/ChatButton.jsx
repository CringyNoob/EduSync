import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

/**
 * ChatButton - Reusable component to initiate chat
 * 
 * Props:
 * - targetUserId: UUID of the user to chat with
 * - targetName: Display name of the target user
 * - contextType: 'PRODUCT' | 'PREOWNED' | 'RENTAL' | 'ORDER' | 'GENERAL'
 * - contextId: UUID of the related entity (product, listing, etc.)
 * - title: Chat title (optional, defaults to "Chat with {targetName}")
 * - className: Additional CSS classes
 * - variant: 'primary' | 'outline' | 'ghost'
 * - size: 'sm' | 'md' | 'lg'
 * - children: Custom button content
 */
const ChatButton = ({
    targetUserId,
    targetName,
    contextType = 'GENERAL',
    contextId = null,
    title = null,
    className = '',
    variant = 'primary',
    size = 'md',
    children,
    disabled = false,
    showIcon = true,
    fullWidth = false
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Don't show chat button if targeting self
    if (targetUserId === user?.id) {
        return null;
    }

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if logged in
        if (!user?.id) {
            navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }

        setLoading(true);

        try {
            // Connect to socket if not connected
            const token = localStorage.getItem('edusync_token');
            if (token && !chatService.isConnected()) {
                chatService.connect(token);
            }

            // Initiate chat
            const response = await chatService.initiateChat({
                targetUserId,
                contextType,
                contextId,
                title: title || `Chat with ${targetName || 'User'}`
            });

            if (response.success && response.conversation) {
                // Navigate to chat room
                navigate(`/chat/${response.conversation.id}`);
            } else {
                throw new Error('Failed to initiate chat');
            }
        } catch (err) {
            console.error('Error initiating chat:', err);
            // Fallback: navigate with query params
            const params = new URLSearchParams({
                targetUserId,
                contextType,
                ...(contextId && { contextId }),
                ...(targetName && { name: targetName })
            });
            navigate(`/chat?${params.toString()}`);
        } finally {
            setLoading(false);
        }
    };

    // Size classes
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5',
        lg: 'px-6 py-3 text-lg'
    };

    // Variant classes
    const variantClasses = {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg',
        outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
        ghost: 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center gap-2 
                font-medium rounded-xl transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
        >
            {loading ? (
                <Loader2 size={size === 'sm' ? 16 : 20} className="animate-spin" />
            ) : (
                showIcon && <MessageCircle size={size === 'sm' ? 16 : 20} />
            )}
            {children || (loading ? 'Opening...' : 'Chat')}
        </button>
    );
};

/**
 * ChatWithVendorButton - Specialized for vendor chats
 */
export const ChatWithVendorButton = ({ vendorId, vendorName, productId, ...props }) => (
    <ChatButton
        targetUserId={vendorId}
        targetName={vendorName}
        contextType="PRODUCT"
        contextId={productId}
        title={`Chat with ${vendorName}`}
        {...props}
    >
        {props.children || 'Chat with Vendor'}
    </ChatButton>
);

/**
 * ChatWithSellerButton - Specialized for preowned sellers
 */
export const ChatWithSellerButton = ({ sellerId, sellerName, listingId, ...props }) => (
    <ChatButton
        targetUserId={sellerId}
        targetName={sellerName}
        contextType="PREOWNED"
        contextId={listingId}
        title={`Chat about listing`}
        {...props}
    >
        {props.children || 'Chat with Seller'}
    </ChatButton>
);

/**
 * ChatWithOwnerButton - Specialized for rental owners
 */
export const ChatWithOwnerButton = ({ ownerId, ownerName, rentalId, ...props }) => (
    <ChatButton
        targetUserId={ownerId}
        targetName={ownerName}
        contextType="RENTAL"
        contextId={rentalId}
        title={`Chat about rental`}
        {...props}
    >
        {props.children || 'Chat with Owner'}
    </ChatButton>
);

/**
 * OrderChatButton - Specialized for order-related chats (for customers)
 */
export const OrderChatButton = ({ vendorId, vendorName, orderId, ...props }) => (
    <ChatButton
        targetUserId={vendorId}
        targetName={vendorName}
        contextType="ORDER"
        contextId={orderId}
        title={`Order #${orderId?.slice(0, 8)}`}
        {...props}
    >
        {props.children || 'Message Vendor'}
    </ChatButton>
);

/**
 * VendorOrderChatButton - For vendors to chat with customers about orders
 */
export const VendorOrderChatButton = ({ customerId, customerName, orderId, ...props }) => (
    <ChatButton
        targetUserId={customerId}
        targetName={customerName}
        contextType="ORDER"
        contextId={orderId}
        title={`Order #${orderId?.slice(0, 8)}`}
        {...props}
    >
        {props.children || 'Message Customer'}
    </ChatButton>
);

export default ChatButton;
