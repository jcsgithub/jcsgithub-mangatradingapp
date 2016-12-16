'use strict';

var path = process.cwd();

module.exports = function (app, passport) {
	// Paths to import
	var UserHandler = require(path + '/app/controllers/userHandler.server.js');
	
	// Objects imported
	var userHandler = new UserHandler();
	
	
	
	

    function isLoggedIn (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/');
        }
    }

	function isAuthorized (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.sendStatus(401);
		}
	}





	/***** Public routes *****/
	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

		
		
		

	/***** APIs *****/
    app.route('/api/user')
        .get(isAuthorized, function (req, res) {
        	var userData = {
        		_id: req.user._id,
				bars: req.user.bars,
				displayName: req.user.facebook.displayName
        	};
            res.json(userData);
        });
        
    
    
    

	/***** Facebook authorization *****/
	app.route('/auth/facebook')
		.get(passport.authenticate('facebook'));

	app.route('/auth/facebook/callback')
		.get(passport.authenticate('facebook', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
};
