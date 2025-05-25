require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const orderRoutes = require('./routes/orderRoutes');
const history = require('./routes/history');

app.use('/', orderRoutes);
app.use('/history', history);

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

// For Vercel deployment
module.exports = serverless(app); 