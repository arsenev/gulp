"use strict"

// SITE
const site = 'site.com';

// PATHS
const paths = {
	cssSrc:[
		'less/client/main.less',
		'less/client/*.less', 

		// plugins
		'css/client/dialog.stat/dialog.stat.less',
		'css/client/lightbox/lightbox.css',
		'css/client/formstyler/jquery.formstyler.css',
		'css/client/carusel/owl.carousel.css'
	],
	cssDest: 'css/client',

	jsSrc:[
		'js/client/jquery/jquery.1.9.1.js',
		
		// ?? потом
		// 'js/client/react/react.js',
		// 'js/client/react/react-dom.js',
		
		'js/client/dialog.stat/dialog.stat.js',
		'js/client/lightbox/lightbox.min.js',
		'js/client/jquery.mask/jquery.mask.js',
		'js/client/formstyler/jquery.formstyler.js',
		'js/client/carusel/owl.carousel.js',
		'js/client/aspectratio/aspectratio.js',
		'js/client/novaposhta/novaposhta.js',
		'js/client/fn/functions.js'
	],
	jsDest: 'js/client',


	// includes js
	jsPagesSrc:[
		'application/views/client/js/*.js',
		'!application/views/client/js/__*.js'
	],
	jsPagesDest: 'js/client',


	// react js
	reactjsSrc:[
		'application/views/client/react/*.jsx'
	],
	reactjsDest:'js/client',

	htmlSrc: 'application/views/**/*.php'
};


// GULP + PLUGINS
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const debug = require('gulp-debug');
const sourcemaps = require('gulp-sourcemaps'); // ??
const less = require('gulp-less');
const gcmq = require('gulp-group-css-media-queries');
const concat = require('gulp-concat');
const insert = require('gulp-insert');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');
const cached = require('gulp-cached');
const remember = require('gulp-remember');
const newer = require('gulp-newer'); // (filter) проверяет есть ли, и изменен ли файл в (gulp.dest)
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const path = require('path');



// BROWSER SYNC
const browserSync = require('browser-sync').create();

// NOTIFY
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');


// cmd: set
// cmd: set NOD_ENV=production
// const isDevelopment = !process.env.NOD_ENV || process.env.NOD_ENV == 'development';
const isDevelopment = false;


/* CSS */
gulp.task('css:common', function () {
    return gulp.src(paths.cssSrc, {since: gulp.lastRun('css:common')})

    	// errors
		.pipe(plumber({
			errorHandler: notify.onError(function(err){
				return {
					title:'Ошибка CSS/LESS',
					message:err.message
				}
			})
		}))
		
		// less
		.pipe(less()) 
		// .pipe(debug({title:'less()'}))


		// autoprefixer
		.pipe(autoprefixer({browsers: ['last 2 versions']}))
		// .pipe(autoprefixer({browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']}))
		//
		// .pipe(debug({title:'autoprefixer()'}))


		// remember
		.pipe(remember('css')) // (css) - имя кэша

		// concat
		.pipe(concat('common.css'))
		// .pipe(debug({title:'concat()'}))
		
		// group media query
		.pipe(gcmq())
		// .pipe(debug({title:'gcmq()'}))
		
		// output common.css
		.pipe(gulp.dest(paths.cssDest))
		// .pipe(browserSync.stream())
		
		// cssmin
		.pipe(cssmin())
		// .pipe(debug({title:'cssmin()'}))
		
		// rename common.min.css
		.pipe(rename({basename:'common', suffix: '.min'}))
		// .pipe(debug({title:'rename()'}))
		
		// output common.min.css
		.pipe(gulp.dest(paths.cssDest))
		.pipe(browserSync.stream());
});


