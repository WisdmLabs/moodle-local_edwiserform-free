#!/bin/sh

mkdir src/icons/optimized
node_modules/svgo/bin/svgo -f src/icons -o src/icons/optimized --config="{\"plugins\":[{\"cleanupAttrs\":true},{\"removeDimensions\":true},{\"removeTitle\":true},{\"removeUselessDefs\":true},{\"mergePaths\":true},{\"removeStyleElement\":true},{\"removeNonInheritableGroupAttrs\":true}]}"
node ./node_modules/svg-sprite/bin/svg-sprite.js -s --symbol-dest="dist/" src/icons/optimized/*.svg
mv dist/svg/sprite.css.svg ../pix/formeo-sprite.svg
rm -r dist/svg
rm -r src/icons/optimized
