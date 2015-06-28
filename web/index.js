import 'babel/polyfill';

import bodyParser from 'body-parser';
import express    from 'express';
import * as db    from '../shared/db';


/* SETUP */
var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.set('port', (process.env.PORT || 5000));
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

/* ROUTES */
app.get('/', (request, response) => {
    db.list().then( (posts) => {
        posts.forEach( (post) => {
            if (!post.post_url) {
                post.publish_url = '/post/' + encodeURIComponent(post.original);
            }
        });

        response.render('index', {
            posts: posts
        });
    }).catch( (err) => {
        console.log(err);
        response.render('error', {
            err: err
        });
    });
});

app.get('/post/:original', (request, response) => {
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

app.post('/post/:original', (request, response) => {
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

        // TODO: persist translation in db
        // TODO: publish to tumblr
        post.translation = translation;

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


/* START SERVER */
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
