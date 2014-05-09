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
        if ( err != null ) {
            console.log(err.message);
        }

        var customIcons = 'custom_icons'; //TODO implement = N.app.fontsList.getFont('custom_icons');
        if (err != converter.errorsConvertation.INVALID_IMAGE) {
            converter.import(data, customIcons, onImport);
        }
    }

    /**
     * Even fired when import finish
     *
     * @param data
     * @param err
     */
    var onImport = function(data, err) {
        if (err) {
            console.log(err.message);
        }
    }

    converter.convert(data, fileName, onConvert);  //FIXME: fileName added only for testing stub
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

