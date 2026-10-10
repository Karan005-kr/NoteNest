const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { env } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const asyncHandler = require('./utils/asyncHandler');
const publicController = require('./controllers/public.controller');
const openapi = require('./docs/openapi');

const app = express();

const allowedOrigins = env.FRONTEND_ORIGIN.split(',').map((v) => v.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin is not allowed.'));
  },
  credentials: false,
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: 'draft-8', legacyHeaders: false }));

app.use('/uploads/materials', express.static(path.resolve(env.UPLOAD_ABSOLUTE_DIR), { fallthrough: false, dotfiles: 'deny' }));
app.get('/api/health', asyncHandler(publicController.health));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/public.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
