var express = require('express');
var log = require('logged')(__filename);
var app = require('express')();
var httpProxy = require('http-proxy');

app.use(express.static(__dirname));


app.configure('development', function() {
  app.set('proxy.host', 'localhost');
  app.set('proxy.port', 3000);
  app.use(express.static(__dirname + '/test'));
});

app.configure('staging', 'production', function() {
  app.set('proxy.host', 'magic.staging.goodybag.com');
  app.set('proxy.port', 80);
});

app.configure('production', function() {
  app.configure('staging', 'production', function() {
    app.set('proxy.host', 'magic.goodybag.com');
    app.set('proxy.port', 80);
  });
});

var proxy = new httpProxy.HttpProxy({
  target: {
    host: app.set('proxy.host'),
    port: app.set('proxy.port'),
  },
  changeOrigin: true
});

app.use(function(req, res, next) {
  log.debug('proxy request', {
    path: req.path,
    host: app.set('proxy.host'),
    port: app.set('proxy.port')
  })
  proxy.proxyRequest(req, res);
});

require('http').createServer(app).listen(8000);
