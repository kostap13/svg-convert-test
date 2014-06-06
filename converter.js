/**
 * User: Konstantin Latypov
 * Date: 06.05.14
 * Time: 20:09
 */
'use strict';

var XMLDOMParser = require('xmldom').DOMParser;
var _ = require('lodash');
var SvgPath = require('svgpath');

var quietTags = ["desc", "title"];
var quietAttributes = ["id", "d", "transform"];

/**
 * Removing tags which can't be converted.
 *
 * @param xmlDoc
 * @param removed  Array with removed tags
 * @param parentTransforms  Text with parent transforms
 * @returns {{pathData: Array of  Object with contains path, transforms,
 *              removed: Array}}
 */
function removeTags (xmlDoc, removed, parentTransforms ) {
    var pathData = new Array();
    _.each( xmlDoc.childNodes, function( item )  {
        if ( item.nodeType != 1 ) {
            return;
        }
        if ( item.childNodes.length > 0 && item.nodeName == 'g' ) {
            var transforms = parentTransforms;
            if ( item.getAttribute("transform") ) {
                transforms = parentTransforms + ' ' + item.getAttribute("transform");
            }
            var result = removeTags( item, removed, transforms);
            pathData = pathData.concat( result.pathData );
        }

        if ( item.nodeName != 'path' ) {
            if ( _.indexOf( removed, item.nodeName ) == -1 && _.indexOf( quietTags, item.nodeName ) == -1 ) {
                removed.push( item.nodeName );
            }
            item.parentNode.removeChild( item );
        } else {
            if ( parentTransforms != '' ) {
                var transform = item.getAttribute("transform");
                if ( transform ) {
                    pathData.push( { 'd': item.getAttribute("d"), 'transform' : parentTransforms + " " + transform});
                } else {
                    pathData.push( { 'd': item.getAttribute("d"), 'transform' : parentTransforms });
                }
            } else {
                pathData.push( { 'd': item.getAttribute("d"), 'transform' : null});
            }
            _.each(item.attributes, function( item ) {
                if ( _.indexOf( removed, item.nodeName ) == -1 && _.indexOf( quietAttributes, item.nodeName ) == -1 ) {
                    removed.push( item.nodeName );
                }
            });
        }
    });

    return {
        pathData: pathData,
        removed: removed
    }
};

/**
 * Merge transforms
 *
 * @param pathData
 * @returns {Array} of paths
 */
function mergeTransforms( pathData ) {
    var paths = new Array();
    _.each( pathData, function( item )  {
        if ( !item.transform || item.transform == '' ) {
            paths.push( item.d );
            return;
        }
        var transformedPath = new SvgPath( item.d ).transform( item.transform ).toString();
        paths.push( transformedPath );
    });
    return paths;
}

/**
 * Merge paths from array to string
 *
 * @param paths
 * @returns {string}
 */
function mergePaths( paths ) {
    var result = '';
    _.each( paths, function( item ) {
        result += item;
    });
    return result;
}

/**
 * Returns coordinates for svg
 *
 * @param svg
 * @returns {{x: (string|number),
 *              y: (string|number),
 *              width: (string),
 *              height: (string)}}
 */
function getCoordinates(svg) {
    var viewBox = _.map(
        (svg.getAttribute('viewBox') || '').split(' '),
        function(val) { return val; }
    );
    var attr = {};
    _.forEach(['x', 'y', 'width', 'height'], function(key) {
        attr[key] = parseInt(svg.getAttribute(key));
    });
    return {
        x : viewBox[0] || attr.x || 0,
        y : viewBox[1] || attr.y || 0,
        width : viewBox[2] || attr.width || '100%',
        height : viewBox[3] || attr.height || '100%'
    };
}
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

    var result = removeTags( svg, new Array(), '' );
/*    _.each( result.pathData, function ( item ) {
        console.log( item.d + " - " + item.transform );
    });*/

    var removedTags = result.removed;

    var paths = mergeTransforms( result.pathData );

    result = mergePaths( paths );
    if ( paths.length > 0) {
        guaranteed = false;
    }
    var coords = getCoordinates( svg );

    return {
        d : result.d,
        width : coords.width,
        height : coords.height,
        x : coords.x,
        y : coords.y,
        removedTags : removedTags,
        error : error,
        guaranteed : guaranteed
    };;
};


exports.convert = convert;


