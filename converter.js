/**
 * User: Konstantin Latypov
 * Date: 06.05.14
 * Time: 20:09
 */
'use strict';

var ErrorsConvertation = {
    /**
     * XML can't be parsed.
     */
    INVALID_IMAGE : {
        message : "Invalid file format."
    },
    /**
     * Found elemеnt or property which can not be removed unnoticed.
     */
    REMOVE_TAGS : {
        message: "If image looks not as expected please convert to compound path manualy. Skipped tags and attributes: "
    },
    /**
     * Merge paths without removing elements
     */
    MERGE_PATHS : {
        message: "If image looks not as expected please convert to compound path manualy."
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
