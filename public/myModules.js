function myDateTime() {
    return Date();
};

function appendDiv() {
	// body...
	var task = $('#text').val();
	$('#append').append("<li id='task'>" + task + "</li>");
}
$('#append').click(function(){
	$("#task").remove();
});

"use strict";
var geocoder;
var map;
var latitude,longitude;

// setup initial map
function initialize() {
	geocoder		= new google.maps.Geocoder();						// create geocoder object
	var latlng		= new google.maps.LatLng(6.465422, 3.406448);		// set default lat/long (Lagos City)
	var mapOptions	= {													// options for map
		zoom: 8,
		center: latlng
	}
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);	// create new map in the map-canvas div
	var marker = new google.maps.Marker({
      map: map,
      position: latlng,
      title: 'You are Here'
    });
}

// function to geocode an address and plot it on a map
function codeAddress(address) {
	geocoder.geocode( {'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			latitude	= results[0].geometry.location.lat();
			longitude	= results[0].geometry.location.lng();
			
			$("#location-lat-long").val("lat: "+latitude+" / longitude: "+longitude);	// write lat/long to input field
			getWeather(latitude,longitude);					// get weather for returned lat/long
			map.setCenter(results[0].geometry.location);				// center the map on address
			var marker = new google.maps.Marker({						// place a marker on the map at the address
				map: map,
				position: results[0].geometry.location
			});
			
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}

// function to get weather for an address
function getWeather(latitude,longitude) {
	if(latitude != '' && longitude != '') {
		$("#weather").val("Retrieving weather...");										// write temporary response while we get the weather
		$.getJSON( "http://api.openweathermap.org/data/2.5/weather?lat="+latitude+"&lon="+longitude+"&APPID=6542ba721ab6c09627bc563f9015a1bd&units=metric", function(data) {	// add '&units=imperial' to get U.S. measurements
			var currWeather					= new Array();								// create array to hold our weather response data
			currWeather['currTemp']			= Math.round(data.main.temp);				// current temperature
			currWeather['highTemp']			= Math.round(data.main.temp_max);			// today's high temp
			currWeather['lowTemp']			= Math.round(data.main.temp_min);			// today's low temp
			currWeather['humidity']			= Math.round(data.main.humidity);			// humidity (in percent)
			currWeather['pressure']			= data.main.pressure * 0.02961339710085;	// barometric pressure (converting hPa to inches)
			currWeather['pressure']			= currWeather['pressure'].toFixed(2);		// barometric pressure (rounded to 2 decimals)
			
			currWeather['description']		= data.weather[0].description;				// short text description (ie. rain, sunny, etc.)
			currWeather['icon']				= "http://openweathermap.org/img/w/"+data.weather[0].icon+".png";	// 50x50 pixel png icon
			currWeather['cloudiness']		= data.clouds.all;							// cloud cover (in percent)
			currWeather['windSpeed']		= Math.round(data.wind.speed);				// wind speed
			
			currWeather['windDegree']		= data.wind.deg;							// wind direction (in degrees)
			currWeather['windCompass']		= Math.round((currWeather['windDegree'] -11.25) / 22.5);	// wind direction (compass value)
			
			// array of direction (compass) names
			var windNames					= new Array("North","North Northeast","Northeast","East Northeast","East","East Southeast", "Southeast", "South Southeast","South","South Southwest","Southwest","West Southwest","West","West Northwest","Northwest","North Northwest");
			// array of abbreviated (compass) names
			var windShortNames				= new Array("N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW");
			currWeather['windDirection']	= windNames[currWeather['windCompass']];	// convert degrees and find wind direction name
			
			
			var response 		= "Current Weather: "+currWeather['currTemp']+"\xB0 and "+currWeather['description'];
			var spokenResponse	= "It is currently "+currWeather['currTemp']+" degrees and "+currWeather['description'];
			
			if(currWeather['windSpeed']>0) {											// if there's wind, add a wind description to the response
				response		= response+" with winds out of the "+windNames[currWeather['windCompass']]+" at "+currWeather['windSpeed'];
				spokenResponse	= spokenResponse+" with winds out of the "+windNames[currWeather['windCompass']]+" at "+currWeather['windSpeed'];
				if(currWeather['windSpeed']==1) {
					response		+= " mile per hour";
					spokenResponse	+= " mile per hour";
				} else {
					response		+= " miles per hour";
					spokenResponse	+= " miles per hour";
				}
			}
			
			console.log(data);												// log weather data for reference (json format) 
			$("#weather").val(response);

			speakText(spokenResponse);
		});
	} else {
		return false;														// respond w/error if no address entered
	}
}

// function to speak a response
function speakText(response) {
	
	// setup synthesis
	var msg = new SpeechSynthesisUtterance();
	var voices = window.speechSynthesis.getVoices();
	msg.voice = voices[2];					// Note: some voices don't support altering params
	msg.voiceURI = 'native';
	msg.volume = 1;							// 0 to 1
	msg.rate = 1;							// 0.1 to 10
	msg.pitch = 2;							// 0 to 2
	msg.text = response;
	msg.lang = 'en-US';
	
	speechSynthesis.speak(msg);
}
	
//google.maps.event.addDomListener(window, 'load', initialize);		// setup initial map

$(document).ready(function() {
	$.ajaxSetup({ cache: false });									// make sure we don't cache our JSON request
	
	// get location button functionality
	$("#get-weather-btn").click(function(event){
		event.preventDefault();
		$("#location-lat-long").val("Finding location. Please wait...");
		var address = $("#address").val();							// grab the address from the input field
		codeAddress(address);										// geocode the address
	});	
});