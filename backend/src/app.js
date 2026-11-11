const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const routes = require('./routes');
const notFoundGuardian = require('./middlewares/notFoundGuardian.middleware');
const errorGuardian = require('./middlewares/errorGuardian.middleware');
const { requestLogger } = require('./middlewares/requestLogger.middleware');

const app = express();

// Custom request logger mounted at the very top of the pipeline
// Captures execution duration across all route handling and static file hits
app.use(requestLogger);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcElem: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        upgradeInsecureRequests: null,
      },
    },
  })
);

// Cross-origin resource sharing
app.use(cors());

// HTTP request logging
if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (CSS, images, icons)
app.use(express.static(path.resolve(__dirname, '../public')));
app.use('/css', express.static(path.resolve(__dirname, '../public/css')));

// Mount application routes
app.use(routes);

// Catch 404 with Guardian middleware (after all routes, before errorGuardian)
app.use(notFoundGuardian);

// Task 5: 5xx Guardian Middleware (Global Error Handler) - absolute LAST middleware
app.use(errorGuardian);

module.exports = app;
