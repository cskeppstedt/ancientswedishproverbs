import standalone from 'selenium-standalone';
import Promise from 'bluebird';

let install = Promise.promisify(standalone.install);
let start   = Promise.promisify(standalone.start);

export default function() {
    return install({
        version: '2.45.0',
        baseURL: 'http://selenium-release.storage.googleapis.com',
        drivers: {
            chrome: {
              version: '2.15',
              arch: process.arch,
              baseURL: 'http://chromedriver.storage.googleapis.com'
            }
        },
        logger: function(message) {
            console.log(message);
        }
    }).then(function() {
        console.log('Starting selenium standalone...');
        return start();
    }).then(function(child) {
        console.log(`Selenium standalone running (PID ${child.pid})`);
    });
};
