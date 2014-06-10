/**
 * User: Konstantin Latypov
 * Date: 06.05.14
 * Time: 20:09
 */
'use strict';

var XMLDOMParser = require('xmldom').DOMParser;
var _ = require('lodash');
var SvgPath = require('svgpath');

var quietTags = {};
var supportedTags = {};
var notQuietAtts = {};

['desc', 'title'].forEach(function (key) {
  quietTags[key] = true;
});

['path', 'g'].forEach(function (key) {
  supportedTags[key] = true;
});

['requiredFeatures',
  'requiredExtensions',
  'systemLanguage',
  'xml:base',
  'xml:lang',
  'xml:space',
  'onfocusin',
  'onfocusout',
  'onactivate',
  'onclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'onload',
  'alignment-baseline',
  'baseline-shift',
  'clip',
  'clip-path',
  'clip-rule',
  'color',
  'color-interpolation',
  'color-interpolation-filters',
  'color-profile',
  'color-rendering',
  'cursor',
  'direction',
  'display',
  'dominant-baseline',
  'enable-background',
  'fill',
  'fill-opacity',
  'fill-rule',
  'filter',
  'flood-color',
  'flood-opacity',
  'font-family',
  'font-size',
  'font-size-adjust',
  'font-stretch',
  'font-style',
  'font-variant',
  'font-weight',
  'glyph-orientation-horizontal',
  'glyph-orientation-vertical',
  'image-rendering',
  'kerning',
  'letter-spacing',
  'lighting-color',
  'marker-end',
  'marker-mid',
  'marker-start',
  'mask',
  'opacity',
  'overflow',
  'pointer-events',
  'shape-rendering',
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'text-anchor',
  'text-decoration',
  'text-rendering',
  'unicode-bidi',
  'visibility',
  'word-spacing',
  'writing-mode',
  'class',
  'style',
  'externalResourcesRequired',
  'pathLength',
  'externalResourcesRequired'].forEach(function (key) {
    notQuietAtts[key] = true;
});

/**
 * Removing tags which can't be converted.
 *
 * @param node
 * @param ignoredTags Hash with ignored tags
 * @param ignoredAttrs Hash with ignored attributes
 * @param parentTransforms Text with parent transforms
 * @param paths
 * @returns {{paths: String with contains merged path, ignoredTags: *, ignoredAttrs: *, guaranteed: boolean}}
 */
function processTree(node, ignoredTags, ignoredAttrs, parentTransforms, paths) {
  var guaranteed = true;
  _.each(node.childNodes, function (item) {
    // Quiet ignored tags
    if (quietTags[item.nodeName]) {
      return;
    }

    if ( !supportedTags[item.nodeName] ) {
      ignoredTags[item.nodeName] = true;
      return;
    }

    // Parse nested tags
    var transforms = '';
    if (supportedTags[item.nodeName]) {
      transforms = ( item.getAttribute('transform') ) ? parentTransforms + ' ' + item.getAttribute('transform') : parentTransforms;
      var result = processTree(item, ignoredTags, ignoredAttrs, transforms, paths);
      paths = result.paths;
      guaranteed = guaranteed && result.guaranteed;
    }

    // Parse supported tag
    var transformedPath = '';
    switch (item.nodeName) {
      case 'path' :
        var d = item.getAttribute( 'd' );
        transformedPath = new SvgPath(d).transform(transforms).toString();
        break;
    }

    // Merge paths
    if ( paths !== '' && transformedPath !== '' ) {
      guaranteed = false;
    }
    paths = paths + transformedPath;

    // Remove not supported attributes
    _.each(item.attributes, function (item) {
      if (notQuietAtts[item.nodeName]) {
        guaranteed = false;
        ignoredAttrs[item.nodeName] = true;
      }
    });
  });

  return {
    paths: paths,
    ignoredTags: ignoredTags,
    ignoredAttrs: ignoredAttrs,
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
  // getting viewBox values array
  var viewBoxAttr = svg.getAttribute('viewBox');
  var viewBox = _.map(
    (viewBoxAttr || '').split(' '),
    function(val) { return parseInt(val, 10); }
  );
  // If viewBox attr has less than 4 digits
  if ( viewBox && viewBox.length < 4 ) {
    viewBoxAttr = null;
  }

  // getting base parameters
  var attr = {};
  _.forEach(['x', 'y', 'width', 'height'], function(key) {
    attr[key] = parseInt(svg.getAttribute(key), 10);
  });
  var result = {
    x: attr.x || 0,
    y: attr.y || 0,
    width: attr.width,
    height: attr.height,
    error: null
  };

  // Only svg width & height attrs are set
  if (!viewBoxAttr && result.width && result.height) {
    return result;
  }

  // viewBox not set and attrs not set
  if (!viewBoxAttr && !result.width && !result.height  ) {
    result.error = new Error('Can`t parse xml');
    //TODO: Implements calculating bounds
    return result;
  }

  // viewBox not set and one attr not set
  if (!viewBoxAttr && ( !result.width || !result.height  )) {
    result.error = new Error('Can`t parse xml');
    //TODO: Implements calculating bounds
    return result;
  }

  // viewBox is set and attrs not set
  if (viewBoxAttr && !result.width && !result.height ) {
    result.x = viewBox[0];
    result.y = viewBox[1];
    result.width = viewBox[2];
    result.height = viewBox[3];
    return result;
  }

  // viewBox and attrs are set and values on width and height are equals
  if (viewBox[2] === result.width && viewBox[3] === result.height ) {
    result.x = viewBox[0];
    result.y = viewBox[1];
    return result;
  }

  // viewBox is set and one attr not set
  if (viewBoxAttr && ( !result.width || !result.height) ) {
    result.error = new Error('Can`t parse xml');
    //TODO: Implements calculating bounds and transform for one attr
    return result;
  }

  // viewBox and attrs are set, but have different sizes. Need to transform image
  result.error = new Error('Can`t parse xml');
  //TODO: Implements transforms

  return result;
}
/**
 *
 *
 * @param xml
 * @returns {{d: "", width: number, height: number, x: number, y: number, ignoredTagsTags: Array, ignoredAttrs: Array, error: null, guaranteed: boolean}}
 */
function convert(sourceXml) {
  console.log('Convert data\n');

  var error = null;
  var ans = {
    d: '',
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    ignoredTagsTags: [],
    ignoredAttrs: [],
    error: error,
    guaranteed: false
  };

  var xmlDoc = (new XMLDOMParser({
    errorHandler: {
      error: function (err) {
        error = err;
      },
      fatalError: function (err) {
        error = err;
      }
    }
  })).parseFromString(sourceXml, 'application/xml');

  if (error) {
    ans.error = error;
    return ans;
  }

  var svg = xmlDoc.getElementsByTagName('svg')[0];

  var result = processTree(svg, {}, {}, '', '');
  var guaranteed = result.guaranteed;

  var coords = getCoordinates(svg);

  ans.d = result.paths;
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


