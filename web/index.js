import 'babel/polyfill';

import express  from 'express';
import * as db  from '../shared/db';


/* SETUP */
var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));


/* ROUTES */
app.get('/', (request, response) => {
    db.list().then( (posts) => {
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


/* START SERVER */
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
