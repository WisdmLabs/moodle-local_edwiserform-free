const gulp = require('gulp');
const exec = require('gulp-exec');
const notify = require("gulp-notify");
const moodlepath = '../../';

gulp.task('purgeall', function(done) {
    gulp.src(moodlepath + 'admin/cli')
    .pipe(exec('php ' + moodlepath + 'admin/cli/purge_caches.php'))
    .pipe(notify('Purged all caches.'));
    done();
});

gulp.task('purgejs', function(done) {
    gulp.src(moodlepath + 'admin/cli')
    .pipe(exec('php ' + moodlepath + 'admin/cli/purge_caches.php --js=true'))
    .pipe(notify('Purged js cache.'));
    done();
});

gulp.task('purgelang', function(done) {
    gulp.src(moodlepath + 'admin/cli')
    .pipe(exec('php ' + moodlepath + 'admin/cli/purge_caches.php --lang=true'))
    .pipe(notify('Purged language files.'));
    done();
});
