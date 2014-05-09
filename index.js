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

    /**
     * Event fired when convertation finish
     *
     * @param data
     * @param err
     */
    var onConvert = function(data, err) {
        if (!err) {
            converter.import(data, onImport);
        } else {
            console.log(err.message);
        }
    }

    /**
     * Even fired when import finish
     *
     * @param data
     * @param err
     */
    var onImport = function(data, err) {
        if (!err) {
            // Do next steps
        } else {
            console.log(err.message);
        }
    }

    converter.convert(data, onConvert);
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

