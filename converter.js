/**
 * User: Konstantin Latypov
 * Date: 06.05.14
 * Time: 20:09
 */
'use strict';

var XMLDOMParser = require('xmldom').DOMParser;
var lodash = require('lodash');
var SvgPath = require('svgpath');

var quietTags = ["desc", "title"];
var quietAttributes = ["id", "d", "transform"];

/**
 * Removing tags which can't be converted.
 *
 * @param xmlDoc
 * @param removed  Array with removed tags
 * @param root Root element
 * @param parentTransforms  Text with parent transforms
 * @returns {{doc: xml,
 *              removed: Array}}
 */
function removeTags (xmlDoc, removed, root, parentTransforms ) {
    lodash.each( xmlDoc.childNodes, function( item )  {
        if ( item.nodeType != 1 ) {
            return;
        }
        if ( item.childNodes.length > 0 && item.nodeName == 'g' ) {
            var transforms = parentTransforms;
            if ( item.getAttribute("transform") ) {
                transforms = parentTransforms + ' ' + item.getAttribute("transform");
            }
            removeTags( item, removed, root, transforms );
        }

        if ( item.nodeName != 'path' ) {
            if ( lodash.indexOf( removed, item.nodeName ) == -1 && lodash.indexOf( quietTags, item.nodeName ) == -1 ) {
                removed.push( item.nodeName );
            }
            item.parentNode.removeChild( item );
        } else {
            var path = item.cloneNode( true );
            //TODO: Change to arrays, no DOM operations
            if ( parentTransforms != '' ) {
                var transform = path.getAttribute("transform");
                if ( transform ) {
                    path.setAttribute("transform", parentTransforms + " " + transform);
                } else {
                    path.setAttribute("transform", parentTransforms);
                }
            }
            lodash.each(item.attributes, function( item ) {
                if ( lodash.indexOf( removed, item.nodeName ) == -1 && lodash.indexOf( quietAttributes, item.nodeName ) == -1 ) {
                    removed.push( item.nodeName );
                }
            });
            root.appendChild( path );
        }
    });

    return {
        doc: xmlDoc,
        removed: removed
    }
};

/**
 * Merge transforms
 * @param doc
 */
function mergeTransforms(doc) {
    lodash.each( doc.childNodes, function( item )  {
        if ( item.nodeType != 1 || item.nodeName != 'path' ) {
            return;
        }
        var transform = item.getAttribute("transform");
        if ( !transform || transform == '' ) {
            return;
        }
        var d = item.getAttribute("d");
        var transformedPath = new SvgPath( d ).transform( transform ).toString();
        item.removeAttribute("transform");
        item.setAttribute("d", transformedPath);
    });
    return doc;
};

/**
 *
 * @param xmlDoc
 * @returns {{d: String result of merge d attributes,
 *              merges: number}}
 */
function mergePaths( xmlDoc ) {
    var merges = 0;
    var result = '';
    lodash.each( xmlDoc.childNodes, function( item ) {
        if ( item.nodeType != 1 || item.nodeName != 'path' ) {
            return;
        }
        result += item.getAttribute("d");
    });
    return {
        d: result,
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

    //FIXME: Catch parse errors
    var xmlDoc = (new XMLDOMParser()).parseFromString( sourceXml , 'application/xml');
    var svg = xmlDoc.getElementsByTagName("svg")[0];

    var result = removeTags( svg, new Array(), svg, '' );

    var removedTags = result.removed;

    var xml = mergeTransforms( result.doc );

    result = mergePaths( xml );
    if ( result.merges > 0) {
        guaranteed = false;
    }
    console.log( result.d );

    return {
        d : result.d,
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


