
/*
 * GET home page.
 */


exports.index = function(req, res){
	if(req.session.idx != null) {
		res.cookie('idx', req.session.idx, { expires: new Date(Date.now() + 99999999999), httpOnly: true});
		res.cookie('token', req.session.token, { expires: new Date(Date.now() + 99999999999), httpOnly: true});
		res.cookie('tokenSecret', req.session.tokenSecret, { expires: new Date(Date.now() + 99999999999), httpOnly: true});
	}
  	else if (req.cookies != null) {
		req.session.idx = req.cookies.idx;
		req.session.token = req.cookies.token;
		req.session.tokenSecret = req.cookies.tokenSecret;
	}
	res.render('index', { title: 'Express', id: req.session.idx});
	
};


