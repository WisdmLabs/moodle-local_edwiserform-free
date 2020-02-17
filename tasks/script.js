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
        min: '.js',
        ignoreFiles: ['*/formbuilder.js', '*/formviewer.js']
    }
};
minifyOptions.mangle = PRODUCTION;
minifyOptions.compress = PRODUCTION;
minifyOptions.noSource = PRODUCTION;
if (PRODUCTION == false) {
    minifyOptions.preserveComments = 'all';
}
gulp.task('script', function() {
    return gulp.src('amd/src/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: [["@babel/preset-env"]]
    }))
    .pipe(minify(minifyOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('amd/build'));
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
