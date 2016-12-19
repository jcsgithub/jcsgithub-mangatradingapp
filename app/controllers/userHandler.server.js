'use strict';

var Users = require('../models/users.js');

function UserHandler () {
    this.deleteManga = function (req, res) {
        var data = req.query;
        
        Users
            .findOneAndUpdate({ '_id': req.user._id }, { $pull: { 'manga': { 'mangaId': data.mangaId }}})
            .exec(function (err) {
                if (err) { throw err; }
        
                res.sendStatus(200);
            }
        );
    };
    
    this.updateAccount = function (req, res) {
        var data = req.body;
        
        Users
            .findOneAndUpdate({ '_id': data._id }, { $set: { 'facebook.displayName': data.displayName, 'location': data.location }})
            .exec(function (err) {
                if (err) { throw err; }
        
                res.sendStatus(200);
            }
        );
    };
    
    this.updateManga = function (req, res) {
        var data = req.body;
        
        Users
            .findOneAndUpdate({ '_id': req.user._id }, { $push: { 'manga': data.newManga }})
            .exec(function (err) {
                if (err) { throw err; }
        
                res.sendStatus(200);
            }
        );
    };
}

module.exports = UserHandler;