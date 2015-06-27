import selenium from './selenium';
import translate from './translate';
import * as db  from '../../shared/db';

async function translateAll(posts) {
    let counter = 0;

    for (let post of posts) {
        counter += 1;
        let swedishProverb = post.original;

        console.log(`[${counter}/${posts.length}]Translating ${swedishProverb}`);
        let translation = await translate(swedishProverb);

        console.log(`Inserting translation ${translation}`);
        await db.update({
            original: swedishProverb,
            translation: translation
        });
    }
};


selenium().then( () =>
    db.listNonTranslated()
).then( (posts) => {
    if (!posts || !posts.length) {
        console.log('There are no posts to translate!');
        return;
    }

    console.log(`There are ${posts.length} posts to translate!`);
    translateAll(posts);
})
.catch( (err) => {
    console.log(err);
});
