'use strict';

var Trades = require('../models/trades.js');

function TradeHandler () {
    this.addTrade = function (req, res) {
        var data = req.body;
        
        var newTrade = new Trades();
        newTrade.dateRequested = new Date();
        newTrade.from = req.user._id;
        newTrade.mangaId = data.mangaId;
        newTrade.status = 'PENDING';
        newTrade.volumesRequested = data.volumesRequested;
        newTrade.to = data.to;
        
		newTrade.save(function (err) {
			if (err) { throw err; }
			
			res.sendStatus(200);
		});
    };
    this.getTrades = function (req, res) {
        var data = req.query;
        
        Trades
            .find({ 'from': req.user._id, 'mangaId': data.mangaId })
            .exec(function (err, result) {
                if (err)  { throw err; }
                
                res.status(200).send({ trades: result });
            });
    };
}

module.exports = TradeHandler;