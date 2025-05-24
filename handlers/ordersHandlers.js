const fs = require('fs').promises;
const path = require('path');

const ordersFilePath = path.join(__dirname, '..', 'data', 'orders.json');

// Read orders file with proper error handling
async function readOrders() {
    try {
        const data = await fs.readFile(ordersFilePath, 'utf8');
        return JSON.parse(data) || [];
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Write orders file with proper error handling
async function writeOrders(orders) {
    try {
        await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
    } catch (error) {
        throw error;
    }
}

// Remove an item from an order
async function removeItemFromOrder(req, res) {
    try {
        const { phone } = req.body;
        if (!phone) {
            console.error('No phone number provided in request body');
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Normalize phone number (remove spaces and make consistent)
        const normalizedPhone = phone.replace(/\s/g, '');
        console.log('Looking for orders with phone:', normalizedPhone);

        // Read existing orders
        const orders = await readOrders();
        console.log('Found orders:', orders.length);

        // Find all orders with the given phone number
        const ordersToRemove = orders.filter(order => {
            const orderPhone = order.deliveryInfo?.phone?.replace(/\s/g, '');
            return orderPhone === normalizedPhone;
        });

        if (ordersToRemove.length === 0) {
            console.log('No orders found for phone:', normalizedPhone);
            return res.status(404).json({ 
                error: 'No orders found for this phone number',
                phone: normalizedPhone
            });
        }

        console.log('Found orders to remove:', ordersToRemove.length);
        
        // Remove all orders with the matching phone number
        const updatedOrders = orders.filter(order => {
            const orderPhone = order.deliveryInfo?.phone?.replace(/\s/g, '');
            return orderPhone !== normalizedPhone;
        });

        // Write updated orders
        await writeOrders(updatedOrders);
        console.log('Successfully removed orders');

        res.status(200).json({ 
            message: 'Orders removed successfully',
            count: ordersToRemove.length,
            phone: normalizedPhone
        });
    } catch (error) {
        console.error('Error removing orders:', error);
        res.status(500).json({ 
            error: 'Failed to remove orders',
            details: error.message
        });
    }
}

module.exports = {
    removeItemFromOrder
};
