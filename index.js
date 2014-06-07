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
    console.log( result );

    var path = '';
    if ( result.d != '' ) {
        path = '<path d="' + result.d + '" />';
    }
    if ( !result.error ) {
        var xml = '<?xml version="1.0" ?>' +
        '<!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'>' +
        '<svg version="1.1" width="' + result.width + '" height="' + result.height + '" x="' + result.x + '" y="' + result.y + '"  xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
        + path +
        '</svg>';

        fs.writeFile('result.svg', xml, function (err) {
            if (err) throw err;
            console.log('It\'s saved!');
        });
    } else {
        console.log( "Error: " + result.error );
    }
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

