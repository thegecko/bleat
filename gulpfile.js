var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglifyjs');

var apis = ['classic', 'web-bluetooth'];
var adapters = ['chromeos', 'evothings', 'noble'];

gulp.task('lint', function() {
    return gulp.src(['dist/*.js', '!dist/*.min.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('release', function() {
    apis.forEach(api => {
        adapters.forEach(adapter => {
            minify(api, adapter);
        });
    });
});

function minify(api, adapter) {
    return gulp.src([
            'dist/bluetooth.helpers.js',
            'dist/api.' + api + '.js',
            'dist/adapter.' + adapter + '.js'
        ])
        .pipe(uglify(api + '.' + adapter + '.min.js', {
            output: {
                comments: /@license/
            }
        }))
        .pipe(gulp.dest('dist'));
}

gulp.task('default', ['lint', 'release']);