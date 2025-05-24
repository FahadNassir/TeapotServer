const fs = require('fs');
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
const createOrder = (req, res) => {
  const newOrder = req.body;

  // Validate order data
  const validation = validateOrder(newOrder);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  fs.readFile(ordersFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading orders file.' });
    }

    let orders = [];
    try {
      orders = JSON.parse(data);
    } catch (parseError) {
      return res.status(500).json({ message: 'Error parsing orders file.' });
    }

    // Add timestamp
    newOrder.timestamp = new Date().toLocaleString();
    orders.push(newOrder);

    fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving order.' });
      }
      res.status(201).json({ 
        message: 'Order saved successfully.',
        phone: newOrder.deliveryInfo.phone
      });
    });
  });
};

// GET /orders handler
const getOrders = (req, res) => {
  fs.readFile(ordersFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading orders file.' });
    }

    try {
      const orders = JSON.parse(data);
      // Sort orders by timestamp in descending order (newest first)
      orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      res.status(200).json(orders);
    } catch (parseError) {
      res.status(500).json({ message: 'Error parsing orders file.' });
    }
  });
};

// DELETE /order/:phone handler
const deleteOrder = async (req, res) => {
  const phone = req.params.phone;
  
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  try {
    const data = await fs.promises.readFile(ordersFilePath, 'utf8');
    let orders = JSON.parse(data);
    const ordersToDelete = orders.filter(order => order.deliveryInfo.phone === phone);
    
    if (ordersToDelete.length === 0) {
      return res.status(404).json({ message: 'No orders found for this phone number.' });
    }

    // Save orders to history before deletion
    for (const order of ordersToDelete) {
      await addToHistory({ body: order }, { status: () => ({ json: () => {} }) });
    }

    // Remove the orders from the active orders list
    orders = orders.filter(order => order.deliveryInfo.phone !== phone);

    await fs.promises.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
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
