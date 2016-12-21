'use strict';

var unirest = require('unirest');

var Users = require('../models/users.js');

function MangaHandler () {
    this.getManga = function (req, res) {
        var data = req.query;
        
        unirest.get("https://doodle-manga-scraper.p.mashape.com/mangafox.me/manga/" + data.mangaId)
            .header("X-Mashape-Key", process.env.MANGA_SCRAPER_TOKEN)
            .header("Accept", "text/plain")
            .end(function (result) {
                result.body.mangaId = data.mangaId; // include the mangaId to the returned data
                res.status(200).send(result.body);
            });
    };
    
    this.getMangaOwners = function (req, res) {
        var data = req.params;
        
        Users
            .find({ '_id': { $ne: req.user._id }, 'manga.mangaId': data.mangaId }, { 'manga': { $elemMatch: { 'mangaId': data.mangaId }}})
            .select('-__v -facebook.id')
            .exec(function (err, result) {
                if (err) { throw err; }
                
                res.status(200).send({ owners: result });
            });
    };
    
    this.getUniqueManga = function (req, res) {
        Users
            .distinct('manga.mangaId')
            .exec(function (err, result) {
                if (err) { throw err; }
                
                res.status(200).send({ manga: result });
            });
    };
    
    this.search = function (req, res) {
        var data = req.params;
        data.q = data.q.replace(/\s/g, "+");
        
        unirest.get("https://doodle-manga-scraper.p.mashape.com/mangafox.me/search?l=10&q=" + data.q)
            .header("X-Mashape-Key", process.env.MANGA_SCRAPER_TOKEN)
            .header("Accept", "text/plain")
            .end(function (result) {
                var finalData = [];
                
                if (result.body && result.body.length) {
                    result.body.forEach(function (item) {
                        finalData.push({
                            mangaId: item.mangaId,
                            name: item.name
                        });
                    });    
                }
                
                res.status(200).send({ data: finalData });
            });
    };
}

module.exports = MangaHandler;