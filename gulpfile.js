var gulp = require('gulp'),
    less = require('gulp-less'),
    watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish');

var options = {
    out: "./out/",
    src: "./src/",
    jshint:  {
      browser: true,
      curly: true,
      eqeqeq: true,
      immed: false,
      latedef: true,
      newcap: true,
      noarg: true,
      undef: true,
      devel: true,
      jquery: true,
      strict: true,
      predef: ["Bacon", "_", 'App']
    }
};

gulp.task('connect', connect.server({
  root: __dirname + '/' + options.out,
  port: 1337,
  livereload: true,
  //open: {
  //  browser: 'chrome' // if not working OS X browser: 'Google Chrome'
  //}
}));

gulp.task('lint', function() {
  gulp.src(options.src + 'js/**/*.js')
  .pipe(jshint(options.jshint))
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'))
});

gulp.task('html', function () {
  gulp.src(options.src + '*.html')
    .pipe(gulp.dest(options.out))
    .pipe(connect.reload());
});

gulp.task('js', function () {
  gulp.src(options.src + 'js/**/*.js')
    .pipe(gulp.dest(options.out + "js"))
    .pipe(connect.reload());
});

gulp.task('vendor', function () {
  gulp.src('./bower_components/**')
    .pipe(gulp.dest(options.out + 'vendor'));
});

gulp.task('less', function() {
  gulp.src(options.src + 'less/*.less')
    .pipe(less())
    .pipe(gulp.dest(options.out + 'css'))
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch([options.src + '*.html'], ['html']);
  gulp.watch([options.src + 'less/*.less'], ['less']);
  gulp.watch([options.src + 'js/**/*.js'], ['lint', 'js']);
});

gulp.task('default', ['connect', 'vendor', 'lint', 'js', 'less', 'html', 'watch']);