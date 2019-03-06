const gulp = require('gulp');
const minify = require('gulp-minify');
const shell  = require('gulp-shell');

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
gulp.task('purge', shell.task('php /var/www/html/m35/admin/cli/purge_caches.php'));
gulp.task('watch', function() {
    gulp.watch('amd/src/*.js', ['compress', 'purge']);
    gulp.watch('style/*.css', ['purge']);
    gulp.watch('lang/*', ['purge']);
});
gulp.task('default', ['watch', 'compress', 'purge']);
