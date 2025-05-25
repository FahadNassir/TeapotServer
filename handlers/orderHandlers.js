const fs = require('fs').promises;
const path = require('path');
const { addToHistory } = require('./historyHandlers');

const ordersFilePath = path.join(__dirname, '..', 'data', 'orders.json');

// Helper function to validate order data
const validateOrder = (order) => {
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    return { valid: false, message: 'Order must contain at least one item' };
  }
  if (!order.deliveryInfo || !order.deliveryInfo.address || !order.deliveryInfo.phone) {
    return { valid: false, message: 'Order must include delivery information' };
  }
  return { valid: true };
};

// POST /order handler
const createOrder = async (req, res) => {
  const newOrder = req.body;

  // Validate order data
  const validation = validateOrder(newOrder);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const data = await fs.readFile(ordersFilePath, 'utf8');
    let orders = JSON.parse(data);

    // Add timestamp
    newOrder.timestamp = new Date().toLocaleString();
    orders.push(newOrder);

    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
    res.status(201).json({ 
      message: 'Order saved successfully.',
      phone: newOrder.deliveryInfo.phone
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error saving order.' });
  }
};

// GET /orders handler
const getOrders = async (req, res) => {
  try {
    const data = await fs.readFile(ordersFilePath, 'utf8');
    const orders = JSON.parse(data);
    // Sort orders by timestamp in descending order (newest first)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ message: 'Error reading orders.' });
  }
};

// DELETE /order/:phone handler
const deleteOrder = async (req, res) => {
  const phone = req.params.phone;
  
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  try {
    const data = await fs.readFile(ordersFilePath, 'utf8');
    let orders = JSON.parse(data);
    const ordersToDelete = orders.filter(order => order.deliveryInfo.phone === phone);
    
    if (ordersToDelete.length === 0) {
      return res.status(404).json({ message: 'No orders found for this phone number.' });
    }

    // Save orders to history before deletion
    for (const order of ordersToDelete) {
      try {
        await addToHistory(order);
      } catch (historyError) {
        console.error('Error saving order to history:', historyError);
        // Continue with other orders even if one fails
      }
    }

    // Remove the orders from the active orders list
    orders = orders.filter(order => order.deliveryInfo.phone !== phone);

    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
    res.status(200).json({ 
      message: 'Orders moved to history successfully.',
      count: ordersToDelete.length
    });
  } catch (error) {
    console.error('Error processing order deletion:', error);
    res.status(500).json({ message: 'Error processing order deletion.' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  deleteOrder
};
