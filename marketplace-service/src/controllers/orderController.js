// src/controllers/orderController.js
// Controller for Customer Order Management
const db = require('../config/db');

/**
 * Place a new order
 * POST /orders
 * 
 * Body: {
 *   vendor_id,
 *   items: [{ product_id, product_name, quantity, price, options? }],
 *   customer_name,
 *   customer_phone,
 *   customer_address,
 *   payment_method: 'CASH' | 'BKASH' | 'NAGAD' | 'CARD',
 *   subtotal,
 *   delivery_fee,
 *   total,
 *   notes?
 * }
 */
async function placeOrder(req, res) {
    const client = await db.pool.connect();
    
    try {
        const customerId = req.user?.id;
        
        if (!customerId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const {
            vendor_id,
            items,
            customer_name,
            customer_phone,
            customer_address,
            payment_method = 'CASH',
            subtotal,
            delivery_fee = 0,
            total,
            notes
        } = req.body;

        // Validate required fields
        if (!vendor_id || !items || !items.length || !customer_name || !subtotal || !total) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: vendor_id, items, customer_name, subtotal, total'
            });
        }

        // Verify vendor exists
        const vendorCheck = await client.query(
            'SELECT id, name FROM vendors WHERE id = $1',
            [vendor_id]
        );

        if (vendorCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        await client.query('BEGIN');

        // Create the order
        const orderQuery = `
            INSERT INTO orders (
                vendor_id, customer_id, customer_name, customer_phone,
                customer_address, status, payment_status, payment_method,
                subtotal, delivery_fee, total, notes
            )
            VALUES ($1, $2, $3, $4, $5, 'PENDING', 'PENDING', $6, $7, $8, $9, $10)
            RETURNING *
        `;
        
        const orderResult = await client.query(orderQuery, [
            vendor_id,
            customerId,
            customer_name,
            customer_phone || null,
            customer_address || null,
            payment_method,
            subtotal,
            delivery_fee,
            total,
            notes || null
        ]);

        const order = orderResult.rows[0];

        // Insert order items and update stock
        const orderItems = [];
        for (const item of items) {
            const itemQuery = `
                INSERT INTO order_items (order_id, product_id, product_name, quantity, price, options)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const itemResult = await client.query(itemQuery, [
                order.id,
                item.product_id,
                item.product_name,
                item.quantity,
                item.price,
                item.options || null
            ]);
            orderItems.push(itemResult.rows[0]);

            // Decrement stock count and increment sold count for the product
            if (item.product_id) {
                await client.query(`
                    UPDATE products 
                    SET stock_count = GREATEST(stock_count - $1, 0),
                        sold_count = COALESCE(sold_count, 0) + $1
                    WHERE id = $2
                `, [item.quantity, item.product_id]);
            }
        }

        // Update vendor_stats for analytics
        await client.query(`
            INSERT INTO vendor_stats (vendor_id, date, revenue, orders_count, visitors)
            VALUES ($1, CURRENT_DATE, $2, 1, 0)
            ON CONFLICT (vendor_id, date) 
            DO UPDATE SET 
                revenue = vendor_stats.revenue + EXCLUDED.revenue,
                orders_count = vendor_stats.orders_count + 1
        `, [vendor_id, total]);

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: {
                ...order,
                items: orderItems,
                vendor_name: vendorCheck.rows[0].name
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in placeOrder:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to place order'
        });
    } finally {
        client.release();
    }
}

/**
 * Get customer's orders
 * GET /orders/my-orders
 * Query: ?status=PENDING,PREPARING,READY,COMPLETED,CANCELLED
 */
async function getMyOrders(req, res) {
    try {
        const customerId = req.user?.id;
        const { status } = req.query;

        if (!customerId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        let ordersQuery = `
            SELECT 
                o.id, o.vendor_id, o.customer_id, o.customer_name,
                o.customer_phone, o.customer_address,
                o.status, o.payment_status, o.payment_method,
                o.subtotal, o.delivery_fee, o.total, o.notes,
                o.created_at, o.updated_at,
                v.name as vendor_name, v.logo_url as vendor_logo,
                v.type as vendor_type,
                EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 60 as minutes_ago
            FROM orders o
            LEFT JOIN vendors v ON o.vendor_id = v.id
            WHERE o.customer_id = $1
        `;

        const params = [customerId];

        if (status) {
            const statuses = status.split(',').map(s => s.trim().toUpperCase());
            ordersQuery += ` AND o.status = ANY($2)`;
            params.push(statuses);
        }

        ordersQuery += ` ORDER BY o.created_at DESC`;

        const ordersResult = await db.query(ordersQuery, params);

        // Get items for each order
        const orders = await Promise.all(ordersResult.rows.map(async (order) => {
            const itemsQuery = `
                SELECT id, product_id, product_name, quantity, price, options
                FROM order_items
                WHERE order_id = $1
            `;
            const itemsResult = await db.query(itemsQuery, [order.id]);

            // Format time elapsed
            const minutesAgo = Math.floor(order.minutes_ago);
            let timeElapsed;
            if (minutesAgo < 1) timeElapsed = 'Just now';
            else if (minutesAgo < 60) timeElapsed = `${minutesAgo}m ago`;
            else if (minutesAgo < 1440) timeElapsed = `${Math.floor(minutesAgo / 60)}h ago`;
            else timeElapsed = `${Math.floor(minutesAgo / 1440)}d ago`;

            return {
                ...order,
                items: itemsResult.rows,
                time_elapsed: timeElapsed
            };
        }));

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error('Error in getMyOrders:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch orders'
        });
    }
}

/**
 * Get single order details
 * GET /orders/:orderId
 */
async function getOrderById(req, res) {
    try {
        const customerId = req.user?.id;
        const { orderId } = req.params;

        if (!customerId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const orderQuery = `
            SELECT 
                o.id, o.vendor_id, o.customer_id, o.customer_name,
                o.customer_phone, o.customer_address,
                o.status, o.payment_status, o.payment_method,
                o.subtotal, o.delivery_fee, o.total, o.notes,
                o.created_at, o.updated_at,
                v.name as vendor_name, v.logo_url as vendor_logo,
                v.type as vendor_type, v.contact_phone as vendor_phone
            FROM orders o
            LEFT JOIN vendors v ON o.vendor_id = v.id
            WHERE o.id = $1 AND o.customer_id = $2
        `;

        const orderResult = await db.query(orderQuery, [orderId, customerId]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsQuery = `
            SELECT id, product_id, product_name, quantity, price, options
            FROM order_items
            WHERE order_id = $1
        `;
        const itemsResult = await db.query(itemsQuery, [orderId]);

        return res.status(200).json({
            success: true,
            order: {
                ...order,
                items: itemsResult.rows
            }
        });

    } catch (error) {
        console.error('Error in getOrderById:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch order'
        });
    }
}

/**
 * Cancel an order (only if PENDING)
 * PUT /orders/:orderId/cancel
 */
async function cancelOrder(req, res) {
    try {
        const customerId = req.user?.id;
        const { orderId } = req.params;

        if (!customerId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Check order exists and belongs to customer
        const checkQuery = `
            SELECT id, status FROM orders 
            WHERE id = $1 AND customer_id = $2
        `;
        const checkResult = await db.query(checkQuery, [orderId, customerId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (checkResult.rows[0].status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: 'Only pending orders can be cancelled'
            });
        }

        // Cancel the order
        const updateQuery = `
            UPDATE orders 
            SET status = 'CANCELLED', updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        const updateResult = await db.query(updateQuery, [orderId]);

        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order: updateResult.rows[0]
        });

    } catch (error) {
        console.error('Error in cancelOrder:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to cancel order'
        });
    }
}

module.exports = {
    placeOrder,
    getMyOrders,
    getOrderById,
    cancelOrder
};
