## Scraper

`foreman start scrape`

1. Downloads the list of swedish proverbs from wikipedia
2. Inserts the proverbs to the postgres db

## Translater

`foreman start translate`

1. Collects all proverbs not yet translated from the db
2. Uses a webdriver to fetch the translation from translate.google.com

## Web UI

TBD
