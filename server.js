var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');

// Create a service (the app object is just a callback).
var app = express();

app.use(express.static(__dirname + '/'));

// Create an HTTP service.

var port = process.env.PORT || 3000;
http.createServer(app).listen(port);