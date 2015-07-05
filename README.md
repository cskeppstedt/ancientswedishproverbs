# Ancient swedish proverbs

A side project that pulls swedish proverbs from wikipedia, runs them through
Google Translate, and finally stores them in a postgres db to be published to
tumblr later on.

Since the Google Translate API is a paid service, I thought it'd be fun to use
a webdriver (Selenium with Chrome driver) instead.

The apps are dependant on variables in a `.env.`-file to run. The web-app is
hosted on http://ancientswedishproverbs.herokuapp.com/ while the scrape/translate
jobs are meant to be run locally. After running the jobs once, I pushed the db
to heroku.

The posts are published to http://ancientswedishproverbs.tumblr.com/ and also
auto-tweeted to https://twitter.com/sweproverbs

## Scraper

`foreman start scrape`

1. Downloads the list of swedish proverbs from wikipedia
2. Inserts the proverbs to the postgres db

## Translater

`foreman start translate`

1. Collects all proverbs not yet translated from the db
2. Uses a webdriver to fetch the translation from translate.google.com

## Web UI

`foreman start web`

1. Starts a local webserver on http://localhost:5000/
