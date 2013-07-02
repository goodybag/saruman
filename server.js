var express = require('express');
var app = require('express')();
var httpProxy = require('http-proxy');

app.use(express.static(__dirname));

var proxy = new httpProxy.RoutingProxy();

app.configure(function() {
  app.set('proxy.host', 'localhost');
  app.set('proxy.port', 3000);
});

app.configure('staging', 'production', function() {
  app.set('proxy.host', 'magic.staging.goodybag.com');
  app.set('proxy.port', 80);
});

app.use(function(req, res, next) {
  console.log('proxing request', req.path, 'to', app.set('proxy.host'), app.set('proxy.port'));
  proxy.proxyRequest(req, res, {
    host: app.set('proxy.host'),
    port: app.set('proxy.port')
  });
});

require('http').createServer(app).listen(8000);
