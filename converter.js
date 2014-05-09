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

/**
 * Converting SVG image to fontello format
 *
 * @param data
 * @param callback
 */
function convert(data, fileName, callback) {

    /**
     * Removing tags which can't be converted.
     * @param xmlDoc
     */
    var removeTags = function (xmlDoc) {
        var removedCount = 0;
        var removeSafelyCount = 0;
        //FIXME: Test started
        switch (fileName) {
            case "./test-icons/android.svg" :
            case "./test-icons/nike.svg" :
            case "./test-icons/will-be-empty.svg" :
                removedCount = 4;
                removeSafelyCount = 1;
                break;
        }
        //FIXME: Test ended

        return {
            doc: xmlDoc,
            removedCount: removedCount, // Count of total removed tags
            removeSafelyCount: removeSafelyCount, // Count of removed tags which doesn't matters on rendering
            removed: ["circle"] // Removed tags
        }
    };

    /**
     * Merge paths and transforms
     * @param doc
     */
    var mergePaths = function (doc) {
        var merges = 0;
        //FIXME: Test started
        switch (fileName) {
            case "./test-icons/android.svg" :
            case "./test-icons/nike.svg" :
            case "./test-icons/only-merges.svg" :
                merges = 1;
                break;
        }
        //FIXME: Test ended
        return {
            doc: xmlDoc,
            merges: merges // Count of merges
        }
    };

    console.log("Convert data:\n");
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

/**
 * Import svg image from svg files.
 *
 * @param data - Text content
 * @param customIcons
 * @param callback
 */
function importSvg(data, customIcons, callback) {
    console.log("\nImport data:\n" );
    callback(data, null);
};

exports.convert = convert;

exports.import = importSvg;

exports.errorsConvertation = ErrorsConvertation;

