const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

const app = require('./app');

const server = require('http').createServer(app);

const io = require('socket.io')(server);

// io.on('connection', socket => {
//   console.log('socket');
//   socket.on('Output Chat Message', () => {
//     console.log('connection established');
//   });
// });

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

exports.io = io;
