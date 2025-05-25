require('dotenv').config();
const express = require('express');
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
const orderRoutes = require('./routes/orderRoutes');
const historyRoutes = require('./routes/history');

//Use routes
app.use('/', orderRoutes);
app.use('/history', historyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
