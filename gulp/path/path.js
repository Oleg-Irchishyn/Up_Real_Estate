// let path = {
//   src: {
//     html: 'src/templates/*.html',
//     htmlWatch: 'src/templates/**/*.html',
//     style: 'src/style/*.{scss,sass}',
//     js: 'src/js/*.js',
//     jsWatch: 'src/js/**/*.js',
//     img: ['src/img/**/*.*', '!src/img/sprite/**/*.*'], // all images but not sprites
//     sprite: 'src/img/sprite/*.*',
//     spriteCss: 'src/style/sprite',
//     php: 'src/**/*.php',
//     fonts: "src/fonts/**/*.*",
//     data: "./src/data.json",
//     htaccess: 'src/**/.htaccess',
//     vendor: 'src/vendor/**/*.*',
//   },
//   dev: {
//     htmlDest: 'dev/',
//     html: 'dev/*.html',
//     styleDest: 'dev/style',
//     style: 'dev/style/*.css',
//     jsDest: 'dev/js',
//     js: 'dev/js/*.js',
//     imgDest: 'dev/img',
//     sprite: 'dev/img/sprite',
//     fonts: 'dev/fonts/',
//   },
//   prod: {
//     root: 'prod/',
//     style: 'prod/style',
//     img: 'prod/img',
//     js: 'prod/js',
//     fonts: 'prod/fonts',
//     vendor: 'prod/vendor',
//   }
// };

let path = {
  src: {
    html: 'src/templates/*.html',
    htmlWatch: 'src/templates/**/*.html',
    style: 'src/style/*.{scss,sass}',
    js: 'src/js/*.js',
    jsWatch: 'src/js/**/*.js',
    img: ['src/img/**/*.*', '!src/img/sprite/**/*.*'], // all images but not sprites
    sprite: 'src/img/sprite/*.*',
    spriteCss: 'src/style/sprite',
    php: 'src/**/*.php',
    fonts: "src/fonts/**/*.*",
    data: "./src/data.json",
    htaccess: 'src/**/.htaccess',
    vendor: 'src/vendor/**/*.*',
    data: './src/data.json'
  },
  dev: {
    root: 'dev/',
    style: 'dev/style',
    js: 'dev/js',
    img: 'dev/img',
    sprite: 'dev/img/sprite',
    vendor: 'dev/vendor',
    fonts: 'dev/fonts/',
    htmlWatch: 'dev/*.html',
  },
  prod: {
    root: 'web/',
    style: 'web/style',
    js: 'web/js',
    img: 'web/img',
    sprite: 'web/img/sprite',
    vendor: 'web/vendor',
    fonts: 'web/fonts',
  }
};

module.exports = path;