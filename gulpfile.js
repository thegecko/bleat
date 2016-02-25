var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglifyjs');

gulp.task('lint', function() {
    return gulp.src(['dist/*.js', '!dist/*.min.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('release', function() {
    minify('classic');
    minify('web-bluetooth');
});

function minify(api) {
    return gulp.src(['dist/bluetooth.helpers.js', 'dist/api.' + api + '.js', 'dist/adapter.*.js'])
        .pipe(uglify('api.' + api + '.min.js', {
            output: {
                comments: /@license/
            }
        }))
        .pipe(gulp.dest('dist'));
}

gulp.task('default', ['lint', 'release']);