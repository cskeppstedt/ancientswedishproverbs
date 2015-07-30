import { Router } from 'express'
import * as db          from '../shared/db'
import { Rx }           from '@cycle/core'
import appServerSide    from './app.server'

let router = Router()


/** HELPERS ****************************************************************/

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      console.log('**** user is logged in')
      return next();
  }

  console.warn('[router] user is not logged in', req.user)
  res.redirect('/login')
}

/** ROUTES *****************************************************************/
module.exports = {
  setup: (passport) => {
    router.get('/', ensureAuthenticated, (request, response) => {
      db.list().then(posts => {
        let context$ = Rx.Observable.just({
          posts: posts.map(post => {
            if (!post.post_url) {
              post.publish_url = '/post/' + encodeURIComponent(post.original);
            }

            return post;
          })
        })

        appServerSide(context$).html$.subscribe(html => response.send(html))
      }).catch(err => {
        console.error('[router]', err);
        response.render('error', {
            err: err
        });
      });
    });

    router.get('/login', (request, response) => {
        response.render('login');
    });

    router.get('/login/failed', (request, response) => {
        response.render('login', {
            failed: true
        });
    });

    router.get('/post/:original', ensureAuthenticated, (request, response) => {
        let original = decodeURIComponent(request.params.original);

        db.findByOriginal(original).then( (post) => {
            if (!post) {
                throw new Error('No post found with original: ' + original);
            }

            response.render('post', {
                post: post
            });
        }).catch( (err) => {
            console.error('[router]', err);
            response.render('error', {
                err: err
            });
        });
    });

    router.post('/post/:original', ensureAuthenticated, (request, response) => {
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
                console.log('[router] tumblr post response recieved', tumblrResponse);
                post.translation = translation;
                post.post_url = `http://${process.env.TUMBLR_BLOG_DOMAIN}/post/${tumblrResponse.id}`;

                db.update(post).then( () => {
                    response.render('post', {
                        post: post
                    });
                });
            });

        }).catch( (err) => {
            console.log('[router]', err)
            response.render('error', {
                err: err
            });
        });
    });

    router.get('/auth/tumblr',
      passport.authenticate('tumblr'),
      function(req, res){
        // The request will be redirected to Tumblr for authentication, so this
        // function will not be called.
      }
    );

    router.get('/auth/tumblr/callback', 
      passport.authenticate('tumblr', { failureRedirect: '/login/failed', successRedirect: '/' }),
      function(req, res) {
        res.redirect('/');
      }
    );

    return router
  }
}
