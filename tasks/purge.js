const gulp = require('gulp');
const exec = require('gulp-exec');
const notify = require("gulp-notify");
const moodlepath = '/var/www/html/m35frontpage/';

gulp.task('purgeall', function() {
    return gulp.src(moodlepath + 'admin/cli')
    .pipe(exec('php ' + moodlepath + 'admin/cli/purge_caches.php'))
    .pipe(notify('Purged all caches.'))
});