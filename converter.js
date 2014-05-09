/**
 * User: Konstantin Latypov
 * Date: 06.05.14
 * Time: 20:09
 */
'use strict';

var XMLDOMParser = require('xmldom').DOMParser;

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

function convert(data, callback) {

    /**
     * Removing tags which can't be converted.
     * @param xmlDoc
     */
    var removeTags = function (xmlDoc) {
        return {
            doc: xmlDoc,
            removedCount: 1, // Count of total removed tags
            removeSafelyCount: 1, // Count of removed tags which doesn't matters on rendering
            removed: ["circle"] // Removed tags
        }
    };

    /**
     * Merge paths and transforms
     * @param doc
     */
    var mergePaths = function (doc) {
        return {
            doc: xmlDoc,
            merges: 1 // Count of merges
        }
    };

    console.log("Convert data:\n" + data);
    //FIXME: Catch parse errors
    var xmlDoc = (new XMLDOMParser()).parseFromString(data, 'application/xml');
    var error = null;

    var result = removeTags( xmlDoc );
    if ( result.removeSafelyCount < result.removedCount ) {
        error = ErrorsConvertation.REMOVE_TAGS; //TODO: Implement adding tag names
    }

    result = mergePaths( result.doc );
    if (error == null && result.merges > 0) {
        error = ErrorsConvertation.MERGE_PATHS;
    }

    callback(result.doc, error);
};

function importSvg(string, callback) {
    console.log("Import data:\n" + string);
    callback(string, null);
};

exports.convert = convert;

exports.import = importSvg;

exports.errorsConvertation = ErrorsConvertation;
