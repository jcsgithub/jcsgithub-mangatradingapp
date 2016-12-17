'use strict';

var path = process.cwd();

module.exports = function (app, passport) {
	// Paths to import
	var MangaHandler = require(path + '/app/controllers/mangaHandler.server.js');
	var UserHandler = require(path + '/app/controllers/userHandler.server.js');
	
	// Objects imported
	var mangaHandler = new MangaHandler();
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
		
	app.route('/account')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/account.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});
		
	app.route('/manga/add')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/manga-add.html');
		});

		
		
		

	/***** APIs *****/
	app.route('/api/search/:q')
		.get(mangaHandler.search);
	
    app.route('/api/user')
        .get(isAuthorized, function (req, res) {
        	var userData = {
        		_id: req.user._id,
				displayName: req.user.facebook.displayName,
				location: req.user.location,
				manga: req.user.manga
        	};
            res.json(userData);
        })
        .put(isAuthorized, userHandler.updateAccount);
    
    
    

	/***** Facebook authorization *****/
	app.route('/auth/facebook')
		.get(passport.authenticate('facebook'));

	app.route('/auth/facebook/callback')
		.get(passport.authenticate('facebook', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
};
