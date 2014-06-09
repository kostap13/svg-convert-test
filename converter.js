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
var quietAttrs = ['id', 'd', 'transform'];
var supportedTags = ['path'];

/**
 * Parse path tag
 *
 * @param item
 * @param parentTransforms
 * @returns {{d: *, transform: string, guaranteed: boolean}}
 */
function  parsePath( item, parentTransforms ) {
    var transform = ( item.getAttribute('transform') ) ? parentTransforms + ' ' + item.getAttribute('transform') : parentTransforms;
    return { 'd': item.getAttribute('d'),
        'transform': transform,
        'guaranteed' : true};
}



/**
 * Removing tags which can't be converted.
 *
 * @param node
 * @param ignoredTags  Hash with ignored tags
 * @param ignoredAttrs Hash with ignored attributes
 * @param parentTransforms  Text with parent transforms
 * @returns {{paths: Array of  Object with contains path, transforms,
 *              removed: Array, guaranteed: boolean}}
 */
function processTree(node, ignoredTags, ignoredAttrs, parentTransforms ) {
    var paths = [];
    var guaranteed = true;
    _.each( node.childNodes, function( item )  {
        //TODO: Check nessasary
        if ( item.nodeType !== 1 ) {
            return;
        }
        // Quiet ignored tags
        if ( quietTags.indexOf( item.nodeName ) > -1) {
            return;
        }

        // Parse nested g tags
        if ( item.nodeName === 'g' ) {
            var transforms = ( item.getAttribute('transform') ) ? parentTransforms + ' ' + item.getAttribute('transform') : parentTransforms;
            var result = processTree( item, ignoredTags, ignoredAttrs, transforms);
            paths = paths.concat( result.paths );
            ignoredTags = ignoredTags.concat( result.ignoredTags );  //FIXME: Bugfix
            ignoredAttrs = ignoredAttrs.concat( result.ignoredAttrs );
            guaranteed = guaranteed && result.guaranteed ;
        }

        // Remove not supported tags
        if ( supportedTags.indexOf( item.nodeName ) < 0) {
            ignoredTags[ item.nodeName ] = true;
            return;
        }

        // Parse supported tag
        var res = {};
        switch ( item.nodeName ) {
            case 'path' : res = parsePath( item, parentTransforms );
                            break;
        }

        var transformedPath = new SvgPath( res.d ).transform( res.transform ).toString();
        paths.push( transformedPath );
        guaranteed = guaranteed && res.guaranteed;

        // Remove not supported attributes
        _.each(item.attributes, function (item) {
            if (quietAttrs.indexOf( item.nodeName) === -1) {
                ignoredAttrs[item.nodeName = true;
            }
        });
    });

    return {
        paths: paths,
        ignoredTags: ignoredTags,
        ignoredAttrs : ignoredAttrs,
        guaranteed: guaranteed
    };
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
 * @returns {{d: "", width: number, height: number, x: number, y: number, ignoredTagsTags: Array, ignoredAttrs: Array, error: null, guaranteed: boolean}}
 */
function convert( sourceXml ) {
    console.log('Convert data\n');

    var error = null;
    var ans = {
        d : '',
        width : 0,
        height : 0,
        x : 0,
        y : 0,
        ignoredTagsTags : [],
        ignoredAttrs : [],
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
        ans.error = error;
        return ans;
    }

    var svg = xmlDoc.getElementsByTagName('svg')[0];

    var result = processTree( svg, {}, {}, '' );
    var guaranteed = result.guaranteed;

    var mergedPath = '';
    _.each( result.paths, function( item ) {
        mergedPath += item;
    });
    if ( result.paths.length > 0) {
        guaranteed = false;
    }

    var coords = getCoordinates( svg );

    ans.d  = mergedPath;
    ans.width = coords.width;
    ans.height = coords.height;
    ans.x = coords.x;
    ans.y = coords.y;
    ans.ignoredTags = result.ignoredTags;
    ans.ignoredAttrs = result.ignoredAttrs;
    ans.guaranteed = guaranteed;
    return ans;
}


exports.convert = convert;


