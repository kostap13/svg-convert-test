/**
 * User: Konstantin Latypov
 * Date: 06.05.14
 * Time: 20:09
 */
'use strict';

var XMLDOMParser = require('xmldom').DOMParser;

/**
 * Converting SVG image
 *
 * @param data string which contains xml of svg image
 *
 * @returns {{d: string,
 *              width: number,
 *              tags : tags,
 *              invalid: boolean,
 *              nerged: boolean,
 *              removed: boolean
 *          }}
 */
function convert(data) {

    /**
     * Removing tags which can't be converted.
     * @param xmlDoc
     */
    var removeTags = function (xmlDoc) {
        var removedCount = 0;
        var removeSafelyCount = 0;

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
        return {
            doc: xmlDoc,
            merges: merges // Count of merges
        }
    };

    var invalid = false;
    var merged = false;
    var removed = false;

    console.log("Convert data\n");
    //FIXME: Catch parse errors
    var xmlDoc = (new XMLDOMParser()).parseFromString(data, 'application/xml');
    var error = null;

    var result = removeTags( xmlDoc );
    if ( result.removeSafelyCount < result.removedCount ) {
        removed = true; //TODO: Implement adding tag names
    }
    var tags = result.removed;

    result = mergePaths( result.doc );
    if ( result.merges > 0) {
        merged = true;
    }

    return {
        'd' : 'M 30 Z',
        'width' : 30,
        'tags' : tags,
        'invalid' : invalid,
        'nerged' : merged,
        'removed' : removed
    }
};


exports.convert = convert;


