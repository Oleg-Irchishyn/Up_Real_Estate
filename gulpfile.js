const gulp = require('gulp');
const browserSync = require("browser-sync");
const reload = browserSync.reload;
const webpackStream = require('webpack-stream');
const webpack = webpackStream.webpack;
const WebpackOnBuildPlugin = require('on-build-webpack');
const pathPlugin = require('path');
const named = require('vinyl-named');
const del = require('del');  // check if i need that
const pngquant = require('imagemin-pngquant');
const plugins = require('gulp-load-plugins')({ // this one requires all plugins with prefix 'gulp-'
  pattern: ['gulp-*', 'gulp.*', '!gulp-sass'],
  replaceString: /\bgulp[\-.]/
});
const sass = require('gulp-sass')(require('sass')); // gulp-sass 5+ needs a compiler injected manually; dart-sass is pure JS, no native build required
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const csso = require('postcss-csso');
const short = require('postcss-short');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const argv = require('yargs').argv;
// var isDevEnv = true;
var isDevEnv = (argv.prod === undefined) ? true : false;
// CONFIG     
const options = require('./gulp/config/options');
const config = options.config;
const BrowserSyncConfig = options.BrowserSyncConfig;
const webpackConfig = options.webpackConfig;
const webpackConfigProd = options.webpackConfigProd;
const htmlMinOptions = options.htmlMinOptions;
const buffer = require('vinyl-buffer');
const path = require('./gulp/path/path'); // Path options 
const data = require(path.src.data); // test
const player = require('play-sound')(opts = {})

const spritesmithConfig = {
  cssName: 'sprite.css',
  imgName: 'sprite.png', // image nam by default  'sprite.png'
  retinaImgName: 'sprite@2x.png', // image nam by default   'sprite@2x.png'
  imgPath: config.pngSprite, // path to image that should know css // '../img/sprite.png'
  retinaImgPath: config.pngSpriteRetina, // path to retina image that should know css // '../img/sprite@2x.png'
  retinaSrcFilter: 'src/img/sprite/*@2x.png', // retina images should be in same folder as non-retina 
};

gulp.task('webserver', function () { // Webserver start task 
  browserSync(BrowserSyncConfig);
  console.log('i love your mama')
});

// stuff for css compilation
var processors = [
  autoprefixer({
    browsers: ['last 4 versions'],
    cascade: false
  }),
  // require('lost'), need ?
  mqpacker({
    sort: sortMediaQueries
  }),
  csso,
  short,
];
function isMax(mq) {
  return /max-width/.test(mq);
}
function isMin(mq) {
  return /min-width/.test(mq);
}
function sortMediaQueries(a, b) {
  A = a.replace(/\D/g, '');
  B = b.replace(/\D/g, '');
  if (isMax(a) && isMax(b)) {
    return B - A;
  } else if (isMin(a) && isMin(b)) {
    return A - B;
  } else if (isMax(a) && isMin(b)) {
    return 1;
  } else if (isMin(a) && isMax(b)) {
    return -1;
  }
  return 1;
}
// stuff for css compilation END 
gulp.task('build:vendor-js', function () {
  let dest = 'dev/js/vendor/';
  return gulp.src('src/js/vendor/**/*.*')
    .pipe(plugins.if(config.checkChanged, plugins.changed(dest)))
    .pipe(plugins.if(config.showGulpDebug, plugins.debug('vendor js files added: ')))
    .pipe(gulp.dest(dest))
    .pipe(reload({ stream: true }));
});

gulp.task('build', [
  'html',
  'js',
  'sprite',
  'img',
  'style',
  'vendor',
  'fonts',
  'htaccess'
]);

