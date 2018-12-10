const gulp = require('gulp');
const minify = require('gulp-minify');

gulp.task('compress', function() {
  gulp.src('amd/src/*.js')
    .pipe(minify({
        ext:{
            min:'.js'
        },
        noSource: true,
        ignoreFiles: ['*/formbuilder.js', '*/formviewer.js']
    }))
    .pipe(gulp.dest('amd/build'))
});
gulp.task('watch', function() {
    gulp.watch('amd/src/*.js', ['compress']);
});
gulp.task('default', ['watch', 'compress']);
