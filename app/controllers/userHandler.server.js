'use strict';

var Users = require('../models/users.js');

function UserHandler () {
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
}

module.exports = UserHandler;