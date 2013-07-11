var express = require('express');
var log = require('logged')(__filename);
var app = require('express')();
var httpProxy = require('http-proxy');



app.configure('development', function() {
  app.set('proxy.host', 'localhost');
  app.set('proxy.port', 3000);
  app.set('listen.port', process.env.PORT || 3000);
  app.set('dir.static', __dirname);
  app.use(express.static(__dirname + '/test'));
});

app.configure('staging', function() {
  app.set('proxy.host', 'magic.staging.goodybag.com');
  app.set('dir.static', __dirname + '/build');
  app.set('listen.port', process.env.PORT || 8000);
  app.set('proxy.port', 80);
});

app.configure('production', function() {
  app.set('proxy.host', 'magic.goodybag.com');
  app.set('dir.static', __dirname + '/build');
  app.set('listen.port', process.env.PORT || 8001);
  app.set('proxy.port', 80);
});

var proxy = new httpProxy.HttpProxy({
  target: {
    host: app.set('proxy.host'),
    port: app.set('proxy.port'),
  },
  changeOrigin: true
});

app.use(express.static(app.set('dir.static')));
app.use(function(req, res, next) {
  log.debug('proxy request', {
    path: req.path,
    host: app.set('proxy.host'),
    port: app.set('proxy.port')
  })
  proxy.proxyRequest(req, res);
});

var port = app.set('listen.port');
require('http').createServer(app).listen(port, function() {
  log.info('listening', {port: port});
});
