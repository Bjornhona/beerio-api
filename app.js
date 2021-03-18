const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
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
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send({ express: 'Hello From Beerio API!' });
});

app.use(favicon(__dirname + '/public/favicon.ico'));
app.get('/favicon.ico', (req, res) => res.status(204));

app.use(cors({
  credentials: true,
  origin: [process.env.PUBLIC_DOMAIN],
  // origin: true,
  optionsSuccessStatus: 204,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: true,
  headers: {"Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin, Accept, Content-Type"}
}));

app.options('*', cors(
  origin: true,
  credentials: true,
  methods: ["GET","PUT","POST","DELETE"],
  maxAge: 3600
));

// app.use((req, res, next) => {
//   // res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_DOMAIN);
//   // res.setHeader('Access-Control-Allow-Credentials', 'true');
//   // res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
//   // res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, access-control-allow-origin');
  
//   console.log(res);
//   // res.setHeader("Access-Control-Allow-Origin", "*");
//   // res.header(
//   //   "Access-Control-Allow-Headers",
//   //   "Origin, X-Requested-With, Content-Type, Accept"
//   // );
//   next();
// });

app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  secret: 'some-string',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', auth);
app.use('/beers', beers);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({ code: 'not found' });
});

app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500).json({ code: 'unexpected' });
  }
});

module.exports = app;
