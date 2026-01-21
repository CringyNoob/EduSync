import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import marketplaceService from '../services/marketplaceService';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Load cart from localStorage on init
        const saved = localStorage.getItem('edusync_cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('edusync_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Fetch orders from backend
    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true);
        try {
            const response = await marketplaceService.getMyCustomerOrders();
            setOrders(response.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Don't clear orders on error, keep existing
        } finally {
            setLoadingOrders(false);
        }
    }, []);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) } 
                        : item
                );
            }
            return [...prevItems, { 
                ...product, 
                quantity: product.quantity || 1, 
                section: product.section || 'General' 
            }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const clearSectionItems = (sectionName) => {
        setCartItems(prev => prev.filter(item => (item.section || 'General') !== sectionName));
    };

    /**
     * Place order with backend
     * @param {string} sectionName - Section name (Foods, Shops, etc.)
     * @param {Array} items - Items to order
     * @param {number} total - Total amount
     * @param {Object} deliveryInfo - Delivery information
     * @returns {Promise<Object>} - Order result
     */
    const placeOrder = async (sectionName, items, total, deliveryInfo) => {
        // Group items by vendor
        const itemsByVendor = items.reduce((acc, item) => {
            const vendorId = item.vendorId || item.vendor_id;
            if (!vendorId) {
                console.warn('Item missing vendor ID:', item);
                return acc;
            }
            if (!acc[vendorId]) {
                acc[vendorId] = {
                    vendorId,
                    vendorName: item.vendorName || item.seller,
                    items: []
                };
            }
            acc[vendorId].items.push(item);
            return acc;
        }, {});

        const results = [];
        const errors = [];

        // Create an order for each vendor
        for (const vendorGroup of Object.values(itemsByVendor)) {
            const vendorItems = vendorGroup.items;
            const subtotal = vendorItems.reduce((sum, item) => 
                sum + parseFloat(item.price) * item.quantity, 0
            );
            const deliveryFee = 50; // Fixed delivery fee per vendor

            const orderData = {
                vendor_id: vendorGroup.vendorId,
                items: vendorItems.map(item => ({
                    product_id: item.id,
                    product_name: item.title || item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    options: item.options || null
                })),
                customer_name: deliveryInfo.name || deliveryInfo.location || 'Customer',
                customer_phone: deliveryInfo.phone || null,
                customer_address: deliveryInfo.location || deliveryInfo.address || null,
                payment_method: deliveryInfo.paymentMethod || 'CASH',
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                total: subtotal + deliveryFee,
                notes: deliveryInfo.specialNotes || null
            };

            try {
                const response = await marketplaceService.placeOrder(orderData);
                if (response.success) {
                    results.push(response.order);
                } else {
                    errors.push({ vendor: vendorGroup.vendorName, error: response.error });
                }
            } catch (error) {
                console.error('Error placing order for vendor:', vendorGroup.vendorName, error);
                errors.push({ vendor: vendorGroup.vendorName, error: error.message });
            }
        }

        // Clear items from cart after successful order placement
        if (results.length > 0) {
            clearSectionItems(sectionName);
            // Refresh orders
            fetchOrders();
        }

        return {
            success: results.length > 0,
            orders: results,
            errors: errors.length > 0 ? errors : null
        };
    };

    /**
     * Cancel an order
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} - Cancel result
     */
    const cancelOrder = async (orderId) => {
        try {
            const response = await marketplaceService.cancelOrder(orderId);
            if (response.success) {
                // Update local orders state
                setOrders(prev => prev.map(order =>
                    order.id === orderId ? { ...order, status: 'CANCELLED' } : order
                ));
            }
            return response;
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);
    };

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    // Get cart items for a specific vendor
    const getVendorCartItems = (vendorId) => {
        return cartItems.filter(item => item.vendorId === vendorId || item.vendor_id === vendorId);
    };

    // Get cart total for a specific vendor
    const getVendorCartTotal = (vendorId) => {
        const vendorItems = getVendorCartItems(vendorId);
        return vendorItems.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            orders,
            loadingOrders,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            clearSectionItems,
            placeOrder,
            cancelOrder,
            updateOrderStatus,
            getCartTotal,
            cartCount,
            fetchOrders,
            getVendorCartItems,
            getVendorCartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
