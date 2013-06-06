require('http').createServer(require('express')().use(require('express').static(__dirname))).listen(8000);