// Watcher that will autoupdate development
let watchOptions = {
  style: true,
  js: false
};
gulp.task('watch', function () {
  if (isDevEnv == false) return false; // watch only dev
  // watch HTML to Build All
  plugins.watch('src/templates/*/*.html', function (event, cb) {
    gulp.start('html');
  });
  // watch HTML to Build 
  plugins.watch(path.src.html, function (event, cb) {
    gulp.start('html-partial');
  });
  // Watch HTML to livereload
  plugins.watch([path.dev.htmlWatch], function (event, cb) {
    gulp.src(path.dev.htmlWatch)
      .pipe(browserSync.stream());
  });
  if (watchOptions.style) { // Watch styles 
    // plugins.watch([path.src.style, 'src/style/*/*.scss'], function (event, cb) {
    plugins.watch('src/style/**/*.{scss,sass,css}', function (event, cb) {
      gulp.start('style');
    })
  }
  if (watchOptions.js) {// Watch js to concat and livereload
    plugins.watch(path.src.jsWatch, function (event, cb) {
      gulp.start('js');
    })
  }
  // Watch images
  plugins.watch(path.src.img, function (event, cb) {
    gulp.start('img');
  });
  //Watch sprites
  plugins.watch([path.src.sprite], function (event, cb) {
    gulp.start('sprite');
    gulp.start('style');
  });
  plugins.watch(path.src.vendor, function () {
    gulp.start('vendor');
  });
  plugins.watch('src/fonts/**/*.*', function () {
    gulp.start('fonts');
  });
  // plugins.watch('src/js/vendor/**/*.*', function () {
  //   gulp.start('vendor-js');
  // });
});

// NEW TASKS // test
gulp.task('htaccess', function () {
  let destination = function () {
    if (isDevEnv) return path.dev.root
    else return path.prod.root
  };
  gulp.src(path.src.htaccess)
    .pipe(plugins.if(config.showGulpDebug, plugins.debug({ title: 'htaccess rewriten : ' })))
    .pipe(gulp.dest(destination));
})

gulp.task('vendor', function () {
  let destination = function () {
    if (isDevEnv) return path.dev.vendor
    else return path.prod.vendor
  };
  return gulp.src(path.src.vendor)
    .pipe(plugins.if(config.checkChanged && isDevEnv, plugins.changed(destination)))
    .pipe(plugins.if(config.showGulpDebug, plugins.debug('vendor files added: ')))
    .pipe(gulp.dest(destination))
    .pipe(plugins.if(isDevEnv, reload({ stream: true })));
});

gulp.task('fonts', function () {
  let destination = function () {
    if (isDevEnv) return path.dev.fonts
    else return path.prod.fonts
  };
  if (isDevEnv == false) {
    del("web/fonts/*.*", { read: false }); // clear all old fonts 
  }
  return gulp.src(path.src.fonts)
    .pipe(plugins.if(config.checkChanged && isDevEnv, plugins.changed(destination)))
    .pipe(plugins.if(config.showGulpDebug, plugins.debug('fonts files added: ')))
    .pipe(gulp.dest(destination))
    .pipe(plugins.if(isDevEnv, browserSync.stream()));
})
// 
gulp.task('html', function () { // HTML src --> development
  let destination = function () {
    if (isDevEnv) return path.dev.root
    else return path.prod.root
  };

  // let chance = Math.round(Math.random() * 100); sound
  // console.log(chance);
  // if (chance > 80) {
  //   player.play("dauphin2.wav", function (err) { })
  // }

  gulp.src(path.src.html)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError(function (err) {
        return {
          title: 'Build html error',
          message: err.message
        }
      })
    }))
    .pipe(plugins.if(config.showSizes && !isDevEnv, plugins.size({ title: 'size before minify htm : ' })))
    .pipe(plugins.if(config.showGulpDebug, plugins.debug('changed html: ')))
    .pipe(plugins.if(config.nunjucksOn, plugins.nunjucks.compile(data), plugins.rigger()))
    .pipe(plugins.if(config.minifyHTML && !isDevEnv, plugins.htmlmin(htmlMinOptions)))
    .pipe(gulp.dest(destination))
    .pipe(plugins.if(config.showSizes && !isDevEnv, plugins.size({ title: 'size after minify htm : ' })))
    .pipe(plugins.if(isDevEnv, reload({ stream: true })));
});

gulp.task('html-partial', function () { // only on dev // watch for partials 
  let destination = path.dev.root;
  gulp.src(path.src.html)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError(function (err) {
        return {
          title: 'Build partials html error',
          message: err.message
        }
      })
    }))
    .pipe(plugins.changed(destination))
    .pipe(plugins.if(config.showGulpDebug, plugins.debug('changed html: ')))
    .pipe(plugins.if(config.nunjucksOn, plugins.nunjucks.compile(data), plugins.rigger()))
    .pipe(gulp.dest(destination))
    .pipe(reload({ stream: true }));
});


