var map = null;
var last = 300000;
var mdata = 1;
var miminis_windows = new Array(); 

function sendTweet() {
	var tweet = $(Tweet).val();
	navigator.geolocation.getCurrentPosition(function (position) {
		var data = {tweet: tweet, latitude: position.coords.latitude, longitude: position.coords.longitude};
		$.ajax({
			url: "/geotweet/sendTweet",
			type: "POST",
			data: data,
			success: getTweets,
			dataType: "text"});
		
		
	}, mapError, { timeout: 10000,
         enableHighAccuracy: true,
         maximumAge:0 });

}

function initMap(position) {
	var mapOptions = {
		zoom: 15,
		center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	  };
	  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

function mapError() {
	alert("Error");
}

function init() {
	navigator.geolocation.getCurrentPosition(initMap, mapError, { timeout: 10000,
         enableHighAccuracy: true,
         maximumAge:0 });
}

function getTweets() {
	console.log('start');
	navigator.geolocation.getCurrentPosition(function (position) {   
		var urlx = encodeURI("/geotweet/search?q=miminis&lat="+position.coords.latitude+"&long="+position.coords.longitude);
		console.log("Boo");
		$.ajax({
			url: urlx,
			type: "GET",
			success: parseData,
			contentType: "charset=utf-8",
			dataType: "json",
			timeout: 20000
			})
	},mapError,null );
}

function parseData(data) {
	mdata = data;
	console.log('fineinshed');
	var oms = new OverlappingMarkerSpiderfier(map);
	var gm = google.maps;
	var iw = new gm.InfoWindow();
	oms.addListener('click', function(marker, event) {
		iw.setContent(marker.desc);
		iw.open(map, marker);
	});
	oms.addListener('spiderfy', function(markers) {
		iw.close();
	});
	$.each(data.statuses, function(i, item) {		
		if(item.geo) {
			var position = new google.maps.LatLng(item.geo.coordinates[0], item.geo.coordinates[1]);
			var marker = new google.maps.Marker({position:position, map:map, title: item.user.name}); 
			var contentString = generateString(item); 
			var infowindow = new google.maps.InfoWindow({
				content: contentString
			});
			miminis_windows[i] = infowindow;
			google.maps.event.addListener(marker, 'click', function() {
				for(var p = 0; p < miminis_windows.length; p++) {
					if(miminis_windows[p]) miminis_windows[p].close();
				}
				infowindow.open(map, marker); 
			});
			oms.addMarker(marker);
		}
	});
	
}
function generateString(item) {
	//var str = '<img src=\'' + item.user.entities.profile.background + '\'' + '>'
	return('<table><tr><td><img src=\''+item.user.profile_image_url+'\'></td><td style=\'max-width:140px; word-wrap:break-word;\'>' + item.text + '</td></tr></table>');
}
getTweets();
