const mix = require('laravel-mix');

mix.js('src/app.js', 'index.js')
.webpackConfig({
    externals: {
        "jquery": "jQuery"
    }
});