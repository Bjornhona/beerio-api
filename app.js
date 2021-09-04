const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');

require('dotenv').config();

const auth = require('./routes/auth');
const beers = require('./routes/beers');

mongoose.connect(process.env.MONGODB_URI, {
  keepAlive: true,
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE,
  useUnifiedTopology: true
}).then(() => {
  console.log(`Connected to database`);
}).catch((error) => {
  console.error(error);
})

const app = express();

app.get('/', (req, res) => {
  return res.send({ express: 'Hello From Beerio API!' });
});

app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(cors({
  credentials: true,
  origin: [process.env.PUBLIC_DOMAIN]
}));

app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  secret: 'some-string',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none'
  }
  // cookie: { 
  //   httpOnly: true, 
  //   secure: true, 
  //   maxAge: 1000 * 60 * 60 * 48, 
  //   sameSite: 'none' 
  // }
}));

// app.enable('trust proxy');

app.use(logger('dev'));
app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', auth);
app.use('/beers', beers);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  return res.status(404).json({ code: 'not found' });
});

app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    return res.status(500).json({ code: 'unexpected' });
  }
});

module.exports = app;
