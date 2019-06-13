const gulp = require('gulp');
const minify = require('gulp-minify');
const exec = require('gulp-exec');
const notify = require("gulp-notify");
const sass = require("gulp-sass");
const babel = require('gulp-babel');
const clean = require("gulp-clean");
const replace = require("gulp-batch-replace");
const concat = require("gulp-concat");

const moodlepath = '/var/www/html/m37dev1/';

gulp.task('purgeall', function() {
    return gulp.src(moodlepath + 'admin/cli')
    .pipe(exec('php ' + moodlepath + 'admin/cli/purge_caches.php'))
    .pipe(notify('Purged all'))
});

gulp.task('purgejs', function() {
    return gulp.src(moodlepath + 'admin/cli')
    .pipe(exec('php ' + moodlepath + 'admin/cli/purge_caches.php --js=true'))
    .pipe(notify('Purged js'))
});

gulp.task('purgelang', function() {
    return gulp.src(moodlepath + 'admin/cli')
    .pipe(exec('php ' + moodlepath + 'admin/cli/purge_caches.php --lang=true'))
    .pipe(notify('Purged Lang'))
});

gulp.task('compress', function() {
    return gulp.src('amd/src/*.js')
    .pipe(babel({ presets: [["@babel/preset-env"]] }))
    .pipe(minify({
        ext:{
            min:'.js'
        },
        noSource: true,
        ignoreFiles: ['*/formbuilder.js', '*/formviewer.js']
    }))
    .pipe(gulp.dest('amd/build'))
    .pipe(notify({message: 'Compressed', onLast: true}));
});

gulp.task('commonstyles', function() {
    return gulp.src('assets/scss/common/styles.scss')
    .pipe(sass({
        outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('separatestyles', function() {
    return gulp.src('assets/scss/*.scss')
    .pipe(sass({
        outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./style'));
});

gulp.task('watch', gulp.series('purgeall', function(done) {
    gulp.watch('amd/src/*.js', gulp.series('compress', 'purgejs'));
    gulp.watch('amd/build/form*.js', gulp.series('purgejs'));
    gulp.watch('assets/scss/common/*.scss', gulp.series('commonstyles', 'purgeall'));
    gulp.watch('assets/scss/**/*.scss', gulp.series('separatestyles'));
    gulp.watch('lang/**/*', gulp.series('purgelang'));
    done();
}));


gulp.task('copydatatablescss', function() {
    return gulp.src([
        'node_modules/datatables.net-bs4/css/dataTables.bootstrap4.css',
        'node_modules/datatables.net-buttons-bs4/css/buttons.bootstrap4.css',
        'node_modules/datatables.net-fixedcolumns-bs4/css/fixedColumns.bootstrap4.css'
    ])
    .pipe(concat('datatables.scss'))
    .pipe(gulp.dest('assets/scss'));
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
gulp.task('copydatatables', gulp.series('cleandatatablesjs', 'copydatatablesjs', 'copydatatablescss'));
gulp.task('default', gulp.series('compress', 'commonstyles', 'separatestyles', 'purgeall', 'watch'));
