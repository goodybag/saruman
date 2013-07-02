var express = require('express');
var app = require('express')();
var httpProxy = require('http-proxy');

app.use(express.static(__dirname));

var proxy = new httpProxy.RoutingProxy();

app.use(function(req, res, next) {
  proxy.proxyRequest(req, res, {
    host: 'localhost',
    port: 3000
  });
});

require('http').createServer(app).listen(8000);
