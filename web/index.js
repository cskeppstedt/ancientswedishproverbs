/** @jsx hJSX */
'use strict';

import 'babel/polyfill';

import * as db      from '../shared/db'
import Promise      from 'bluebird'
import bodyParser   from 'body-parser'
import cookieParser from 'cookie-parser'
import express      from 'express'
import morgan       from 'morgan'
import passport     from 'passport'
import pg           from 'pg'
import pgSession    from 'connect-pg-simple'
import session      from 'express-session'
import tumblr       from 'tumblr.js'
import { Strategy } from 'passport-tumblr'
import SocketIO     from 'socket.io'
import http         from 'http'
import passportSocketIo from 'passport.socketio'

import Cycle from '@cycle/core'
import CycleDOM from '@cycle/dom'
import appFn from './app'
import serialize from 'serialize-javascript'

let {h, hJSX, makeHTMLDriver} = CycleDOM
let {Rx} = Cycle

function wrapVTreeWithHTMLBoilerplate(vtree, context) {
  return (
    <html>
      <head>
        <title>cycle.js isomorphism test</title>
      </head>
      <body>
        <div className="app-container">{ vtree }</div>
        <script>
          { `window.appContext = ${serialize(context)}` }
        </script>
        <script src="http://localhost:8080/webpack-dev-server.js"></script>
        <script src="http://localhost:8080/assets/vendor.js"></script>
        <script src="http://localhost:8080/assets/app.js"></script>
      </body>
    </html>
  )
}

function wrapAppResultWithBoilerplate(appFn, context$) {
  return function wrappedAppFn(ext) {
    let vtree$ = appFn(ext).DOM;
    let wrappedVTree$ = Rx.Observable.combineLatest(vtree$, context$,
      wrapVTreeWithHTMLBoilerplate
    );
    return {
      DOM: wrappedVTree$
    };
  };
}

function prependDoctype(html) {
  return `<!doctype html>${html}`;
}


/* SETUP */
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


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      console.log('**** user is logged in')
      return next();
  }

  console.log('**** user is not logged in', req.user)
  res.redirect('/login')
}

/* ROUTES */
app.get('/', ensureAuthenticated, (request, response) => {
  db.list().then(posts => {
    let context$ = Rx.Observable.just({
      posts: posts.map(post => {
        if (!post.post_url) {
          post.publish_url = '/post/' + encodeURIComponent(post.original);
        }

        return post;
      })
    })

    let wrappedAppFn = wrapAppResultWithBoilerplate(appFn, context$)
    let [requests, responses] = Cycle.run(wrappedAppFn, {
      DOM: makeHTMLDriver(),
      context: () => context$
    })

    let html$ = responses.DOM.get(':root').map(prependDoctype)
    html$.subscribe(html => response.send(html))
  }).catch(err => {
    console.log(err);
    response.render('error', {
        err: err
    });
  });
});

app.get('/login', (request, response) => {
    response.render('login');
});

app.get('/login/failed', (request, response) => {
    response.render('login', {
        failed: true
    });
});

app.get('/post/:original', ensureAuthenticated, (request, response) => {
    let original = decodeURIComponent(request.params.original);

    db.findByOriginal(original).then( (post) => {
        if (!post) {
            throw new Error('No post found with original: ' + original);
        }

        response.render('post', {
            post: post
        });
    }).catch( (err) => {
        console.log(err);
        response.render('error', {
            err: err
        });
    });
});

app.post('/post/:original', ensureAuthenticated, (request, response) => {
    let original = decodeURIComponent(request.params.original);
    let translation = request.body.translation;

    if (!translation || !translation.length) {
        throw new Error('Translation not found in request body');
    }

    db.findByOriginal(original).then( (post) => {
        if (!post) {
            throw new Error('No post found with original: ' + original);
        }

        if (post.post_url) {
            throw new Error('Already posted!');
        }


        let client = tumblr.createClient({
          consumer_key: process.env.TUMBLR_CONSUMER_KEY,
          consumer_secret: process.env.TUMBLR_SECRET_KEY,
          token: request.user.token,
          token_secret: request.user.tokenSecret
        });

        client.text(process.env.TUMBLR_BLOG_DOMAIN, {
            title: translation,
            body: original
        }, (err, tumblrResponse) => {
            console.log('****** TUMBLR POST RESPONSE', tumblrResponse);
            post.translation = translation;
            post.post_url = `http://${process.env.TUMBLR_BLOG_DOMAIN}/post/${tumblrResponse.id}`;

            db.update(post).then( () => {
                response.render('post', {
                    post: post
                });
            });
        });

    }).catch( (err) => {
        console.log(err);
        response.render('error', {
            err: err
        });
    });
});


// GET /auth/tumblr
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Tumblr authentication will involve redirecting
//   the user to tumblr.com.  After authorization, Tumblr will redirect the user
//   back to this application at /auth/tumblr/callback
app.get('/auth/tumblr',
  passport.authenticate('tumblr'),
  function(req, res){
    // The request will be redirected to Tumblr for authentication, so this
    // function will not be called.
  }
);

// GET /auth/tumblr/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/tumblr/callback', 
  passport.authenticate('tumblr', { failureRedirect: '/login/failed', successRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  }
);
/*
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: true,
  store: new (pgSession(session))({ pg }),
  cookie: { maxAge: 90 * 24 * 60 * 60 * 1000 } // 90 days
}));
*/

let io = SocketIO(server, { path: '/proverbs/socket.io'})

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key:          'connect.sid',
  secret:       process.env.SESSION_SECRET,
  store:        sessionStore,

  success: (data, accept) => {
    console.log('successful connection to socket.io');
    accept();
  },

  fail: (data, message, error, accept) => {
    console.log('failed connection to socket.io:', message);
    if(error)
      accept(new Error(message));
  }
}))

io.on('connection', (socket) => {
  console.log('[connection]', socket.id);

  ['connect', 'disconnect', 'reconnect', 'error'].forEach(evt => {
    socket.on(evt, () => {
      console.log(`[${evt}]`, socket.id)
    })
  })

})


/* START SERVER */
server.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
