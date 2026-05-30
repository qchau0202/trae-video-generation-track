const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TRAE x PixVerse API' });
});

// Import routes here
// app.use('/api/v1', require('./routes'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
