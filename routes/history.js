const express = require('express');
const router = express.Router();
const { addToHistory } = require('../handlers/historyHandlers');

router.post('/order', addToHistory);

module.exports = router;