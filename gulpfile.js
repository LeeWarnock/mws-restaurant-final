var gulp = require("gulp");
var concat = require("gulp-concat");
var minify = require("gulp-minify");
var cleanCss = require("gulp-clean-css");

gulp.task("pack-js", function() {
  return gulp
    .src(["js/*.js"])
    .pipe(minify())
    .pipe(gulp.dest("build/js"));
});

gulp.task("pack-css", function() {
  return gulp
    .src(["css/*.css"])
    .pipe(concat("stylesheet.css"))
    .pipe(cleanCss())
    .pipe(gulp.dest("build/css"));
});

gulp.task("default", ["pack-js", "pack-css"]);
