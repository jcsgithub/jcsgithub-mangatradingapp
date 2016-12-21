'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Trade = new Schema({
    dateRequested: Date,
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mangaId: String,
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String,
    volumesRequested: Array
});

module.exports = mongoose.model('Trade', Trade);
