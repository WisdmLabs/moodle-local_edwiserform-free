const gulp = require('gulp');
const minify = require('gulp-minify');
const babel = require('gulp-babel');
const clean = require("gulp-clean");
const replace = require("gulp-batch-replace");
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');

const PRODUCTION = process.argv.includes('-production');

var minifyOptions = {
    ext: {
        min: '.min.js'
    }
};
minifyOptions.mangle = PRODUCTION;
minifyOptions.compress = PRODUCTION;
minifyOptions.noSource = PRODUCTION;
if (PRODUCTION == false) {
    minifyOptions.preserveComments = 'all';
}
gulp.task('script', function() {
    var task = gulp.src('amd/src/*.js');
    if (PRODUCTION) {
        task = task.pipe(sourcemaps.init())
        .pipe(babel({
            presets: [["@babel/preset-env"]]
        }))
        .pipe(minify(minifyOptions))
        .pipe(sourcemaps.write('.'));
    }
    return task.pipe(gulp.dest('amd/build'));
});

// Minify events plugins scripts
gulp.task('eventsscript', function(done) {
    var task = gulp.src('*.js', { cwd : './events/**/amd/src/'});
    if (PRODUCTION) {
        task = task.pipe(sourcemaps.init())
        .pipe(babel({
            presets: [["@babel/preset-env"]]
        }))
        .pipe(minify(minifyOptions))
        .pipe(sourcemaps.write('.'));
    }
    return task.pipe(rename(function (path) {
        return {
            dirname: path.dirname + "/../build",
            basename: path.basename,
            extname: path.extname
        };
    }))
    .pipe(gulp.dest('./events/'));
});

gulp.task('cleandatatablesjs', function() {
    return gulp.src([
        'amd/*/*bootstrap4*',
        'amd/*/*data*ables*',
    ], {read: false})
    .pipe(clean());
});

gulp.task('copydatatablesjs', function() {
    return gulp.src([
        'node_modules/datatables.net-fixedcolumns-bs4/js/fixedColumns.bootstrap4.js',
        'node_modules/datatables.net-fixedcolumns/js/dataTables.fixedColumns.js',
        'node_modules/datatables.net-buttons-bs4/js/buttons.bootstrap4.js',
        'node_modules/datatables.net-buttons/js/dataTables.buttons.js',
        'node_modules/datatables.net-bs4/js/dataTables.bootstrap4.js',
        'node_modules/datatables.net/js/jquery.dataTables.js'
        ])
    .pipe(replace([
        ["'datatables.net-fixedcolumns'", "'local_edwiserform/dataTables.fixedColumns'"],
        ["'datatables.net-buttons'", "'local_edwiserform/dataTables.buttons'"],
        ["'datatables.net-bs4'", "'local_edwiserform/dataTables.bootstrap4'"],
        ["'datatables.net'", "'local_edwiserform/jquery.dataTables'"]
    ]))
    .pipe(gulp.dest('amd/src'));
});