gulp.task('sprite', function () { // Build sprite image
  let destination = function () {
    if (isDevEnv) return path.dev.img
    else return path.prod.img
  };

  var spriteData = gulp.src('src/img/sprite/*.png')
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError(function (err) {
        return {
          title: 'Sprite prod error',
          message: err.message
        }
      })
    }))
    .pipe(plugins.spritesmith(spritesmithConfig));

  spriteData.img
    .pipe(plugins.if(isDevEnv == false, buffer()))
    .pipe(plugins.if(isDevEnv == false,
      plugins.imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant()],
        interlaced: true
      })))
    .pipe(gulp.dest(destination)) // path where save sprite image
    .pipe(plugins.if(config.checkChanged, plugins.debug({ "title": "Prod sptire images generated: " })));

  spriteData.css.pipe(gulp.dest(path.src.spriteCss)) // path where save sprite css
    .pipe(plugins.if(config.checkChanged, plugins.debug({ "title": "Prod sptire css generated: " })));
});

gulp.task('img', function () {
  let destination = function () {
    if (isDevEnv) return path.dev.img
    else return path.prod.img
  };
  return gulp.src(path.src.img)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError(function (err) {
        return {
          title: 'Image build error',
          message: err.message
        }
      })
    }))
    .pipe(plugins.if(config.checkChanged && isDevEnv, plugins.changed(destination)))
    .pipe(plugins.if(config.showSizes && !isDevEnv, plugins.size({ title: 'size before minify images : ' })))
    .pipe(plugins.if(config.showGulpDebug, plugins.debug({ title: 'images changed: ' })))
    .pipe(plugins.if(isDevEnv == false, plugins.imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()],
      interlaced: true
    })))
    .pipe(gulp.dest(destination))
    .pipe(plugins.if(config.showSizes && !isDevEnv, plugins.size({ title: 'size after minify images : ' })))
    .pipe(plugins.if(isDevEnv, browserSync.stream()));
});

gulp.task('style', function () {
  let destination = function () {
    if (isDevEnv) return path.dev.style
    else return path.prod.style
  };
  gulp.src(path.src.style)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError(function (err) {
        return {
          title: 'Build style error',
          message: err.message
        }
      })
    }))
    .pipe(plugins.if(config.cssSourcemap && isDevEnv, plugins.sourcemaps.init()))
    .pipe(plugins.if(
      isDevEnv,
      sass({
        outputStyle: 'nested', // nested, expanded, compact, compressed
        precision: 5
      }),
      sass({ outputStyle: 'compressed', precision: 5 })
    ))
    .pipe(plugins.postcss(processors))
    .pipe(plugins.if(config.cssSourcemap && isDevEnv, plugins.sourcemaps.write('./')))
    .pipe(plugins.if(config.showSizes && !isDevEnv, plugins.size({ title: 'size before minify css : ' })))
    .pipe(plugins.if(config.showGulpDebug, plugins.debug({ title: 'changed css : ' })))
    .pipe(plugins.if(config.minifyCSS && !isDevEnv, plugins.cleanCss({ compatibility: 'ie8' })))
    .pipe(gulp.dest(destination))
    .pipe(plugins.if(config.showSizes && !isDevEnv, plugins.size({ title: 'size after minify css : ' })))
    .pipe(plugins.if(isDevEnv, browserSync.stream()))
});

gulp.task('js', function () { // Minify all js files
  let destination = function () {
    if (isDevEnv) return path.dev.js
    else return path.prod.js
  };
  gulp.src(path.src.js)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError(function (err) {
        return {
          title: 'JS error',
          message: err.message
        }
      })
    }))
    .pipe(named())
    .pipe(plugins.if(
      isDevEnv,
      webpackStream(webpackConfig),
      webpackStream(webpackConfigProd)
    ))
    .pipe(plugins.if(config.showSizes && !isDevEnv, plugins.size({ title: 'size before minify js : ' })))
    .pipe(plugins.if(config.showGulpDebug, plugins.debug({ title: 'Changed js : ' })))
    .pipe(gulp.dest(destination))
    .pipe(plugins.if(config.showSizes && !isDevEnv, plugins.size({ title: 'size after minify js : ' })))
    .pipe(plugins.if(isDevEnv, browserSync.stream()))
});

gulp.task('setProd', function () {
  isDevEnv = false;
});

gulp.task('default', ['build', 'webserver', 'watch']);

gulp.task('prod', ['setProd', 'build',]);