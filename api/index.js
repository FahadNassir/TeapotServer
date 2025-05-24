require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const orderRoutes = require('../routes/orderRoutes');
const history = require('../routes/history');

app.use('/', orderRoutes);
app.use('/history', history);

module.exports = serverless(app);
