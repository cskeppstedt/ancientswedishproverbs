import 'babel/polyfill';

import express  from 'express';


/* SETUP */
var app = express();

app.set('view engine', 'jade');
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));


/* ROUTES */
app.get('/', (request, response) => {
    response.send('foo');
});


/* START SERVER */
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
