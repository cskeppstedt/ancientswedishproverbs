import pg from 'pg';

var db, doQuery;


// --------------------------------------------------------------------------
//  Internals
// --------------------------------------------------------------------------
doQuery = (options) => {
  return new Promise((resolve, reject) => {

    pg.connect(process.env.DATABASE_URL, (err, client, done) => {
      if (err) {
        done();
        return reject(err);
      }

      client.query(options.query, options.params, (err, result) => {
        done();

        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

  });
};


// --------------------------------------------------------------------------
//  API
// --------------------------------------------------------------------------
var list = () => {
  return doQuery({
    query: 'SELECT * FROM posts'
  }).then(result => {
    return result.rows;
  });
};

var insert = (post) => {
  return doQuery({
    query:  'INSERT INTO posts (original, translation, post_url) VALUES ($1,$2,$3)',
    params: [ post.original, post.translation, post.post_url ]
  });
};


// --------------------------------------------------------------------------
//  Exports
// --------------------------------------------------------------------------
module.exports = {
  insert,
  list
};
