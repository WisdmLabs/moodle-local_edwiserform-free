const gulp = require('gulp');
const notify = require("gulp-notify");

gulp.task('watchcss', function(done) {
    gulp.watch([
        'assets/scss/common/*.scss',
        'formviewerjs/src/sass/**/*.scss'
    ], gulp.series('commoncss', 'purgeall'));
    gulp.watch([
        'assets/scss/**/*.scss',
        'formbuilderjs/src/sass/**/*.scss'
    ], gulp.series('separatecss'));
    notify({message: 'Watching css files'});
    done();
});

gulp.task('watchjs', function(done) {
    gulp.watch('amd/src/*.js', gulp.series('script', 'purgejs'));
    gulp.watch('amd/build/form*.js', gulp.series('purgejs'));
    notify({message: 'Watching js files'});
    done();
});

gulp.task('watcheventsscript', function(done) {
    gulp.watch('./events/**/amd/src/*.js', gulp.series('eventsscript', 'purgejs'));
    done();
});

gulp.task('watchlang', function(done) {
    gulp.watch('lang/**/*', gulp.series('purgelang'));
    notify({message: 'Watching language files'});
    done();
});

gulp.task('watch', gulp.series('watchjs', 'watchcss', 'watcheventsscript', 'watchlang'));
