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
export function list() {
  return doQuery({
    query: 'SELECT * FROM posts'
  }).then(result => {
    return result.rows;
  });
};

export function insert(post) {
  return doQuery({
    query:  'INSERT INTO posts (original, translation, post_url) VALUES ($1,$2,$3)',
    params: [ post.original, post.translation, post.post_url ]
  });
};

export function update(post) {
  return doQuery({
    query:  'UPDATE posts SET translation=$2, post_url=$3 WHERE original=$1',
    params: [ post.original, post.translation, post.post_url ]
  });
};

export function listNonTranslated() {
  return doQuery({
    query: 'SELECT * FROM posts WHERE translation IS NULL'
  }).then(result => {
    return result.rows;
  });
};
