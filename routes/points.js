var config = require('../appinfo');
var OAuth = require('oauth');
var util = require('util');
var Worker = require('webworker-threads').Worker;
var oauth = new OAuth.OAuth(
	'https://api.twitter.com/oauth/request_token',
	'https://api.twitter.com/oauth/access_token',
	config.keys['appId'],
	config.keys['appSecret'],
	'1.0A',
	null,
	'HMAC-SHA1');

var url = require('url');

exports.search = function(req, res){
	var queryData = url.parse(req.url, true).query;
	//res.send(queryData);

	oauth.get('https://api.twitter.com/1.1/search/tweets.json?count=100&geocode='+queryData.lat+','+queryData["long"]+',1mi',
		  config.keys['accessToken'],
		  config.keys['accessSecret'],
		  function(e, data, resp) {
		      var ret = new Array();
		      var obj = JSON.parse(data).statuses;
			/*var counter = 0;
			for(var i = 0; i<obj.length; i++) {
				(function() {
					var j = i;
					var innerret = ret;
					process.nextTick(function() {
						var item = obj[j];
						if(item) {
							if(item.geo) {
								innerret[counter] =  {geo:{coordinates: item.geo.coordinates}, text:item.text, user: {profile_image_url: item.user.profile_image_url}};
								counter++;
							}
						}
					});
				})();
				console.log(ret);
			}
		      console.log(ret);*/
var process = new Worker(function() {
    function process (obj) {
	var ret = new Array();
	var counter = 0;
	for(var i = 0; i<obj.length; i++) {
		var item = obj[i];
		if(item.geo) {
			ret[counter] = {geo:{coordinates: item.geo.coordinates}, text:item.text, user: {profile_image_url: item.user.profile_image_url}};
			counter++;
		}
	}
	return(ret);
    }
    onmessage = function (event) {
      postMessage(process(event.data));
    }
  });
  process.onmessage = function (event) {
	console.log(event.data);
	var dx = {statuses: event.data};
	res.send(dx);
  };
  process.postMessage(obj);
		      //res.send(data);
		  });
};

exports.tweet = function(req, res) {
        var idx = req.cookies.idx;
        var token = req.cookies.token;
        var secret = req.cookies.tokenSecret;
	console.log(req.body);
	console.log("Ewee");
	oauth.post("https://api.twitter.com/1.1/statuses/update.json", token, secret, 
		{status: req.body.tweet, "lat":req.body.latitude, "long":req.body.longitude, display_coordinates:true}, 
		function () {
		        res.send("Hello world");
		});
}

