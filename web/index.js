'use strict';

import bodyParser   from 'body-parser'
import cookieParser from 'cookie-parser'
import express      from 'express'
import http         from 'http'
import morgan       from 'morgan'
import passport     from 'passport'
import pg           from 'pg'
import pgSession    from 'connect-pg-simple'
import router       from './router'
import session      from 'express-session'
import socket       from './socket'
import tumblr       from 'tumblr.js'
import { Strategy } from 'passport-tumblr'


let app    = express()
let server = http.Server(app)
let sessionStore = new (pgSession(session))({ pg })

app.use(morgan('combined'));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.set('port', (process.env.PORT || 5000));
app.use('/public', express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: true,
  store: sessionStore,
  cookie: { maxAge: 90 * 24 * 60 * 60 * 1000 } // 90 days
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser( (user, done) => {
  done(null, user);
});

passport.deserializeUser( (user, done) => {
  done(null, user);
});

passport.use(new Strategy({
      consumerKey: process.env.TUMBLR_CONSUMER_KEY,
      consumerSecret: process.env.TUMBLR_SECRET_KEY,
      callbackURL: process.env.TUMBLR_CALLBACK_URL
  }, (token, tokenSecret, profile, done) => {
      let user = {
          token,
          tokenSecret,
          profile
      };

      done(null, user);
  }
));

app.use('/', router.setup(passport))

server.listen(app.get('port'), () => {
  socket.listen(server, sessionStore)
  console.log('[express] running on port', app.get('port'));
});
