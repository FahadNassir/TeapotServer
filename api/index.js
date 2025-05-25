// api/index.js

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

//Middleware
app.use(express.json());
app.use(cors());

//Test route to confirm deployment is working
app.get('/ping', (req, res) => {
  console.log('Ping received');
  res.send('pong from Vercel');
});

// Import routes from root-level "routes" folder
const orderRoutes = require('../routes/orderRoutes');
const historyRoutes = require('../routes/history');

//Use routes
app.use('/', orderRoutes);
app.use('/history', historyRoutes);

//Export as serverless function
module.exports = serverless(app);
