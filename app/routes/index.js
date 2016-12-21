'use strict';

var path = process.cwd();

module.exports = function (app, passport) {
	// Paths to import
	var MangaHandler = require(path + '/app/handlers/mangaHandler.server.js');
	var TradeHandler = require(path + '/app/handlers/tradeHandler.server.js');
	var UserHandler = require(path + '/app/handlers/userHandler.server.js');
	
	// Objects imported
	var mangaHandler = new MangaHandler();
	var tradeHandler = new TradeHandler();
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
		
	app.route('/manga/collection')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/manga-collection.html');
		});
		
	app.route('/trade/search')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/trade-search.html');
		});
		
	app.route('/trade/manga/:mangaId')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/trade-search-select.html');
		});
		
		
		
		
		
	/***** JSONs *****/
	app.route('/json/cities')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/json/cityph.json');
		});
		
	app.route('/json/provinces')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/json/provinceph.json');
		});
		
	app.route('/json/regions')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/json/regionph.json');
		});
		
		
		


	/***** APIs *****/
	app.route('/api/manga')
		.get(isAuthorized, mangaHandler.getManga);
		
	app.route('/api/manga/owners/:mangaId')
		.get(mangaHandler.getMangaOwners);
		
	app.route('/api/manga/unique')
		.get(mangaHandler.getUniqueManga);
		
	app.route('/api/search/:q')
		.get(isAuthorized, mangaHandler.search);
		
	app.route('/api/trade/new')
		.post(isAuthorized, tradeHandler.addTrade);
		
	app.route('/api/trade/user')
		.get(isAuthorized, tradeHandler.getTrades);
	
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
    
	app.route('/api/user/manga')
		.delete(isAuthorized, userHandler.deleteManga)
		.post(isAuthorized, userHandler.addManga)
		.put(isAuthorized, userHandler.updateManga);
    
    
    
    

	/***** Facebook authorization *****/
	app.route('/auth/facebook')
		.get(passport.authenticate('facebook'));

	app.route('/auth/facebook/callback')
		.get(passport.authenticate('facebook', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
};
