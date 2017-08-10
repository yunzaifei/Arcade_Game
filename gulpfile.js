var gulp = require('gulp');
var connect = require('gulp-connect');
var config = require('./config');
var opn = require('opn');

gulp.task('build', function() {
    gulp.src('src/*.html').pipe(gulp.dest('dist/'));
    gulp.src('src/css/*').pipe(gulp.dest('dist/css/'));
    gulp.src('src/images/*').pipe(gulp.dest('dist/images/'));
    gulp.src('src/js/*').pipe(gulp.dest('dist/js/'));
})

gulp.task('watch', function(){
    gulp.watch(['src/**'], ['reload']);
})

gulp.task('reload', ['build'], function(){
  console.log('----------------reload server %s---------------------', new Date());
  gulp.src('dist/**').pipe(connect.reload());
})

gulp.task('server', ['build', 'watch'], function() {
    var port = process.env.port || config.port;
    var uri = 'http://localhost:' + port;
    connect.server({
        root: 'dist',
        port: port,
        livereload: true
    });
    opn(uri, { app: 'chrome' });
})