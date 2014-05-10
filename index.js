/**
 * User: Konstantin Latypov
 * Date: 06.05.14
 * Time: 19:34
 */
'use strict';


var fs = require('fs');
var converter = require('./converter');

/**
 * Processing image lifecycle
 *
 * @param data
 * @param fileName
 */
function processSVGImage(data, fileName) {
    var result = converter.convert(data);

    //FIXME: Test started
    switch (fileName) {
        case "./test-icons/android.svg" :
        case "./test-icons/nike.svg" :
        case "./test-icons/will-be-empty.svg" :
            result.removed = true;
            break;
        case "./test-icons/android.svg" :
        case "./test-icons/nike.svg" :
        case "./test-icons/only-merges.svg" :
            result.merged = true;
            break;
    }
    //FIXME: Test ended

    if  (result.invalid ) {
            console.log('Invalid');
    } else if ( result.removed  ) {
            console.log('Removed tags');
    } else if ( result.merged ) {
            console.log('Merged tags');
    }
    //TODO: Implement creating SVG image
}

if ( process.argv.length > 2 ) {
    var fileName = process.argv[2];
    fs.readFile( fileName , {'encoding' : 'utf8'}, function (err, data) {
        if (err) throw err;
        processSVGImage(data, fileName);
    });
} else {
    console.log("No file was passed. Please type: node index.js [path to svg image]");
}

