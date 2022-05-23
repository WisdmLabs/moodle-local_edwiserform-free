const gulp = require('gulp');
const sass = require("gulp-sass");
const notify = require("gulp-notify");
const concat = require("gulp-concat");

const PRODUCTION = process.argv.includes('-production');

var sassOptions = {
    outputStyle: PRODUCTION == true ? 'compressed' : false
};

gulp.task('commoncss', function() {
    return gulp.src(['assets/scss/common/styles.scss'])
        .pipe(sass(sassOptions))
        .pipe(gulp.dest('.'));
});

gulp.task('separatecss', function(done) {
    gulp.src([
            'assets/scss/common/*.scss',
            'assets/scss/*.scss'
        ])
        .pipe(sass(sassOptions))
        .pipe(gulp.dest('./style'))
        .pipe(notify({ message: 'Common styles completed.', onLast: true }));
    done();
});

gulp.task('copydatatablescss', function() {
    return gulp.src([
            'node_modules/datatables.net-bs4/css/dataTables.bootstrap4.css',
            'node_modules/datatables.net-buttons-bs4/css/buttons.bootstrap4.css',
            'node_modules/datatables.net-fixedcolumns-bs4/css/fixedColumns.bootstrap4.css'
        ])
        .pipe(concat('datatables.scss'))
        .pipe(gulp.dest('assets/scss'));
});