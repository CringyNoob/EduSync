import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [orders, setOrders] = useState([]);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...product, quantity: 1, section: product.section || 'General' }];
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

    const placeOrder = (sectionName, items, total, deliveryInfo) => {
        const newOrders = items.map(item => ({
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            item: item.title,
            status: 'New',
            price: (parseFloat(item.price) * item.quantity).toFixed(2),
            date: 'Just Now',
            shop: item.seller,
            section: sectionName,
            image: item.image,
            deliveryInfo: deliveryInfo
        }));
        setOrders(prev => [...newOrders, ...prev]);
        clearSectionItems(sectionName);
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

    return (
        <CartContext.Provider value={{
            cartItems,
            orders,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            clearSectionItems,
            placeOrder,
            updateOrderStatus,
            getCartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
