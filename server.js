//var http = require('http');

var express = require('express')
var app = express()

app.use(express.static('public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + "/index.html");
});
app.listen(3000, function(){
	console.log('My Web app listening to port: 3000!');
});