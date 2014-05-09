/**
 * User: Konstantin Latypov
 * Date: 06.05.14
 * Time: 20:09
 */
'use strict';

var err = {
    /**
     * XML can't be parsed.
     */
    INVALID_IMAGE : {
        message : "Invalid file format."
    }
};

function convert(string, callback) {
    console.log("Convert data:\n" + string);
    callback(string, null);
};

function importSvg(string, callback) {
    console.log("Import data:\n" + string);
    callback(string, null);
};

exports.convert = convert;

exports.import = importSvg;
