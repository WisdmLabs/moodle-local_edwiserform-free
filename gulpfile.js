const gulp = require('gulp');
const minify = require('gulp-minify');
const exec  = require('gulp-exec');
const notify = require('gulp-notify');
const sass = require('gulp-sass');

gulp.task('purge', function(done) {
    gulp.src('/var/www/html/m35/admin/cli')
    .pipe(exec('php /var/www/html/m35/admin/cli/purge_caches.php'))
    .pipe(notify('Cache Purged'));
    done();
});

gulp.task('compress', function(done) {
  gulp.src('amd/src/*.js')
    .pipe(minify({
        ext:{
            min:'.js'
        },
        noSource: true,
        ignoreFiles: ['*/formbuilder.js', '*/formviewer.js']
    }))
    .pipe(gulp.dest('amd/build'));
    notify('JS Compressed.');
    done();
});

gulp.task('commonstyles', function(done) {
    gulp.src('assets/scss/common/styles.scss')
    .pipe(sass({
        outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('.'))
    .pipe(notify('Common Styles generated.'));
    done();
});

gulp.task('separatestyles', function(done) {
    gulp.src('assets/scss/*.scss')
    .pipe(sass({
        outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./style'))
    .pipe(notify('Separate Styles geneated.'));
    done();
});

gulp.task('watch', function(done) {
    gulp.watch('amd/src/*.js', gulp.series('compress', 'purge'));
    gulp.watch('amd/build/form*.js', gulp.series('purge'));
    gulp.watch('assets/scss/common/*.scss', gulp.series('commonstyles', 'purge'));
    gulp.watch('assets/scss/*.scss', gulp.series('separatestyles'));
    gulp.watch('lang/*', gulp.series('purge'));
    done();
});

gulp.task('default', gulp.series('compress', 'commonstyles', 'separatestyles', 'watch', 'purge'));
