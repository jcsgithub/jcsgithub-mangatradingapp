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
    
    this.getTradesByManga = function (req, res) {
        var data = req.query;
        
        Trades
            .find({ 'from': req.user._id, 'mangaId': data.mangaId, 'status': 'PENDING' })
            .exec(function (err, result) {
                if (err)  { throw err; }
                
                res.status(200).send({ trades: result });
            });
    };
    
    this.getTradesByUser = function (req, res) {
        Trades
            .find({ $or:[ { 'from': req.user._id }, { 'to': req.user._id }]})
            .populate('from', 'facebook.displayName location')
            .populate('to', 'facebook.displayName location')
            .sort('-dateRequested')
            .exec(function (err, result) {
                if (err)  { throw err; }
                
                res.status(200).send({ trades: result });
            });
    };
    
    this.updateTrade = function (req, res) {
        var data = req.body;
        
        Trades
            .findByIdAndUpdate(data.id, { 'status': data.newStatus })
            .exec(function (err, result) {
                if (err)  { throw err; }
                
                res.sendStatus(200);
            });
    };
}

module.exports = TradeHandler;