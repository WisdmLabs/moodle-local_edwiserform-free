const gulp = require('gulp');
const minify = require('gulp-minify');
const replace = require('gulp-replace');

gulp.task('compress', function() {
  gulp.src('amd/src/*.js')
    .pipe(minify({
        ext:{
            min:'.js'
        },
        noSource: true,
        ignoreFiles: ['*/formbuilder.js', '*/formviewer.js']
    }))
    .pipe(replace('require','define'))
    .pipe(gulp.dest('amd/build'))
});
