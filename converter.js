/**
 * User: Konstantin Latypov
 * Date: 06.05.14
 * Time: 20:09
 */
'use strict';

var XMLDOMParser = require('xmldom').DOMParser;
var lodash = require('lodash');


/**
 * Removing tags which can't be converted.
 *
 * @param xmlDoc
 * @param removed  Array with removed tags
 * @param parentTransforms  Text with parent transforms
 * @returns {{doc: xml,
 *              removed: Array}}
 */
function removeTags (xmlDoc, removed, parentTransforms, root) {
    lodash.each( xmlDoc.childNodes, function( item )  {
        if ( item.nodeType != 1 ) {
            return;
        }
        if ( item.childNodes.length > 0 ) {
            removeTags( item, removed, null, root );
        }
        console.log( item.nodeName );
        if ( item.nodeName != 'path' ) {
            if ( !lodash.has( removed, item.nodeName ) ) {
                removed.push( item.nodeName );
            }
            item.parentNode.removeChild( item );
        } else {
            var path = item.cloneNode( true );
            console.log("transform = " + item.getAttribute("transform").textContent + " / " + item.attributes.getNamedItem("transform") + " / " + item );
            root.appendChild( path );
        }
        console.log( "-------------------------------------" );
    });
    console.log( removed );
    console.log( 'xml = ' + xmlDoc );
    console.log( '=====================================' );

    return {
        doc: xmlDoc,
        removed: ["circle"] // Removed tags
    }
};

/**
 * Merge transforms
 * @param doc
 */
function mergeTransforms(doc) {
    return doc;
};

/**
 * Merge paths
 * @param doc
 */
function mergePaths( xmlDoc ) {
    var merges = 0;
    return {
        doc: xmlDoc,
        merges: merges // Count of merges
    }
};

/**
 * Converting SVG image
 *
 * @param xml
 * @returns {{d: string,
 *              width: number,
 *              height: number,
 *              x: number,
 *              y: number,
 *              removedTags: Array,
 *              error: Error,
 *              guaranteed: boolean}}
 */
function convert( sourceXml ) {
    console.log("Convert data\n");

    var guaranteed = true;
    var error = null;
    var d = "";

    //FIXME: Catch parse errors
    var xmlDoc = (new XMLDOMParser()).parseFromString( sourceXml , 'application/xml');
    var svg = xmlDoc.getElementsByTagName("svg")[0];

    var result = removeTags( svg, new Array(), null, svg );
    var removedTags = result.removed;

    var xml = mergeTransforms( result.doc );

    result = mergePaths( xml );
    if ( result.merges > 0) {
        guaranteed = false;
    }

/*    return {
        'd' : 'M 30 Z',
        'width' : 30,
        'tags' : tags,
        'invalid' : invalid,
        'nerged' : merged,
        'removed' : removed
    }*/

    return {
        d : d,
        width : null,
        height : null,
        x : null,
        y : null,
        removedTags : removedTags,
        error : error,
        guaranteed : guaranteed
    };;
};


exports.convert = convert;


