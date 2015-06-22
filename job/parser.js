import cheerio from 'cheerio';

export default function(listHtml) {
    var $ = cheerio.load(listHtml),
        items = $('ul > li');

    items = items.map(function(i, elem) {
        return $(this).find('i').first();
    }).filter(function(i, elem) {
        return this.length === 1 && i <= 326;
    });

    var texts = items.map(function(i, elem) {
        return $(this).text().trim();
    });

    var returnArray = [];
    texts.each( (i, text) => {
        returnArray.push(text);
    });

    return returnArray;
}
