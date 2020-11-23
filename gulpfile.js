const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

function css(){
    return gulp
    .src('./scss/app.scss')
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 2 versions'],
        cascade: false
    }))
    .pipe(sass({
        outputStyle: 'expanded',
    }))
    .pipe(gulp.dest('./public/css'))
}

function watchFiles(){
    gulp.watch('scss/*.scss', css);
}

//REGISTRAR TAREAS EN GULP

gulp.task('css', css);
gulp.task('watch', watchFiles);