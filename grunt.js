var
  fs     = require('fs')
, jsdom  = require('jsdom')
, wrench = require('wrench')
;

/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-mincss');
  grunt.loadNpmTasks('grunt-s3');
  // grunt.loadNpmTasks('grunt-escher');

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },

    makeBuildDir: {
      build: {
        dir: './build'
      , subs: ['css', 'js']
      }
    },

    mincss: {
      compress: {
        files: {
          'build/<%= pkg.name %>.css': [
            'css/bootstrap.css',
            'css/bootstrap-responsive.css',
            'css/app.css'
          ]
        }
      }
    },

    s3: {
      key: 'AKIAI5ASK2M6JIZDPIYA',
      secret: '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',
      bucket: 'merlin.staging.goodybag.com',
      access: 'public-read',

      upload: [
        {
          src: 'build/index.html'
        , dest: 'index.html'
        , gzip: true
        }
      , {
          src: 'build/css/*.css'
        , dest: 'css/'
        , gzip: false
        }
      , {
          src: 'build/js/*.js'
        , dest: 'js/'
        , gzip: true
        }
      , {
          src: 'build/img/*.png'
        , dest: '/img'
        , gzip: false
        }
      , {
          src: 'build/img/*'
        , dest: '/img'
        , gzip: false
        }
      , {
          src: 'build/font/*'
        , dest: '/font'
        , gzip: false
        }
      , {
          src: 'build/menu-categories/'
        , dest: '/'
        }
      ]
    },

    modifyImagePaths: {
      build: {
        file: 'build/merlin.css'
      , path: ''
      , oldPaths: [
          '../img/'
        ]
      }
    },

    copyStuff: {
      build: {
        stuff: [
          './img'
        , './font'
        , './menu-categories'
        ]
      , dest: 'build'
      }
    },

    changeConfig: {
      build: {
        path: 'config.js',
        from: 'dev',
        to:   'prod'
      }
    },

    restoreConfig: {
      build: {
        path: 'config.js',
        from: 'prod',
        to:   'dev'
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'makeBuildDir mincss copyIndex changeConfig copyStuff restoreConfig');
  grunt.registerTask('deploy', 'default s3');

  grunt.registerMultiTask('makeBuildDir', 'Creates the build dir', function(){
    var error, dir, this_ = this, done = this.async();

    var mkdir = function(){
      if (error = fs.mkdirSync(this_.data.dir))
        return console.log(error), done(false);

      if (!this_.data.subs || this_.data.subs.length === 0) return true;

      while (dir = this_.data.subs.shift()){
        if (!fs.existsSync(this_.data.dir + '/' + dir)){
          if (error = fs.mkdirSync(this_.data.dir + '/' + dir))
            return console.log(error), done(false);
        }
      }

      return done(true);
    };

    if (!fs.existsSync(this.data.dir)) return mkdir();

    wrench.rmdirRecursive(this.data.dir, function(error){
      if (error) return console.log(error), done(false);
      mkdir();
    });
  });

  // TODO: make this able to use configuration for dynamic values
  grunt.registerTask('copyIndex', "Copies index.html to build directory", function(){
    var done = this.async();

    jsdom.env(
      "index.html"
    , ["http://code.jquery.com/jquery.js"]
    , function (errors, window) {
        var $ = window.$, data = "<!DOCTYPE HTML><html>";
        $('link').remove();
        $('head').append($('<link href="css/app.css" rel="stylesheet" media="screen" />'));
        $('.jsdom').remove();
        $('script').eq(0).attr('src', "app.js");
        data += $('html').html() + "</html>";

        fs.writeFile("./build/index.html", data, function(error){
          if (error) return console.log(error), done(false);

          return done(true);
        });
      }
    );
  });

  // The only way I know how to get config args is from doing a multi
  grunt.registerMultiTask('modifyImagePaths', "Modifies the paths of images in merlin.css to work for build", function(){
    var
      done  = this.async()
    , this_ = this

    , getExp = function(path){
        path = path.replace(/\./g, '\\.');
        path = path.replace(/\//g, '\\/');
        return new RegExp(path, 'g');
      }
    ;

    fs.readFile(this.data.file, 'utf-8', function(error, data){
      if (error) return console.log(error), done(false);

      for (var i = this_.data.oldPaths.length - 1; i >= 0; i--){
        data = data.replace(getExp(this_.data.oldPaths[i]), this_.data.path);
      }

      fs.writeFile(this_.data.file, data, function(error){
        if (error) return console.log(error), done(false);

        done(true);
      });
    });
  });

  grunt.registerMultiTask('copyStuff', 'Copies stuff to build directory', function(){
    var
      done  = this.async()
    , stuff = this.data.stuff
    , dest  = this.data.dest

    , getFileName = function(path){
        path = path.split('/');
        return path[path.length - 1] === "" ? path[path.length - 2] : path[path.length - 1];
      }
    ;

    for (var i = stuff.length - 1; i >= 0; i--){
      fs.linkSync(stuff[i], dest + '/' + getFileName(stuff[i]));
    }

    done(true);
  });

  grunt.registerMultiTask('changeConfig', 'Changes the configuration to export production config', function(){
    var
      done  = this.async()
    , path  = this.data.path
    , from  = this.data.from
    , to    = this.data.to
    ;

    fs.readFile(path, 'utf-8', function(error, data){
      if (error) return console.log(error), done(false);

      data = data.replace("return config." + from, "return config." + to);

      fs.writeFile(path, data, function(error){
        if (error) return console.log(error), done(false);

        done(true);
      });
    });
  });

  grunt.registerMultiTask('restoreConfig', 'Changes the configuration to export dev config', function(){
    var
      done  = this.async()
    , path  = this.data.path
    , from  = this.data.from
    , to    = this.data.to
    ;

    fs.readFile(path, 'utf-8', function(error, data){
      if (error) return console.log(error), done(false);

      data = data.replace("return config." + from, "return config." + to);

      fs.writeFile(path, data, function(error){
        if (error) return console.log(error), done(false);

        done(true);
      });
    });
  });

  grunt.registerTask('fixChosen', 'Fixes chosen in the require.config.js', function(){
    var
      done      = this.async()
    , jamConfig = require('./jam/require.config.js')
    , packages  = jamConfig.packages
    , chosen    = false
    ;

    // Find the chosen package
    for (var i = packages.length - 1; i >= 0; i--){
      if (packages[i].name === "chosen"){
        chosen = packages[i];
        break;
      }
    }

    // We're not even using chosen!
    if (!chosen) return done(true);

    // Don't worry about it if we already have the property
    if (chosen.main) return done(true);

    fs.readFile('./jam/require.config.js', 'utf-8', function(error, data){
      if (error) return console.log(error), done(false);

      var
        find = /\"location\": \"jam\/chosen\"/g
      , replace = '"location": "jam/chosen",\n            "main": "chosen/chosen.jquery.js"'
      ;

      data = data.replace(find, replace);

      fs.writeFile('./jam/require.config.js', data, function(error){
        if (error) return console.log(error), done(false);

        fs.readFile('./jam/require.js', 'utf-8', function(error, data){
          if (error) return console.log(error), done(false);

          data = data.replace(find, replace);

          fs.writeFile('./jam/require.js', data, function(error){
            if (error) return console.log(error), done(false);

            return done(true);
          });
        });
      });
    });
  });
};
