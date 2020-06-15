const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

process.on('uncaughtException', err => {
  console.log(err);
  process.exit(1);
});

dotenv.config({
  path: './config.env'
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

const io = require('socket.io').listen(server);

const sockets = {};
let onlineUsers = [];

io.sockets.on('connection', socket => {
  socket.on('logged', data => {
    if (!sockets[data._id]) {
      sockets[data._id] = socket.id;
      onlineUsers.push(data);
    }

    io.emit('logged', onlineUsers);
  });
  socket.on('request', data => {
    io.to(sockets[data.to]).emit('request', {
      from: onlineUsers.find(user => user.id === data.from)
    });
  });
  socket.on('call', data => {
    io.to(sockets[data.to]).emit('call', {
      ...data,
      from: onlineUsers.find(user => user.id === data.from)
    });
  });
  socket.on('end', data => {
    io.to(sockets[data.to]).emit('end');
  });
  socket.on('disconnect', function() {
    // eslint-disable-next-line no-restricted-syntax
    for (const i in sockets) {
      if (sockets[i] === socket.id) {
        delete sockets[i];
      }
    }
    const updatedUsers = onlineUsers.filter(item => sockets[item._id]);
    io.emit('logged', updatedUsers);
    onlineUsers = updatedUsers;
  });
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

app.use(cors());
app.use(
  '/uploads/images',
  express.static(path.normalize(path.join('uploads', 'images')))
);

const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const messageRouter = require('./routes/messageRoutes');
const commentRouter = require('./routes/commentRouter');

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

app.use(function(req, res, next) {
  req.io = io;
  req.socketsObj = sockets;
  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/comments', commentRouter);

app.all('*', (req, res, next) => {
  next(new AppError('cant find route', 404));
});

app.use(globalErrorHandler);

// module.exports = sockets;
