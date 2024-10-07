const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const shopifyRoutes = require('./shopifyController');

const app = express();
const port = 8085;

// Middleware setup
app.use(cors({
    origin: '*',
    methods: ['OPTIONS', 'GET', 'PUT', 'DELETE', 'POST'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the API. Use /api for accessing routes.');
});

// API routes
app.use('/api', shopifyRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
