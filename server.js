var app = require('express')().use(require('express').static(__dirname));
var fs = require('fs');
app.get('/test-menu-loader.html', function(req, res, next) {
  res.writeHead(200, {'content-type':'text/html'});
  res.end(fs.readFileSync(__dirname + '/test/menu-loader.html'))
})
require('http').createServer(app).listen(8000);
