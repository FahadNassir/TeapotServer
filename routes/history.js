const express = require('express');
const router = express.Router();
const { addToHistory, getHistory } = require('../handlers/historyHandlers');

// GET /history - Get all order history
router.get('/', getHistory);

// POST /history/order - Add order to history
router.post('/order', addToHistory);

module.exports = router;