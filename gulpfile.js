var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglifyjs');

gulp.task('lint', function() {
    return gulp.src(['dist/*.js', '!dist/*.min.js', '!dist/bleat.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('release', function() {
    return gulp.src(['dist/bleat.core.js', 'dist/bleat.*.js', '!dist/*.min.js'])
        .pipe(concat('bleat.js'))
        .pipe(gulp.dest('dist'))
        .pipe(uglify('bleat.min.js', {
            output: {
                comments: /@license/
            }
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['lint', 'release']);