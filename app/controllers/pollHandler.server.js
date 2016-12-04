'use strict';

var Polls = require('../models/polls.js');

function PollHandler () {
    this.addPoll = function (req, res) {
        var data = req.body;
        
        // Check if user already created the same poll
        Polls
            .findOne({ 'creator': data.creator, 'description_lower': data.description.toLowerCase() }, { '_id': false })
            .exec(function (err, result) {
                if (err) { throw err; }
                
                if (result) {
                    res.status(500).send('You already created a poll with the same description.');
                } else {
                    var poll = new Polls({
                        creator: data.creator,
                        description: data.description,
                        description_lower: data.description.toLowerCase(),
                        options: data.options
                    });
                    
                    poll.save(function (err) {
                        if (err) { return err; }
                        res.sendStatus(200);
                    });
                }
                
            });
    };
    
    this.deletePoll = function (req, res) {
        console.log('deletePoll', req);
    };
    
    this.getPolls = function (req, res) {
        Polls
            .find({}, function (err, docs) {
                if (err) { throw err; }
                res.send({ data: docs });
            });
    };
    
//     this.getClicks = function (req, res) {
//         Users
//             .findOne({ 'github.id': req.user.github.id }, { '_id': false })
//             .exec(function (err, result) {
//                 if (err) { throw err; }

//                 res.json(result.nbrClicks);
//             });
//     };
   
//   this.addClick = function (req, res) {
//         Users
//             .findOneAndUpdate({ 'github.id': req.user.github.id }, { $inc: { 'nbrClicks.clicks': 1 } })
//             .exec(function (err, result) {
//                     if (err) { throw err; }

//                     res.json(result.nbrClicks);
//                 }
//             );
//     };

//     this.resetClicks = function (req, res) {
//         Users
//             .findOneAndUpdate({ 'github.id': req.user.github.id }, { 'nbrClicks.clicks': 0 })
//             .exec(function (err, result) {
//                     if (err) { throw err; }

//                     res.json(result.nbrClicks);
//                 }
//             );
//     };
}

module.exports = PollHandler;