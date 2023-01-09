/* eslint-disable no-param-reassign */
import gulp from 'gulp';
import install from 'gulp-install';
import babel from 'gulp-babel';
import del from 'del';
import sourcemaps from 'gulp-sourcemaps';
import map from 'map-stream';
import { exec } from 'pkg';
import { spawn } from 'child_process';

gulp.task('link-frodo-lib', (cb) => {
  const cmd = spawn('npm', ['link', '../frodo-lib'], { stdio: 'inherit' });
  cmd.on('close', (code) => {
    console.log(`link-frodo-lib exited with code ${code}`);
    cb(code);
  });
});

gulp.task('clean-esm', () => del(['esm']));

gulp.task('transpile-esm', () =>
  gulp
    .src(['src/*.ts', 'src/**/*.ts'])
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(babel({ configFile: './babel.config.esm.json' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('esm'))
);

gulp.task('resources-esm', () =>
  gulp
    .src(['src/**/*.json', 'src/**/*.txt', 'src/**/*.xml'], { base: './src/' })
    .pipe(gulp.dest('esm'))
);

gulp.task('install', () =>
  gulp.src(['package.json'], { base: '.' }).pipe(install())
);

gulp.task('dist-clean', () => del(['dist/src']));

gulp.task('dist-package', () =>
  gulp
    .src('package.json')
    .pipe(
      map((file, done) => {
        const json = JSON.parse(file.contents.toString());
        delete json.type;
        json.main = 'src/app.js';
        json.bin.frodo = './src/app.js';
        // eslint-disable-next-line no-param-reassign
        file.contents = Buffer.from(JSON.stringify(json));
        done(null, file);
      })
    )
    .pipe(gulp.dest('dist'))
);

gulp.task('dist-install', () =>
  gulp.src(['dist/package.json'], { base: 'dist' }).pipe(install())
);

gulp.task('dist-transpile', () =>
  gulp
    .src(['src/*.ts', 'src/**/*.ts'])
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(
      babel({
        configFile: './babel.config.esm.json',
        plugins: [
          [
            '@babel/plugin-transform-modules-commonjs',
            {
              importInterop: 'babel',
            },
          ],
          ['babel-plugin-transform-import-meta'],
        ],
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/src'))
);

gulp.task('dist-resources', () =>
  gulp.src(['src/**/*.json'], { base: './' }).pipe(gulp.dest('dist'))
);

gulp.task('dist-pkg', () => {
  switch (process.platform) {
    case 'darwin':
      console.log(`Building MacOS (${process.arch}) binary.`);
      return exec([
        '-C',
        'Gzip',
        '-t',
        `node18-macos-${process.arch}`,
        '-o',
        'dist/bin/macos/frodo',
        'dist',
      ]);
    case 'linux':
      console.log(`Building Linux (${process.arch}) binary.`);
      return exec([
        '-C',
        'Gzip',
        '-t',
        `node18-linux-${process.arch}`,
        '-o',
        'dist/bin/linux/frodo',
        'dist',
      ]);
    case 'win32':
      console.log(`Building Windows (${process.arch}) binary.`);
      return exec([
        '-C',
        'Gzip',
        '-t',
        `node18-win-${process.arch}`,
        '-o',
        'dist/bin/win/frodo',
        'dist',
      ]);
    default:
      console.log('Unsupported OS - not building binaries.');
      return null;
  }
});

gulp.task(
  'build-local',
  gulp.series('install', 'clean-esm', 'transpile-esm', 'resources-esm')
);

gulp.task(
  'build-binary',
  gulp.series(
    'dist-clean',
    'dist-package',
    'dist-install',
    'dist-transpile',
    'dist-resources',
    'dist-pkg'
  )
);

gulp.task('default', gulp.parallel('build-local', 'build-binary'));

gulp.task('do-watch', () => {
  gulp.watch(['src/*.ts', 'src/**/*.ts'], gulp.series('transpile-esm'));
});

gulp.task('watch', gulp.series('link-frodo-lib', 'do-watch'));
