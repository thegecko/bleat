var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglifyjs');

gulp.task('lint', function() {
    return gulp.src(['dist/*.js', '!dist/*.min.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
    return gulp.src(['dist/bleat.js', 'dist/bleat.*.js', '!dist/*.min.js'])
        .pipe(uglify('bleat.min.js', {
            output: {
                comments: /@license/
            }
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['lint', 'uglify']);