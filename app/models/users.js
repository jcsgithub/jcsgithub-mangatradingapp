'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    facebook: {
    	id: String,
    	displayName: String
    },
    location: {
        city: String,
        province: String,
        region: String
    },
    manga: Array
});

module.exports = mongoose.model('User', User);
