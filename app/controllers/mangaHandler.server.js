'use strict';

var unirest = require('unirest');

function MangaHandler () {
    this.search = function (req, res) {
        var data = req.params;
        data.q = data.q.replace(/\s/g, "+");
        
        unirest.get("https://doodle-manga-scraper.p.mashape.com/mangafox.me/search?cover=1&info=1&l=10&q=" + data.q)
            .header("X-Mashape-Key", process.env.MANGA_SCRAPER_TOKEN)
            .header("Accept", "text/plain")
            .end(function (result) {
                var finalData = result.body;
                
                if (finalData.length) {
                    // counting counters is an alternative to q.all, unirest seems to not return a promise
                    var counter = 0;
                    
                    // mangascraper's search method sometimes returns a broken cover, therefore used the getManga method
                    finalData.forEach(function (item, index) {
                        unirest.get("https://doodle-manga-scraper.p.mashape.com/mangafox.me/manga/" + item.mangaId)
                            .header("X-Mashape-Key", process.env.MANGA_SCRAPER_TOKEN)
                            .header("Accept", "text/plain")
                            .end(function (result) {
                                finalData[index].cover = result.body.cover;
                                
                                counter++;
                                
                                if (counter == finalData.length)
                                    res.status(200).send({ data: finalData })
                            });
                    });
                    
                } else {
                    res.status(200).send({ data: finalData });
                }
                
            });
    };
}

module.exports = MangaHandler;