const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const apiRoutes = require('./routes/api.routes');

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

app.use('/api/v1', apiRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
