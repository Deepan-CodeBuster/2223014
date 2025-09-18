require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const logger = require('./logger');
const shortenerRoutes = require('./routes/shortener');

const cors = require('cors');



const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/urlshortener';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
app.use(cors({ origin: 'https://2223014-frontend.vercel.app' }));

// pino-http middleware attaches req.log and logs requests + responses
app.use(pinoHttp({ logger }));

app.use(helmet());
app.use(bodyParser.json());

// Attach base url to req for use in handlers
app.use((req, res, next) => {
  req.baseUrlForShort = process.env.BASE_URL || BASE_URL;
  next();
});

// Routes
app.use('/', shortenerRoutes);

// 404 handler
app.use((req, res) => {
  req.log.warn({ url: req.originalUrl }, 'Route not found');
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  // don't use console.log — use pino
  req.log.error({ err }, 'Unhandled error');
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

// connect and start
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info({ mongo: MONGO_URI }, 'Connected to MongoDB');
    app.listen(PORT, () => logger.info({ port: PORT }, `URL shortener service started at ${PORT}`));
  })
  .catch(err => {
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  });
