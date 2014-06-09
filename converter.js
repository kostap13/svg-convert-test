/**
 * User: Konstantin Latypov
 * Date: 06.05.14
 * Time: 20:09
 */
'use strict';

var XMLDOMParser = require('xmldom').DOMParser;
var _ = require('lodash');
var SvgPath = require('svgpath');

var quietTags = ['desc', 'title'];
var quietAttributes = ['id', 'd', 'transform'];

/**
 * Parse path tag
 *
 * @param item
 * @param parentTransforms
 * @returns {{d: *, transform: string, guaranteed: boolean}}
 */
var parsePath = function ( item, parentTransforms ) {
    var transform = ( item.getAttribute('transform') ) ? parentTransforms + ' ' + item.getAttribute('transform') : parentTransforms;
    return { 'd': item.getAttribute('d'),
                'transform': transform,
                'guaranteed' : true};
};

// Key - supported tag, value - function for parse tag. See parseTags function for example
var supportedTags = { path : parsePath };

/**
 * Removing tags which can't be converted.
 *
 * @param xmlDoc
 * @param removed  Array with removed tags
 * @param parentTransforms  Text with parent transforms
 * @returns {{pathData: Array of  Object with contains path, transforms,
 *              removed: Array, guaranteed: boolean}}
 */
function removeTags (xmlDoc, removed, parentTransforms ) {
    var pathData = [];
    var guaranteed = true;
    _.each( xmlDoc.childNodes, function( item )  {
        if ( item.nodeType !== 1 ) {
            return;
        }
        // Parse nested g tags
        if ( item.childNodes.length > 0 && item.nodeName === 'g' ) {
            var transforms = ( item.getAttribute('transform') ) ? parentTransforms + ' ' + item.getAttribute('transform') : parentTransforms;
            var result = removeTags( item, removed, transforms);
            pathData = pathData.concat( result.pathData );
            guaranteed = guaranteed && result.guaranteed ;
        }

        // Remove not supported tags
        if ( !_.has( supportedTags, item.nodeName ) &&
                _.indexOf( removed, item.nodeName ) === -1 &&
                _.indexOf( quietTags, item.nodeName ) ) {
            removed.push( item.nodeName );
            return;
        }

        // Parse supported tag
        var res = supportedTags[ item.nodeName ] ( item, parentTransforms );  // Calls function for supported tag
        pathData.push( { 'd': res.d, 'transform': res.transform} );
        guaranteed = guaranteed && res.guaranteed;

        // Remove not supported attributes
        _.each(item.attributes, function (item) {
            if (_.indexOf(removed, item.nodeName) === -1 && _.indexOf(quietAttributes, item.nodeName) === -1) {
                removed.push(item.nodeName);
            }
        });
    });

    return {
        pathData: pathData,
        removed: removed,
        guaranteed: guaranteed
    };
}

/**
 * Merge transforms
 *
 * @param pathData
 * @returns {Array} of paths
 */
function mergeTransforms( pathData ) {
    var paths = [];
    _.each( pathData, function( item )  {
        if ( !item.transform || item.transform === '' ) {
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
 *
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
    console.log('Convert data\n');

    var guaranteed = true;
    var error = null;
    var ans = {
        d : '',
        width : 0,
        height : 0,
        x : 0,
        y : 0,
        removedTags : [],
        error : error,
        guaranteed : false
    };

    var xmlDoc = (new XMLDOMParser({
        errorHandler: {
            error: function( err ) {
                error = err;
            },
            fatalError:function( err ) {
                error = err;
            }
        }
    })).parseFromString( sourceXml , 'application/xml');

    if ( error ) {
        return ans;
    }

    var svg = xmlDoc.getElementsByTagName('svg')[0];

    var result = removeTags( svg, [], '' );
/*    _.each( result.pathData, function ( item ) {
        console.log( item.d + " - " + item.transform );
    });*/
    guaranteed = result.guaranteed;

    var removedTags = result.removed;

    var paths = mergeTransforms( result.pathData );

    result = mergePaths( paths );
    if ( paths.length > 0) {
        guaranteed = false;
    }
    var coords = getCoordinates( svg );

    ans.d  = result;
    ans.width = coords.width;
    ans.height = coords.height;
    ans.x = coords.x;
    ans.y = coords.y;
    ans.removedTags = removedTags;
    ans.guaranteed = guaranteed;
    return ans;
}


exports.convert = convert;