/* JS */
gulp.task('js:common', function(callback) {
	return gulp.src(paths.jsSrc, {since: gulp.lastRun('js:common')})

		// errors
		.pipe(plumber({
			errorHandler: notify.onError(function(err){
				return {
					title:'Ошибка JS',
					message:err.message
				}
			})
		}))

		// babel jsx
		.pipe(babel({
			presets: [['es2015', {modules: false}]] // {modules: false} disable "use strict"
		}))

		// not minimize functions.js
		.pipe(gulpIf(function(file){
			return true;
			//return file.basename != 'functions.js';
		}, uglify()))

		// insert file name
		// .pipe(insert.transform(function(contents, file) {
		//     return '//	' + file.basename + '\n' + contents;
		// }))

		// remember
		.pipe(remember('js')) // (js) - имя кэша

		// concat
		.pipe(concat('common.js'))

		// output
		.pipe(gulp.dest(paths.jsDest))
		.pipe(browserSync.stream());
});

/* JS includes on pages */
gulp.task('jsPages', function(callback) {
	return gulp.src(paths.jsPagesSrc, {since: gulp.lastRun('jsPages')})

		// errors
		.pipe(plumber({
			errorHandler: notify.onError(function(err){
				return {
					title:'Ошибка JS',
					message:err.message
				}
			})
		}))

		// babel jsx
		.pipe(babel({
			presets: [['es2015', {modules: false}]] // {modules: false} disable "use strict"
		}))

		// minimize
		.pipe( uglify())

		// remember
		.pipe(remember('jsPages')) // (jsPages) - имя кэша

		// output
		.pipe(gulp.dest(paths.jsPagesDest))
		.pipe(browserSync.stream());
});

/* REACTJS */
gulp.task('reactjs:common', function(cb) {
	return gulp.src(paths.reactjsSrc, {since: gulp.lastRun('reactjs:common')})

		// errors
		.pipe(plumber({
			errorHandler: notify.onError(function(err){
				return {
					title:'Ошибка JS/JSX',
					message:err.message
				}
			})
		}))

		// JSX
		.pipe(babel({
			presets: ['es2015'],
            plugins: ['transform-react-jsx']
        }))


		// compress
		.pipe(uglify())

		// file name
		.pipe(insert.transform(function(contents, file) {
		    return '//	' + file.basename + '\n' + contents;
		}))

		// remember
		.pipe(remember('reactjs')) // (js) - имя кэша

		// concat
		.pipe(concat('react.common.js'))

		// output
		.pipe(gulp.dest(paths.reactjsDest))
		.pipe(browserSync.stream());
});


// SERVER
gulp.task('server', function(){
	browserSync.init({
		// server: {
		// 	baseDir: "./dist"
		// },
		proxy:site
	});

	// css
	gulp.watch(paths.cssSrc, gulp.series('css:common')).on('unlink', function(filepath){
		remember.forget('css', path.resolve(filepath.replace(/(.*)(\..*)$/, '$1.css')));	
	});

	// js
	gulp.watch(paths.jsSrc,  gulp.series('js:common')).on('unlink', function(filepath){
		remember.forget('js', path.resolve(filepath.replace(/(.*)(\..*)$/, '$1.js')));	
	});

	// js includes on pages
	gulp.watch(paths.jsPagesSrc,  gulp.series('jsPages')).on('unlink', function(filepath){
		remember.forget('jsPages', path.resolve(filepath.replace(/(.*)(\..*)$/, '$1.js')));	
	});

	// reactjs
	// gulp.watch(paths.reactjsSrc,  gulp.series('reactjs:common')).on('unlink', function(filepath){
	// 	remember.forget('reactjs', path.resolve(filepath.replace(/(.*)(\..*)$/, '$1.js')));	
	// });

	// html
	gulp.watch(paths.htmlSrc).on('change', browserSync.reload);
});


// START GULP
gulp.task(
	'default', 
	gulp.series('css:common', 'js:common', 'jsPages', 'server')
	// gulp.series('css:common', 'js:common', 'jsPages', 'reactjs:common', 'server')
);