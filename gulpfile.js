require('./tasks/clean.js');
require('./tasks/purge.js');
require('./tasks/script.js');
require('./tasks/style.js');
require('./tasks/watch.js');

const gulp = require('gulp');

gulp.task('copydatatables', gulp.series(
    'cleandatatablesjs',
    'copydatatablesjs',
    'copydatatablescss'
));

gulp.task('default', gulp.series(
    'clean',
    'script',
    'eventsscript',
    'commoncss',
    'separatecss',
    'watch',
    'purgeall'
));