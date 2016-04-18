var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');

gulp.task('default', ['lint', 'test'], function() {
});

gulp.task('test', function() {
    return gulp.src(['test/*.js'], { read: false })
        .pipe(mocha({ reporter: 'spec' }))
        .on('error', gutil.log);
});

gulp.task('test-dot', function() {
    return gulp.src(['test/*.js'], { read: false })
        .pipe(mocha({ reporter: 'dot' }))
        .on('error', gutil.log);
});

gulp.task('test-watch-runner', ['lint', 'test-dot'], function() {
});

gulp.task('test-watch', function() {
    gulp.watch(['test/**'], ['test-watch-runner']);
});

gulp.task('lint', function () {
    return gulp.src(['**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
