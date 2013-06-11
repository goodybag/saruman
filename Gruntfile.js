var
  fs            = require('fs')
, sys           = require('sys')
, childProcess  = require('child_process')
, jsdom         = require('jsdom')
, wrench        = require('wrench')
;

/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-s3');
  // grunt.loadNpmTasks('grunt-jam');
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
      , subs: ['css']
      }
    },

    cssmin: {
      minfiy: {
        src: [
          'css/bootstrap.css',
          'css/bootstrap-responsive.css',
          'css/font-awesome.css',
          'css/select2.css',
          'css/app.css'
        ]
      , dest: 'build/css/app.css'
      }
    },

    jam: {
      dist: {
        src: [
          'app.js'
        , 'lib/'
        , 'lib/api/'
        , 'views/'
        , 'models/'
        ]
      , dest: 'build/app.js'
      , noMinify: false
      , noLicense: true
      , verbose: true
      , almond: false
      }
    },

    s3: {
      options: {
        key:    'AKIAI5ASK2M6JIZDPIYA',
        secret: '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',
        access: 'public-read'
      },
      staging: {
        bucket: 'merlin.staging.goodybag.com',

        upload: [
          {
            src: 'build/index.html'
          , dest: 'index.html'
          , gzip: true
          }
        , {
            src: 'build/css/*'
          , dest: 'css/'
          , gzip: false
          }
        , {
            src: 'build/app.js'
          , dest: 'app.js'
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
        ]
      }
    },

    copyStuff: {
      build: {
        stuff: [
          './img'
        , './font'
        , './css'
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
  grunt.registerTask('default', [
    'makeBuildDir'
  , 'copyIndex'
  , 'changeConfig'
  , 'copyStuff'
  , 'cssmin'
  , 'jam'
  , 'restoreConfig'
  ]);

  grunt.registerTask('deploy', ['default', 's3']);

  grunt.registerTask('changeMenuCategoriesUrl', 'Changes the menu categories api url', function(){
    var file = fs.readFileSync('./build/menu-categories/index.html', 'utf-8');
    file = file.replace(/http:\/\/localhost:3000/g, "http://magic.goodybag.com");
    fs.writeFileSync('./build/menu-categories/index.html', file);
    return true;
  });

  grunt.registerMultiTask('jam', 'Builds jam stuff', function(){
    var
      done    = this.async()
    , command = "jam compile"
    , dest    = this.data.dest
    , incs    = this.data.src
    , jam     = require(process.cwd() + '/jam/require.config.js')
    ;

    for (var i = incs.length - 1; i >= 0; i--){
      // Is directory
      if (incs[i][incs[i].length -1] === "/"){
        var files = fs.readdirSync(incs[i]);
        for (var n = files.length - 1; n >= 0; n--){
          if (files[n].indexOf('.js') > -1)
            command += " -i " + incs[i] + files[n].replace(".js", "");
        }
      }else{
        command += " -i " + incs[i].replace(".js", "");
      }
    }

    for (var i = jam.packages.length - 1; i >= 0; i--){
      command += " -i " + jam.packages[i].name
    }

    command += " -o " + dest;

    if (this.data.noLicense) command += " --no-license";
    if (this.data.noMinify) command += " --no-minify";
    if (this.data.verbose) command += " -v";
    if (this.data.almond) command += " -a";

    if (this.data.verbose) console.log(command);

    childProcess.exec('jam remove bootstrap', function(error, stdout){
      if (error) return console.log(error), done(false);
      childProcess.exec(command, function(error, stdout){
        if (error) return console.log(error), done(false);
        sys.puts(stdout)
        done(true);
      });
    });

  });

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

    for (var i = stuff.length - 1, stats; i >= 0; i--){
      stats = fs.lstatSync(stuff[i]);
      if (stats.isDirectory)
        wrench.copyDirSyncRecursive(stuff[i], dest + '/' + getFileName(stuff[i]));
      else
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
