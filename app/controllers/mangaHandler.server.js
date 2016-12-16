'use strict';

var unirest = require('unirest');

function MangaHandler () {
    this.search = function (req, res) {
        var data = req.params;
        data.q = data.q.replace(/\s/g, "+");
        
        unirest.get("https://doodle-manga-scraper.p.mashape.com/mangareader.net/search?cover=1&info=1&l=10&q=" + data.q)
            .header("X-Mashape-Key", process.env.MANGA_SCRAPER_TOKEN)
            .header("Accept", "text/plain")
            .end(function (result) {
                res.status(200).send({ data: result.body })
            });
    };
}

module.exports = MangaHandler;