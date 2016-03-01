var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');
var del = require('del');
var concat = require('gulp-concat-util');
var order = require('gulp-order');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var jade = require('gulp-jade');
var ngtemplate = require('gulp-ngtemplate');
var htmlmin = require('gulp-htmlmin');

gulp.task('clean:dist', function(cb) {
  return del(['dist/*'], cb);
});

gulp.task('compile:jade', ['clean:dist'], function() {
  return gulp.src(['./src/*.jade']).pipe(jade({
    pretty: true
  })).pipe(rename({
    prefix: 'scDateTime-',
    extname: '.tpl'
  })).pipe(gulp.dest('dist')).pipe(htmlmin({
    collapseWhitespace: true
  })).pipe(ngtemplate({
    module: 'scDateTime'
  })).pipe(rename({
    extname: '.tpl.temp'
  })).pipe(gulp.dest('dist'));
});

gulp.task('compile:copy', ['compile:jade'], function() {
  return gulp.src(['./src/main.js'])
    .pipe(rename('sc-date-time.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('compile:javascript', ['compile:copy'], function() {
  var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  return gulp.src(['./dist/sc-date-time.js', './dist/*.tpl.temp'])
    .pipe(order(['dist/sc-date-time.js', 'dist/*.tpl.temp']))
    .pipe(concat('sc-date-time.js'))
    .pipe(concat.header('/*\n  @license sc-date-time\n @author SimeonC\n @license 2015 MIT\n @version ' + pkg.version + '\n  \n  See README.md for requirements and use.\n*/'))
    .pipe(gulp.dest('dist'));
});

gulp.task('compile:less', ['clean:dist'], function() {
  var pkg;
  pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  return gulp.src(['./src/styles.less'])
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(concat())
    .pipe(concat.header('/*\n  @license sc-date-time\n @author SimeonC\n @license 2015 MIT\n @version ' + pkg.version + '\n  \n  See README.md for requirements and use.\n*/'))
    .pipe(rename('sc-date-time.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('compile:main', ['compile:javascript', 'compile:less']);

gulp.task('compile', ['compile:main'], function(cb) {
  return del(['dist/*.temp'], cb);
});

gulp.task('default', ['compile']);
