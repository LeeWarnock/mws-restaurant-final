var gulp = require("gulp");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var minify = require("gulp-minify-css");

gulp.task("js", function() {
  gulp
    .src("js/*.js")
    .pipe(concat("script.js"))
    .pipe(uglify())
    .pipe(gulp.dest("build/scripts/"));
});

gulp.task("css", function() {
  gulp
    .src("css/*.css")
    .pipe(concat("styles.css"))
    .pipe(minify())
    .pipe(gulp.dest("build/styles/"));
});

gulp.task("default", ["js", "css"], function() {});
