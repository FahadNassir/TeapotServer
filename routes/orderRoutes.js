const express = require('express');
const router = express.Router();
const { createOrder, getOrders, deleteOrder } = require('../handlers/orderHandlers');

// POST /order - Save a new order
router.post('/order', createOrder);

// GET /orders - Retrieve all orders
router.get('/orders', getOrders);

// DELETE /order/:phone - Delete orders by phone number
router.delete('/order/:phone', deleteOrder);

module.exports = router;
