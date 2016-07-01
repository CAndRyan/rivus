var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var istanbul = require('gulp-istanbul');

function testWithReporter(reporter, reporterOptions) {
  return gulp.src(['test/*.js'], {read: false})
    .pipe(mocha({
      ui: 'bdd',
      reporter: reporter,
      reporterOptions: reporterOptions
    }))
    .on('error', gutil.log);
}

gulp.task('default', ['lint', 'test'], function() {
});

gulp.task('pre-test-coverage', function () {
  return gulp.src(['services/**/*.js', 'providers/**/*.js', 'common/**/*.js', 'rivus.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('test-coverage', ['pre-test-coverage'], function () {
  return gulp.src(['test/*.js'])
    .pipe(mocha())
    .pipe(istanbul.writeReports({
      dir: process.env.CIRCLE_ARTIFACTS
    }))
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 70 } }));
});

gulp.task('test', function() {
  return testWithReporter('spec');
});

gulp.task('test-ci', function() {
  return testWithReporter('mocha-junit-reporter', {
    mochaFile: (process.env.CIRCLE_TEST_REPORTS || '.') + '/junit/test-results.xml'
  });
});

gulp.task('test-dot', function() {
  return testWithReporter('dot');
});

gulp.task('test-watch-runner', ['lint', 'test-dot'], function() {
});

gulp.task('test-watch', function() {
  gulp.watch(['test/**'], ['test-watch-runner']);
});

gulp.task('lint', function() {
  return gulp.src(['**/*.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
