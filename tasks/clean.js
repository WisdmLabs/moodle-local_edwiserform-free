const gulp = require('gulp');
const del = require('del');

const files = [
	'amd/build/*',
	'events/**/amd/build/*',
	'./style.css',
	'./style/*'
];

gulp.task('clean', function() {
	return del(files);
});