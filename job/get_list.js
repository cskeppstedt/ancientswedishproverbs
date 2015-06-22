import polyfill from 'babel/polyfill';

import fs from 'fs';
import request from 'request';

var URL = 'https://sv.wikipedia.org/wiki/Lista_över_svenska_ordspråk',
    FILE_PATH = './list.html',
    ENCODING  = 'utf-8';

export default function() {
    var promise = new Promise( (resolve, reject) => {

        if (fs.existsSync(FILE_PATH)) {
            fs.readFile(FILE_PATH, ENCODING, (err, content) => {
                if (err) {
                    console.log(`Could not read ${FILE_PATH}: ${err}`);
                    reject(err);
                } else {
                    console.log(`Returning file contents of ${FILE_PATH}`);
                    resolve(content);
                }
            });

            return;
        }

        request({ uri: URL }, (err, response, body) => {
            if (err || response.statusCode !== 200) {
                console.log(`Request error. HTTP status ${response.statusCode}, error: ${err}`);
                return reject(err);
            }

            console.log('HTTP response status ' + response.statusCode);
            console.log('Writing to list.html');

            fs.writeFile(FILE_PATH, body, function(err) {
                if(err) {
                    console.log(`Error when writing ${FILE_PATH}: ${err}`);
                    return reject(err);
                }

                console.log("File saved!");
                resolve(body);
            });
        });

    });

    return promise;
};

