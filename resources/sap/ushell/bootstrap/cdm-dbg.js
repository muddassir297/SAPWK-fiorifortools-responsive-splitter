(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* global window, document, sap */

( function ( $window, $document, $JSON, oUtil ) {
    var sScriptTags, sStoredSapUiDebugValue;

    var sUI5LibraryRootPath = oUtil.getBootPath( $document );
    var oUi5ResourceRoots = { "": sUI5LibraryRootPath };

    var bDebugSources = /sap-ui-debug=(true|x|X)/.test( $window.location.search );

    var oConfigUtil = new oUtil.ConfigUtil( "sap.ushellConfig", $window, $document, $JSON );

    var fnXXBootTask = function ( fnCallback ) {

        $window.jQuery.sap.require( "sap.ushell.services.Container" );

        // tell SAPUI5 that this boot task is done once the container has loaded
        // TODO: change from local to cdm platform (once we have a ContainerAdapter)
        $window.sap.ushell.bootstrap( "local" ).done( fnCallback );
        //TODO what about .fail()?
    };

    $window.fnOnUI5Init = oUtil.onUI5Init;

    try {
        if ( !bDebugSources ) {
            sStoredSapUiDebugValue = $window.localStorage.getItem( "sap-ui-debug" );
            bDebugSources = !!sStoredSapUiDebugValue &&
                    /^(true|x|X)$/.test( sStoredSapUiDebugValue );
        }
    }
    catch ( e ) {
        // TODO: warn.
    }

    oConfigUtil.createGlobalConfigs( fnXXBootTask, null );
    $window[ "sap-ushell-config" ][ "sap-ui-debug" ] = bDebugSources;

    sScriptTags = "<script id='sap-ui-bootstrap' src='" + sUI5LibraryRootPath + "/sap/fiori/core-min-0.js' " +
            "data-sap-ui-evt-oninit='fnOnUI5Init( sap, jQuery );' " +
            "data-sap-ui-xx-bindingSyntax='complex' " +
            "data-sap-ui-libs='sap.fiori, sap.m, sap.ushell' " +
            "data-sap-ui-theme='sap_belize' " +
            "data-sap-ui-compatVersion='1.16' " +
            "data-sap-ui-resourceroots='" + JSON.stringify( oUi5ResourceRoots ) + "' " +
            "><\/script>";

    if ( !bDebugSources ) {
        sScriptTags += "<script src='" + sUI5LibraryRootPath +
                "/sap/fiori/core-min-1.js' " + "><\/script>" + "<script src='" +
                sUI5LibraryRootPath + "/sap/fiori/core-min-2.js' " + "><\/script>" +
                "<script src='" + sUI5LibraryRootPath + "/sap/fiori/core-min-3.js' " +
                "><\/script>";
    }

    $document.write( sScriptTags );

} )( window, document, JSON, require( "../common/" ) );
},{"../common/":8}],2:[function(require,module,exports){
"use strict";

var fnGetBootScript = require( "./common.boot.script" );
var sBootPath;

module.exports = function getBootPath( $document ) {
    var oBootScript;

    if ( !sBootPath ) {
        oBootScript = fnGetBootScript( $document );

        if ( oBootScript ) {
            // implicitly relies on location of bootstrap script (4 levels from root)
            sBootPath = oBootScript.src.split( "/" ).slice( 0, -4 ).join( "/" );
        }
        else {
            // TODO: warn.
        }
    }

    return sBootPath;
};
},{"./common.boot.script":3}],3:[function(require,module,exports){
"use strict";

module.exports = function getBootScript( $document ) {
    return $document.getElementById( "sap-ushell-bootstrap" );
};
},{}],4:[function(require,module,exports){
"use strict";

var fn = require( "./common.config.private" );

ConfigUtil.prototype.createGlobalConfigs = function ( fnXXBootTask, aServerConfigItems ) {
    var aMetaConfigItems = fn.readConfigItemsFromMeta(
        this.prefix,
        this.document,
        this.JSON
    );

    fn.createGlobalConfigs(
        aMetaConfigItems,
        fnXXBootTask,
        aServerConfigItems,
        this.window,
        this.JSON
    );
};

/**
 * Constructs a new utility object for managing configuration.
 *
 * @param {string} sConfigPrefix Prefix of meta tag name attributes containing configuration strings.
 * @param {window} $window window
 * @param {HTMLDocument} $document window.document
 * @param {JSON} $JSON window.JSON
 *
 * @returns {Object} New utility object for managing configuration.
 */
function ConfigUtil( sConfigPrefix, $window, $document, $JSON ) {
    return Object.create( ConfigUtil.prototype, {
        JSON: {
            value: $JSON
        },
        prefix: {
            value: sConfigPrefix
        },
        window: {
            value: $window
        },
        document: {
            value: $document
        }
    } );
}

module.exports = ConfigUtil;
},{"./common.config.private":5}],5:[function(require,module,exports){
"use strict";

function readConfigItemsFromMeta( sConfigPrefix, $document, $JSON ) {
    var sSelector = "meta[name^='" + sConfigPrefix + "']:not([name=''])";
    var oMetaNodeList = $document.querySelectorAll( sSelector );

    var aConfigItems = [ ];

    Array.prototype.slice.call( oMetaNodeList )
        .forEach( function ( oMetaNode ) {
            try {
                aConfigItems.push( $JSON.parse( oMetaNode.content ) );
            }
            catch ( e ) {
                // TODO: log it.
            }
        } );

    return aConfigItems;
}

function mergeConfig( oMutatedBaseConfig, oConfigToMerge, bCloneConfigToMerge, $JSON ) {
    var oActualConfigToMerge;

    if ( !oConfigToMerge ) {
        return;
    }

    oActualConfigToMerge = bCloneConfigToMerge
        ? $JSON.parse( $JSON.stringify( oConfigToMerge ) )
        : oConfigToMerge;

    Object.keys( oActualConfigToMerge )
        .forEach( function ( sKey ) {
            if ( typeof oMutatedBaseConfig[sKey] === "object" &&
                    typeof oActualConfigToMerge[sKey] === "object" ) {
                mergeConfig( oMutatedBaseConfig[sKey], oActualConfigToMerge[sKey], false );
                return;
            }

            oMutatedBaseConfig[sKey] = oActualConfigToMerge[sKey];
        } );
}

function createGlobalConfigs( aMetaConfigItems, fnXXBootTask, aServerConfigItems, $window, $JSON ) {
    var sConfigPropertyName = "sap-ushell-config";

    $window[ sConfigPropertyName ] = $window[ sConfigPropertyName ] || { };

    aMetaConfigItems.forEach( function ( oConfigItem ) {
        mergeConfig( $window[ sConfigPropertyName ], oConfigItem, true, $JSON );
    } );

    aServerConfigItems && aServerConfigItems
            .forEach( function ( oServerConfig ) {
                mergeConfig( $window[sConfigPropertyName], oServerConfig, true, $JSON );
            } );

    $window["sap-ui-config"] = {
        "xx-bootTask": fnXXBootTask
    };
}

module.exports.readConfigItemsFromMeta = readConfigItemsFromMeta;
module.exports.createGlobalConfigs = createGlobalConfigs;
module.exports.mergeConfig = mergeConfig;
},{}],6:[function(require,module,exports){
"use strict";

var fnGetBootPath = require( "./common.boot.path" );

module.exports = function loadContent( sap, jQuery ) {
    var sBootPath = fnGetBootPath();
    // TODO: should not be part of common bootstrap modules, but rather in cdm;
    // and we should disable this option for productive scenarios
    var sValue = jQuery.sap.getUriParameters().get( "sap-ushell-cdm-site-url" );
    var oContent = sap.ushell.Container.createRenderer();

    if ( sValue ) {
        // CODE SMELL: There should be another method that explicitly sets
        // cdmSiteUrl. Reason - nothing associates the verb load with set.
        jQuery.sap.getObject(
            "sap-ushell-config.services.CommonDataModel.adapter.config",
            0
        ).cdmSiteUrl = sValue;
    }

    jQuery.sap.setIcons( {
        "phone": sBootPath + '/sap/ushell/themes/base/img/launchicons/57_iPhone_Desktop_Launch.png',
        "phone@2": sBootPath + '/sap/ushell/themes/base/img/launchicons/114_iPhone-Retina_Web_Clip.png',
        "tablet": sBootPath + '/sap/ushell/themes/base/img/launchicons/72_iPad_Desktop_Launch.png',
        "tablet@2": sBootPath + '/sap/ushell/themes/base/img/launchicons/144_iPad_Retina_Web_Clip.png',
        "favicon": sBootPath + '/sap/ushell/themes/base/img/launchpad_favicon.ico',
        "precomposed": true
    } );

    // load and register Fiori2 icon font
    jQuery.sap.require( "sap.ushell.iconfonts" );
    jQuery.sap.require( "sap.ushell.services.AppConfiguration" );
    sap.ushell.iconfonts.registerFiori2IconFont();

    // clean fiori loading screen markup before placing main content
    jQuery( "#canvas" ).empty();
    oContent.placeAt( "canvas" );
};
},{"./common.boot.path":2}],7:[function(require,module,exports){
"use strict";

var fnGetBootPath = require( "./common.boot.path" );
var fnGetBootScript = require( "./common.boot.script" );

module.exports = function loadSplashscreen( $document ) {
    var sBootPath = fnGetBootPath( $document );
    var sRelAttribute = "apple-touch-startup-image";
    var oCurrentScript = fnGetBootScript( $document );

    [
        // iPhone splash screens
        {
            href: "320_x_460.png",
            media: "(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 1)"
        },
        {
            href: "640_x_920.png",
            media: "(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 2)"
        },
        {
            href: "640_x_1096.png",
            media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        },
        // iPad splash screens
        {
            href: "768_x_1004.png",
            media: "(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 1)"
        },
        {
            href: "1024_x_748.png",
            media: "(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 1)"
        },
        {
            href: "1536_x_2008.png",
            media: "(device-width: 768px) and (device-height: 1024px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 2)"
        },
        {
            href: "2048_x_1496.png",
            media: "(device-width: 768px) and (device-height: 1024px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 2)"
        }
    ].forEach( function ( oSplashscreenData ) {
        var oLinkElement = $document.createElement( "link" );

        oLinkElement.rel = sRelAttribute;
        oLinkElement.href = sBootPath + oSplashscreenData.href;
        oLinkElement.media = oSplashscreenData.media;

        $document.head.insertBefore( oLinkElement, oCurrentScript );
    } );
};
},{"./common.boot.path":2,"./common.boot.script":3}],8:[function(require,module,exports){
"use strict";

module.exports.loadSplashscreen = require( "./common.load.splashscreen" );
module.exports.getBootPath = require( "./common.boot.path" );
module.exports.ConfigUtil = require( "./common.config" );
module.exports.onUI5Init = require( "./common.load.content" );
},{"./common.boot.path":2,"./common.config":4,"./common.load.content":6,"./common.load.splashscreen":7}]},{},[1]);
