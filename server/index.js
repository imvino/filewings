const path = require('path');
require('dotenv').config({
  silent: true,
  path: path.join(__dirname, '.env'),
});
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/file');
const { errorHandler, notFound } = require('./middleware/error');

const app = express();

// Middlewares
app.use(cors());
app.use(helmet()); // secure HTTP headers
app.use(morgan('dev')); // logger
app.use(compression()); // zip
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database Connected...'))
  .catch((err) => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/file', fileRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Error Handlers
app.use(notFound);
app.use(errorHandler);

let port = 3001;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
