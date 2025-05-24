require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const orderRoutes = require('./routes/orderRoutes');
const history = require('./routes/history');

// Mount routes
app.use('/', orderRoutes);
app.use('/history', history);

// Export as serverless function
module.exports.handler = serverless(app);

