var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var apis = ['classic', 'web-bluetooth'];
var adapters = ['noble', 'evothings'];

gulp.task('lint', function() {
    return gulp.src(['dist/*.js', '!dist/*.min.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

function minify(api, adapter) {
    return gulp.src([
            'dist/bluetooth.helpers.js',
            'dist/api.' + api + '.js',
            'dist/adapter.' + adapter + '.js'
        ])
        .pipe(uglify({
            output: {
                comments: /@license/
            }
        }))
        .pipe(concat(api + '.' + adapter + '.min.js'))
        .pipe(gulp.dest('dist'));
}

gulp.task('release', gulp.parallel(
    apis.map(api => gulp.parallel(
        adapters.map(adapter => () =>
            minify(api, adapter)))
        )
    )
);
gulp.task('default', gulp.series(['lint', 'release']));
