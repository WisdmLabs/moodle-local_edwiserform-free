require('./tasks/purge.js');
require('./tasks/style.js');
require('./tasks/script.js');
require('./tasks/watch.js');

const gulp = require('gulp');

gulp.task('copydatatables', gulp.series(
    'cleandatatablesjs',
    'copydatatablesjs',
    'copydatatablescss'
));

gulp.task('default', gulp.series(
    'script',
    'commoncss',
    'separatecss',
    'watch',
    'purgeall'
));
