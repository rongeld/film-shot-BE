const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const server = require('./server');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(cors());
app.use(
  '/uploads/images',
  express.static(path.normalize(path.join('uploads', 'images')))
);

const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const messageRouter = require('./routes/messageRoutes');

// Development Login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// set Security http headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 1 hour'
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

// data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies

// Assign socket object to every request
// app.use(function(req, res, next) {
//   req.io = io;
//   next();
// });

app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/messages', messageRouter);

app.all('*', (req, res, next) => {
  next(new AppError('cant find route', 404));
});

app.use(globalErrorHandler);

module.exports = app;
