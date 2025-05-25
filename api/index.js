// require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const orderRoutes = require('../routes/orderRoutes');
const history = require('../routes/history');

app.use('/', orderRoutes);
app.use('/history', history);

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
module.exports = serverless(app);
