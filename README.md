# Merlin Wiki Augmentations
This is the repository for many of the JavaScript utilities developed for [Coder Merlin](https://www.codermerlin.com/wiki/index.php/Welcome_to_Coder_Merlin)

## Usage
All publicly-available functions are listed in `src/app.js`.

## Building
The latest version is always provided in `dist/augmentations.js`, but you can also build a customized version. To do this, first clone the repository, then install any dependencies, and then run webpack:

``` shell
npm install
npm run production
```

If you're working on development, then you'll likely find it more convenient to use the built-in testing mode. To do this, add the following to a file named `.env` in the project root before building:

```
MIX_ENV=testing
```

You may also find it convenient during development to use `npm run watch`, which will automatically rebuild the assets as you update the source files.