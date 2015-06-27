import Promise from 'bluebird';
import webdriverio from 'webdriverio';

let client = webdriverio.remote({
    desiredCapabilities: {
        browserName: 'chrome'
    }
});


export default function(swedishProverb) {
    let url = `https://translate.google.com/#sv/en/${encodeURIComponent(swedishProverb)}`

    return new Promise( (resolve, reject) => {
        client
            .init()
            .url(url)
            .waitForText('#result_box', 2000)
            .getText('#result_box')
                .then( (text) => {
                    resolve(text);
                })
                .catch( (err) => {
                    console.log('Failed to fetch the translation');
                    reject(err);
                })
            .end();
    });
};
