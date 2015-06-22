import polyfill from 'babel/polyfill';

import cheerio from 'cheerio';
import getList from './get_list';
import parser  from './parser';
import db      from '../shared/db';

getList().then( (listHtml) => {
    var parsedTexts = parser(listHtml);

    parsedTexts.forEach( (text) => {
        db.insert({ original: text }).then(() => {
            console.log(`[OK]  INSERT: ${text}`);
        }).catch( (err) => {
            console.log(`[ERR] INSERT: ${text}; ${err}`);
        });
    });
}).catch( (err) => {
    console.log(err);
});
