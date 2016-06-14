'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var rename = require("gulp-rename");
var babelify = require('babelify');
var sass = require('gulp-sass');
var concatCss = require('gulp-concat-css');
var livereload = require('gulp-livereload');
var exec = require('child_process').exec;
var minifyCss = require('gulp-minify-css');
var htmlreplace = require('gulp-html-replace');
var autoprefixer = require('gulp-autoprefixer');

var express = require('express');
var fs = require('fs');
var open = require("open");
var path = require('path');

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

function buildWatchScript(file) {

  var props = {
    entries: [file],
    debug : true,
    transform: [reactify, babelify]
  };

  var bundler = watchify(browserify(props));

  function rebundle() {
    var stream = bundler.bundle();
    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(rename("bundle.js"))
      .pipe(gulp.dest('./build/'))
      .pipe(livereload());
  }

  bundler.on('update', function() {
    rebundle();
    gutil.log('Rebundle...');
  });

  return rebundle();
}

gulp.task('copy', function(){
  gulp.src('index.html')
  .pipe(gulp.dest('./build/'));
});

gulp.task('sass', function() {
  return gulp.src('css/scss/*.scss')
      .pipe(sass())
      .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
      .pipe(concatCss('style.css'))
      .pipe(gulp.dest('./build/'))
      .pipe(livereload());
});

gulp.task('watch', function() {
  livereload.listen(); //Make sure to install live reload chrome extension
  gulp.watch('css/scss/*.scss', ['sass']);
  return buildWatchScript('js/app.js');
});

gulp.task('server', ['sass', 'watch', 'copy'], function (cb) {
  var app = express();
  app.set('port', (process.env.PORT || 3000));
  app.use(express.static('./build/'));

  const serverPath = 'http://localhost:' + app.get('port') + '/';

  app.listen(app.get('port'), function() {
    console.log('Server started: ' + serverPath);
  });

  open(serverPath);
});

gulp.task('default', ['server']);


//
//TASK FOR PROD
//

function buildProdScript(file) {

  var props = {
    entries: [file],
    debug : true,
    transform: [reactify, babelify]
  };

  var bundler = browserify(props);

  function rebundle() {
    var stream = bundler.bundle();
    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(streamify(uglify()))
      .pipe(rename("bundle.min.js"))
      .pipe(gulp.dest('./build/public/'));
  }

  return rebundle();
}

gulp.task('build', function() {
  return buildProdScript('js/app.js');
});

gulp.task('sass-build', function() {
  return gulp.src('css/scss/*.scss')
      .pipe(sass())
      .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
      .pipe(concatCss('style.min.css'))
      .pipe(minifyCss({compatibility: 'ie8'}))
      .pipe(gulp.dest('./build/public'))
      .pipe(livereload());
});

gulp.task('replaceHTML', function(){
  gulp.src('index.html')
    .pipe(htmlreplace({
      'css': 'style.min.css',
      'js': 'bundle.min.js'
    }))
    .pipe(gulp.dest('./build/public/'));
});

gulp.task('prod', ['build', 'sass-build', 'replaceHTML']);

gulp.task('clean', [], function() {
  exec('rm -rf build');
});
