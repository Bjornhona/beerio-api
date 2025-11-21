const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const bodyParser = require('body-parser');
const auth = require('./routes/auth');
const beers = require('./routes/beers');

require('dotenv').config();

const app = express();

const connect = async () => {
  try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("connected to MongoDB");
  }
  catch (error) {
      console.error(error);
  }
}

connect();

app.use(favicon(__dirname + '/public/favicon.ico'));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  process.env.PUBLIC_DOMAIN
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(session({
  name: 'example.sid',
  secret: 'some-string',
  httpOnly: true,
  secure: true,
  maxAge: 1000 * 60 * 60 * 7,
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    httpOnly: true,
    secure: true, 
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none',
  },
}));

app.enable('trust proxy');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  return res.send({ express: 'Hello From Beerio API!' });
});

app.post('/', async (req, res, next) => {
  const {name} = req.body;
  req.session.user = {
      name,
      isLoggedIn: true
  }

  try {
      await req.session.save();
  } catch (err) {
      console.error('Error saving to session storage: ', err);
      return next(new Error('Error creating user'));
  }

  res.status(200).send();
});

app.use('/auth', auth);
app.use('/beers', beers);

app.use((req, res, next) => {
  return res.status(404).json({ code: 'not found' });
});

app.use((err, req, res, next) => {
  console.error('ERROR', req.method, req.path, err);

  if (!res.headersSent) {
    return res.status(500).json({ code: 'unexpected' });
  }
});

module.exports = app;
